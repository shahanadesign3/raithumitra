// deno-lint-ignore-file no-explicit-any
// Edge Function: guest-profile
// Upserts a guest profile into public.user_profiles using the service role key.
// Configure secrets in Supabase Dashboard: SUPABASE_SERVICE_ROLE
// Optionally set SUPABASE_URL; fallback to project URL constant below.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://fmuicnlptuhrqzqjmnwr.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

function jsonResponse(status: number, data: any, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "content-type": "application/json", 
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS", 
      "access-control-allow-headers": "content-type, authorization, x-client-info, apikey",
      ...headers 
    },
  });
}

serve(async (req) => {
  console.log(`Received ${req.method} request to guest-profile`);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight");
    return new Response(null, {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type, authorization, x-client-info, apikey",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  if (!SERVICE_ROLE_KEY) {
    return jsonResponse(500, { error: "Service role key not configured" });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  console.log("Received payload:", body);
  const { id, selected_language, state, village, preferred_crop, fcm_token } = body || {};
  if (!id || typeof id !== "string") {
    return jsonResponse(400, { error: "Missing id" });
  }
  // Basic UUID v4 validation
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidV4.test(id)) {
    return jsonResponse(400, { error: "id must be a UUID v4" });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  console.log("Attempting upsert with admin client");
  const { error } = await admin
    .from("user_profiles")
    .upsert(
      {
        id,
        selected_language: selected_language ?? null,
        state: state ?? null,
        village: village ?? null,
        preferred_crop: preferred_crop ?? null,
        fcm_token: fcm_token ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("Database error:", error);
    return jsonResponse(500, { error: error.message });
  }

  console.log("Profile upserted successfully");
  return jsonResponse(200, { success: true });
});
