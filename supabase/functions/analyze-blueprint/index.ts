// supabase/functions/analyze-blueprint/index.ts
// Proxies Google Gemini 2.5 Flash vision analysis of an uploaded blueprint.
// The API key lives server-side as a Supabase secret (GEMINI_API_KEY) so it is
// never exposed to the browser.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const PROMPT = `You are a Senior Quantity Surveyor and Architectural Plan Reviewer practicing in Kenya as an expert Construction Cost Consultant.
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

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    estimatedFloorArea: { type: "number", description: "Total calculated cumulative Gross Floor Area (GFA) across all storeys combined in square meters." },
    floors: { type: "integer", description: "Total integer count of visible building levels." },
    buildingType: { type: "string", description: "Exact matching building classification from the supported list." },
    confidence: { type: "number", description: "Confidence scale decimal parameter bounded between 0.00 and 1.00." },
    observations: { type: "array", items: { type: "string" }, description: "Array of 1 to 5 detailed structural observation metrics." },
    roomCount: { type: "integer", nullable: true },
    bedrooms: { type: "integer", nullable: true },
    bathrooms: { type: "integer", nullable: true },
    roofType: { type: "string", nullable: true },
    drawingScale: { type: "string", nullable: true },
  },
  required: ["estimatedFloorArea", "floors", "buildingType", "confidence", "observations"],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured on the server." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { base64Data, mimeType, fileName } = body as { base64Data?: string; mimeType?: string; fileName?: string };

    if (!base64Data || !mimeType) {
      return new Response(JSON.stringify({ error: "base64Data and mimeType are required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
      return new Response(JSON.stringify({ error: `Unsupported file type: ${mimeType}. Supported: ${SUPPORTED_MIME_TYPES.join(", ")}` }), { status: 415, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ inline_data: { mime_type: mimeType, data: cleanBase64 } }, { text: PROMPT }] }],
          generationConfig: {
            response_mime_type: "application/json",
            responseSchema: RESPONSE_SCHEMA,
            temperature: 0.1,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_LOW_AND_ABOVE" },
          ],
        }),
      }
    );

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error("Gemini API error", { status: geminiResp.status, body: errText });
      return new Response(
        JSON.stringify({ error: `Gemini analysis failed (HTTP ${geminiResp.status}).` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await geminiResp.json();

    if (data?.promptFeedback?.blockReason) {
      return new Response(JSON.stringify({ error: `Prompt blocked by safety filters: ${data.promptFeedback.blockReason}` }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const candidate = data?.candidates?.[0];
    if (!candidate) {
      return new Response(JSON.stringify({ error: "Gemini returned no candidates." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Gemini may return text in parts[0].text or across multiple parts.
    // Also handle finishReason that indicates truncation or safety blocking.
    const parts = candidate?.content?.parts ?? [];
    const text = parts.map((p: { text?: string }) => p?.text ?? "").join("").trim();
    if (!text) {
      const reason = candidate?.finishReason ?? "UNKNOWN";
      if (reason === "SAFETY" || reason === "RECITATION") {
        return new Response(JSON.stringify({ error: `Gemini blocked the response (${reason}). Try a different blueprint.` }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Gemini returned an empty response." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleaned = text.trim().replace(/^```(json)?\s+|\s*```$/gi, "");
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start === -1 || end === -1) {
        return new Response(JSON.stringify({ error: "Gemini returned malformed JSON." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      parsed = JSON.parse(cleaned.substring(start, end + 1));
    }

    return new Response(JSON.stringify({ result: parsed, fileName }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-blueprint error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
