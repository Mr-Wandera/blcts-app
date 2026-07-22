// src/lib/gemini.ts
// Calls the Supabase edge function `analyze-blueprint` which proxies Google
// Gemini 2.5 Flash. The API key stays server-side; the browser never sees it.
import type { BlueprintAnalysisResult } from '../types';
import { supabase } from './supabase';

function parseBoundedNumber(val: unknown, min: number, max: number): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return val >= min && val <= max ? val : null;
  }
  return null;
}

function parseBoundedInt(val: unknown, min: number): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return val >= min ? Math.floor(val) : null;
  }
  return null;
}

const SUPPORTED_BUILDING_TYPES = [
  'Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office',
  'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial', 'Unknown',
];

const BUILDING_TYPE_PATTERNS: Record<string, string[]> = {
  Maisonette: ['maisonette', 'maisonet'],
  Apartment: ['apartment', 'flat', 'apartments', 'block of flats'],
  Residential: ['bungalow', 'residential house', 'dwelling', 'residential building', 'home', 'villa', 'estate'],
  Commercial: ['retail', 'shop', 'shopping centre', 'commercial complex', 'mall', 'plaza', 'arcade', 'bazaar'],
  Office: ['office block', 'office building', 'hq', 'offices', 'workspace'],
  'Mixed-Use': ['mixed development', 'mixed use', 'mixed-use', 'commercial-residential', 'multi-use', 'mixed-use complex'],
  Warehouse: ['warehouse', 'godown', 'store', 'facility', 'depot'],
  School: ['school block', 'educational building', 'academy', 'college', 'university', 'institution', 'classroom'],
  Hospital: ['hospital block', 'medical centre', 'clinic', 'dispensary', 'center', 'sanatorium', 'infirmary'],
  Industrial: ['industrial plant', 'factory', 'mill', 'workshop'],
};

function normalizeBuildingType(rawType: unknown): string {
  if (typeof rawType !== 'string') return 'Unknown';
  const normalized = rawType.trim().toLowerCase();
  if (!normalized) return 'Unknown';
  for (const [targetKey, patterns] of Object.entries(BUILDING_TYPE_PATTERNS)) {
    if (patterns.some(p => normalized.includes(p))) return targetKey;
  }
  return SUPPORTED_BUILDING_TYPES.find(t => t.toLowerCase() === normalized) || 'Unknown';
}

export async function analyzeBlueprint(
  base64Data: string,
  mimeType: string,
  _fileName: string
): Promise<BlueprintAnalysisResult> {
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session.session?.access_token;

  const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
  const apiUrl = `${baseUrl}/functions/v1/analyze-blueprint`;

  // Abort after 90s so the UI never gets stuck in a permanent loading state.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  let resp: Response;
  try {
    resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken ?? anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ base64Data, mimeType, fileName: _fileName }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') {
      throw new Error('AI analysis timed out. Please try again.');
    }
    throw new Error('Network error — could not reach the analysis service. Please check your connection and try again.');
  }
  clearTimeout(timeoutId);

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errBody.error || `Analysis failed (HTTP ${resp.status})`);
  }

  const payload = await resp.json();

  // The edge function returns { result, fileName }. Guard against unexpected shapes.
  const parsed: Record<string, unknown> =
    (payload && typeof payload === 'object' && payload.result && typeof payload.result === 'object')
      ? payload.result as Record<string, unknown>
      : {};

  const observations = Array.isArray(parsed.observations)
    ? parsed.observations.map((o: unknown) => (typeof o === 'string' ? o.trim() : '')).filter((o: string) => o.length > 0).slice(0, 5)
    : [];

  return {
    estimatedFloorArea: parseBoundedNumber(parsed.estimatedFloorArea, 0, 500000),
    floors: parseBoundedInt(parsed.floors, 1),
    buildingType: normalizeBuildingType(parsed.buildingType),
    confidence: parseBoundedNumber(parsed.confidence, 0, 1),
    observations: observations.length > 0 ? observations : ['Blueprint analysis complete.'],
    roomCount: parseBoundedInt(parsed.roomCount, 0),
    bedrooms: parseBoundedInt(parsed.bedrooms, 0),
    bathrooms: parseBoundedInt(parsed.bathrooms, 0),
    roofType: typeof parsed.roofType === 'string' && parsed.roofType.trim() ? parsed.roofType.trim() : null,
    drawingScale: typeof parsed.drawingScale === 'string' && parsed.drawingScale.trim() ? parsed.drawingScale.trim() : null,
  };
}
