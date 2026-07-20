// supabase/functions/confirm-signup/index.ts
// Auto-confirms a freshly-registered user's email so they can sign in
// immediately without clicking an email link. Email confirmation is enabled
// on the project and the confirmation redirect page is broken; this bypasses
// that friction for the demo. Uses the service role key (server-side only).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!serviceRoleKey || !supabaseUrl) {
      return new Response(JSON.stringify({ error: "Server not configured." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email } = body as { email?: string };
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "email is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Only confirm accounts created in the last 5 minutes to limit abuse.
    const { data: users, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return new Response(JSON.stringify({ error: "Unable to query users." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = email.trim().toLowerCase();
    const target = (users.users ?? []).find(
      (u) => (u.email ?? "").toLowerCase() === normalized
    );

    if (!target) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const createdMs = new Date(target.created_at).getTime();
    const ageMs = Date.now() - createdMs;
    if (ageMs > 5 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: "Account is older than the confirmation window." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(target.id, {
      email_confirm: true,
    });
    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to confirm user." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ confirmed: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
