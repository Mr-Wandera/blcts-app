// src/lib/gemini.ts
import type { BlueprintAnalysisResult } from '../types';

// ============================================================================
// 1. IMUTABLE MAPPING REGISTRIES & SCHEMAS
// ============================================================================
const SUPPORTED_BUILDING_TYPES = [
  'Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office', 
  'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial', 'Unknown'
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
  Industrial: ['industrial plant', 'factory', 'mill', 'workshop']
};

// Strict JSON Schema mirroring the destination model contract for native execution constraints
const responseSchemaSpecification = {
  type: 'object',
  properties: {
    estimatedFloorArea: { type: 'number', description: 'Total calculated cumulative Gross Floor Area (GFA) across all storeys combined in square meters.' },
    floors: { type: 'integer', description: 'Total integer count of visible building levels.' },
    buildingType: { type: 'string', description: 'Exact matching building classification from the supported list.' },
    confidence: { type: 'number', description: 'Confidence scale decimal parameter bounded between 0.00 and 1.00.' },
    observations: { type: 'array', items: { type: 'string' }, description: 'Array of 1 to 5 detailed structural observation metrics.' },
    roomCount: { type: 'integer', nullable: true },
    bedrooms: { type: 'integer', nullable: true },
    bathrooms: { type: 'integer', nullable: true },
    roofType: { type: 'string', nullable: true },
    drawingScale: { type: 'string', nullable: true }
  },
  required: ['estimatedFloorArea', 'floors', 'buildingType', 'confidence', 'observations']
};

// ============================================================================
// 2. DOMAIN POST-PROCESSING VALIDATION HELPERS
// ============================================================================
function parseBoundedNumber(val: unknown, min: number, max: number): number | null {
  if (typeof val === 'number' && Number.isFinite(val) && !Number.isNaN(val)) {
    return (val >= min && val <= max) ? val : null;
  }
  return null;
}

function parseBoundedInt(val: unknown, min: number): number | null {
  if (typeof val === 'number' && Number.isFinite(val) && !Number.isNaN(val)) {
    return (val >= min) ? Math.floor(val) : null;
  }
  return null;
}

function normalizeBuildingType(rawType: unknown): string {
  if (typeof rawType !== 'string') return 'Unknown';
  const normalized = rawType.trim().toLowerCase();
  if (normalized.length === 0) return 'Unknown';

  for (const [targetKey, patterns] of Object.entries(BUILDING_TYPE_PATTERNS)) {
    if (patterns.some(pattern => normalized.includes(pattern))) {
      return targetKey;
    }
  }

  const directMatch = SUPPORTED_BUILDING_TYPES.find(t => t.toLowerCase() === normalized);
  return directMatch || 'Unknown';
}

function extractSanitizedJSON(rawText: string): string {
  let cleaned = rawText.trim();
  
  // High-performance boundary cleanup avoiding heavy regular expressions matching profiles
  cleaned = cleaned.replace(/^```(json)?\s+|\s*```$/gi, '');
  cleaned = cleaned.trim();

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    return cleaned;
  }

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
    throw new Error('JsonBoundariesNotFound');
  }

  return cleaned.substring(startIdx, endIdx + 1);
}

// ============================================================================
// 3. MAIN AI BLUEPRINT INTERPRETATION WORKFLOW
// ============================================================================
export async function analyzeBlueprint(
  base64Data: string,
  mimeType: string,
  fileName: string
): Promise<BlueprintAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!supportedMimeTypes.includes(mimeType)) {
    return {
      estimatedFloorArea: null,
      floors: null,
      buildingType: null,
      confidence: null,
      observations: ['AI Ingestion rejected: Unsupported blueprint document format type.'],
      isFallback: true,
    };
  }

  if (!apiKey) {
    return {
      estimatedFloorArea: null,
      floors: null,
      buildingType: null,
      confidence: null,
      observations: ['AI analysis unavailable: VITE_GEMINI_API_KEY environment configuration missing.'],
      isFallback: true,
    };
  }

  // Safely extract raw Base64 blocks by stripping Data URL prefixes if present
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  const prompt = `You are a Senior Quantity Surveyor and Architectural Plan Reviewer practicing in Kenya as an expert Construction Cost Consultant.
Analyze the attached drawing sheet with absolute technical precision.

HONESTY & LOGIC RULES:
- Return null for ANY field you cannot determine with absolute visual certainty. Never invent or estimate metrics.
- Ensure room metrics, floor bounds, and types match logically (e.g., room counts must align with the buildingType).
- Lower your confidence score and report explicit details if evidence conflicts or components are illegible.

GROSS FLOOR AREA (GFA) EVIDENCE CASCADE:
Determine the total progressive Gross Floor Area (GFA) using this strict evidence priority path:
- TIER 1: Locate an explicit inscription stating total cumulative area across all storeys combined (e.g., "Gross Floor Area", "Plinth Area", "Total Area", "GFA").
- TIER 2: Total the individual areas listed in an explicit tabular room/accommodation schedule.
- TIER 3: Compute footprint area size metrics using overall perimeter dimension lines (Length x Width) if both values are visible.
- TIER 4: Deduce from scaled geometry ONLY if a scale notation and measurement references are legible.
- TIER 5: If no explicit evidence is visible, return null for estimatedFloorArea.

CRITICAL MECHANICAL RULES:
- Respond with a SINGLE valid JSON object matching the requested properties schema fields without wrapping lines or markdown fences.`;

  let resp: Response | null = null;
  const maxRetryAttempts = 2;
  const baseDelayMs = 1000;
  const maxBackoffMs = 8000;

  for (let attempt = 0; attempt <= maxRetryAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: cleanBase64 } }, { text: prompt }] }],
            generationConfig: {
              response_mime_type: 'application/json',
              responseSchema: responseSchemaSpecification,
              temperature: 0.1
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
            ]
          }),
        }
      );

      clearTimeout(timeoutId);

      const transientStatuses = [429, 500, 502, 503, 504];
      if (transientStatuses.includes(resp.status) && attempt < maxRetryAttempts) {
        const backoffCalculated = Math.min(maxBackoffMs, baseDelayMs * Math.pow(2, attempt));
        const backoffWithJitter = backoffCalculated * (0.5 + Math.random() * 0.5);
        await new Promise(res => setTimeout(res, backoffWithJitter));
        continue;
      }
      break;
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (attempt < maxRetryAttempts) {
        const backoffCalculated = Math.min(maxBackoffMs, baseDelayMs * Math.pow(2, attempt));
        const backoffWithJitter = backoffCalculated * (0.5 + Math.random() * 0.5);
        await new Promise(res => setTimeout(res, backoffWithJitter));
        continue;
      }
      throw fetchErr;
    }
  }

  try {
    if (!resp || !resp.ok) {
      const statusCode = resp?.status ?? 'NO_RESPONSE';
      console.error('BlueprintAnalysisFailure', { status: statusCode, context: 'EndpointRejectedPayload' });
      return {
        estimatedFloorArea: null,
        floors: null,
        buildingType: null,
        confidence: null,
        observations: [`AI analysis failed (HTTP ${statusCode}). Enter parameters manually.`],
        isFallback: true,
      };
    }

    const data = await resp.json();
    
    if (data?.promptFeedback?.blockReason) {
      console.error('BlueprintAnalysisFailure', { context: 'PromptBlockedBySafetyFilters', reason: data.promptFeedback.blockReason });
      throw new Error('PromptBlockedBySafetyFilters');
    }

    if (!data?.candidates || data.candidates.length === 0) {
      console.error('BlueprintAnalysisFailure', { context: 'NoCandidatesReturned' });
      throw new Error('NoCandidatesReturned');
    }

    const candidate = data.candidates[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
      console.error('BlueprintAnalysisFailure', { context: 'ModelExecutionInterrupted', reason: candidate.finishReason });
      throw new Error('ModelExecutionInterrupted');
    }

    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) throw new Error('EmptyResponsePayload');

    let parsed: Record<string, unknown>;
    try {
      const jsonString = extractSanitizedJSON(text);
      parsed = JSON.parse(jsonString) as Record<string, unknown>;
    } catch (parseError) {
      console.error('JSONParsingFailure', { context: 'MalformedModelOutput' });
      throw parseError;
    }

    const validatedFloorArea = parseBoundedNumber(parsed.estimatedFloorArea, 0, 500000);
    const validatedFloors = parseBoundedInt(parsed.floors, 1);
    const validatedConfidence = parseBoundedNumber(parsed.confidence, 0, 1.0);
    const validatedBuildingType = normalizeBuildingType(parsed.buildingType);

    let validatedObservations = Array.isArray(parsed.observations)
      ? parsed.observations
          .map(o => (typeof o === 'string' ? o.trim() : ''))
          .filter(o => o.length > 0)
          .slice(0, 5)
      : [];

    if (validatedObservations.length === 0) {
      validatedObservations = ['Blueprint documentation verification complete. Manual dimensional confirmation recommended.'];
    }

    return {
      estimatedFloorArea: validatedFloorArea,
      floors: validatedFloors,
      buildingType: validatedBuildingType,
      confidence: validatedConfidence,
      observations: validatedObservations,
      isFallback: false,
      roomCount: parseBoundedInt(parsed.roomCount, 0),
      bedrooms: parseBoundedInt(parsed.bedrooms, 0),
      bathrooms: parseBoundedInt(parsed.bathrooms, 0),
      roofType: typeof parsed.roofType === 'string' ? parsed.roofType.trim() : null,
      drawingScale: typeof parsed.drawingScale === 'string' ? parsed.drawingScale.trim() : null,
    };
  } catch (error: unknown) {
    console.error('MetadataExtractionFailure', {
      error: error instanceof Error ? error.message : 'UnknownException'
    });
    
    return {
      estimatedFloorArea: null,
      floors: null,
      buildingType: null,
      confidence: null,
      observations: ['AI interpretation engine was unable to parse blueprint context configurations. Please fill out details manually.'],
      isFallback: true,
    };
  }
}