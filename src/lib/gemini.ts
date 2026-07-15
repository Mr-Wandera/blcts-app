// Calls Gemini via fetch to https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
// using VITE_GEMINI_API_KEY env var
// Returns BlueprintAnalysisResult

import type { BlueprintAnalysisResult } from '../types';

export async function analyzeBlueprint(
  base64Data: string,
  mimeType: string,
  fileName: string
): Promise<BlueprintAnalysisResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  if (!apiKey) {
    return {
      estimatedFloorArea: null,
      floors: null,
      buildingType: null,
      confidence: null,
      observations: ['AI analysis unavailable: GEMINI_API_KEY not configured. Enter floor area manually.'],
      isFallback: true,
    };
  }

  const prompt = `You are a Senior Quantity Surveyor licensed in Kenya analyzing an architectural drawing.

HONESTY RULES:
- Return null for ANY field you cannot determine from this specific drawing
- NEVER invent or estimate measurements you cannot see
- If this is not an architectural drawing, say so in observations

Extract only what is visible:
- estimatedFloorArea: floor area per floor in m² (null if not determinable)
- floors: number of floors/storeys (null if not shown)
- buildingType: one of Residential/Maisonette/Apartment/Commercial/Office/Mixed-Use/Warehouse/School/Hospital/Industrial/Unknown
- confidence: 0.0-1.0 honest confidence in your extraction
- observations: 3-5 specific observations about what you CAN and CANNOT determine
- roomCount: visible room count or null
- bedrooms: visible bedroom count or null
- bathrooms: visible bathroom count or null
- roofType: visible roof type or null
- drawingScale: scale notation visible on drawing or null

Respond with ONLY valid JSON, no markdown.`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64Data } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      }
    );

    if (!resp.ok) {
      return {
        estimatedFloorArea: null,
        floors: null,
        buildingType: null,
        confidence: null,
        observations: [`AI analysis failed (HTTP ${resp.status}). Enter values manually.`],
        isFallback: true,
      };
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response text');

    const parsed = JSON.parse(text);
    return {
      estimatedFloorArea: parsed.estimatedFloorArea ?? null,
      floors: parsed.floors ?? null,
      buildingType: parsed.buildingType ?? null,
      confidence: parsed.confidence ?? null,
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
      isFallback: false,
      roomCount: parsed.roomCount ?? null,
      bedrooms: parsed.bedrooms ?? null,
      bathrooms: parsed.bathrooms ?? null,
      roofType: parsed.roofType ?? null,
      drawingScale: parsed.drawingScale ?? null,
    };
  } catch {
    return {
      estimatedFloorArea: null,
      floors: null,
      buildingType: null,
      confidence: null,
      observations: ['AI analysis encountered an error. Please enter values manually.'],
      isFallback: true,
    };
  }
}
