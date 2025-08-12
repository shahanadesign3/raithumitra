// deno-lint-ignore-file no-explicit-any
// Edge Function: weather
// Fetches geocoding, current weather and 5-day forecast for a user/location
// Secrets required: OPENWEATHER_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://fmuicnlptuhrqzqjmnwr.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OWM_KEY = Deno.env.get("OPENWEATHER_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...corsHeaders } });
}

async function geocode(village: string, state?: string) {
  const q = state ? `${village},${state},IN` : `${village},IN`;
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${OWM_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Geocode failed: ${r.status}`);
  const [res] = await r.json();
  if (!res) throw new Error("No results for location");
  return { lat: res.lat as number, lon: res.lon as number };
}

async function currentWeather(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Current weather failed: ${r.status}`);
  const data = await r.json();
  const w = data.weather?.[0] ?? {};
  return {
    temp: Math.round(data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? 0),
    wind_kmh: Math.round((data.wind?.speed ?? 0) * 3.6),
    humidity: Math.round(data.main?.humidity ?? 0),
    main: w.main ?? "",
    description: w.description ?? "",
    icon: w.icon ?? "",
  };
}

function dayAbbrFromDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue, ...
}

async function forecast5(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Forecast failed: ${r.status}`);
  const data = await r.json();
  const list: any[] = data.list || [];
  const byDay: Record<string, any[]> = {};
  for (const item of list) {
    const dayKey = (item.dt_txt as string).slice(0, 10); // YYYY-MM-DD
    byDay[dayKey] ??= [];
    byDay[dayKey].push(item);
  }
  const days = Object.keys(byDay).slice(0, 5).map((d) => {
    const items = byDay[d];
    const temps = items.map((i) => i.main?.temp as number).filter((n) => typeof n === "number");
    const high = Math.round(Math.max(...temps));
    const low = Math.round(Math.min(...temps));
    const wind = Math.round(Math.max(...items.map((i) => (i.wind?.speed ?? 0) * 3.6)));
    const rainChance = Math.round(100 * Math.max(...items.map((i) => i.pop ?? 0)));
    const main = (items[0]?.weather?.[0]?.main as string) || "";
    return { date: d, day: dayAbbrFromDate(d), high, low, rainChance, wind, main };
  });
  return days;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SERVICE_ROLE_KEY) return json(500, { error: "Service role key missing" });
    if (!OWM_KEY) return json(500, { error: "OPENWEATHER_API_KEY not set" });

    const body = (await req.json().catch(() => ({}))) as any;
    const { id, village, state } = body || {};

    let resolvedVillage = village as string | undefined;
    let resolvedState = state as string | undefined;

    if (!resolvedVillage && id) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      const { data, error } = await admin.from("user_profiles").select("village,state").eq("id", id).maybeSingle();
      if (error) return json(500, { error: error.message });
      if (!data?.village) return json(400, { error: "No village saved for this user" });
      resolvedVillage = data.village as string;
      resolvedState = data.state as string | undefined;
    }

    if (!resolvedVillage) return json(400, { error: "village is required (or provide id)" });

    const { lat, lon } = await geocode(resolvedVillage!, resolvedState);
    const current = await currentWeather(lat, lon);
    const forecast = await forecast5(lat, lon);

    return json(200, {
      location: { village: resolvedVillage, state: resolvedState ?? null, lat, lon },
      current,
      forecast,
    });
  } catch (e: any) {
    return json(500, { error: e.message || "Unexpected error" });
  }
});
