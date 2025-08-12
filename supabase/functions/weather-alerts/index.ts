// deno-lint-ignore-file no-explicit-any
// Edge Function: weather-alerts
// Scheduled every 3 hours to send localized critical weather alerts via FCM
// Secrets required: OPENWEATHER_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, FCM_SERVER_KEY

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://fmuicnlptuhrqzqjmnwr.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OWM_KEY = Deno.env.get("OPENWEATHER_API_KEY");
const FCM_KEY = Deno.env.get("FCM_SERVER_KEY");

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
  if (!res) throw new Error("No geocode result");
  return { lat: res.lat as number, lon: res.lon as number };
}

async function forecast(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Forecast failed: ${r.status}`);
  const data = await r.json();
  return (data.list || []) as any[];
}

function classifyAlert(items: any[]) {
  // Look 24h ahead ~ next 8 items (3h steps)
  const windowItems = items.slice(0, 8);
  const maxWindMs = Math.max(...windowItems.map((i) => i.wind?.speed ?? 0), 0);
  const hasThunder = windowItems.some((i) => i.weather?.[0]?.main === "Thunderstorm");
  const heavyRain = windowItems.some((i) => (i.rain?.["3h"] ?? 0) > 10 || (i.pop ?? 0) > 0.8);

  if (hasThunder) return "storm" as const;
  if (maxWindMs >= 12) return "wind" as const; // ~43 km/h
  if (heavyRain) return "rain" as const;
  return null;
}

function t(lang: string, key: string): string {
  const dict: Record<string, Record<string, string>> = {
    en: {
      title_rain: "Heavy Rain Warning",
      body_rain: "Heavy rain expected in the next 24 hours. Prepare drainage.",
      title_wind: "High Wind Warning",
      body_wind: "Strong winds expected in the next 24 hours. Secure equipment.",
      title_storm: "Storm Alert",
      body_storm: "Thunderstorms expected within 24 hours. Stay safe and postpone field work.",
    },
    te: {
      title_rain: "భారీ వర్ష హెచ్చరిక",
      body_rain: "24 గంటల్లో భారీ వర్షం వచ్చే అవకాశం. నీటి పారుదల ఏర్పాట్లు చేసుకోండి.",
      title_wind: "బలమైన గాలుల హెచ్చరిక",
      body_wind: "బలమైన గాలులు 24 గంటల్లో ఉండొచ్చు. పరికరాలను భద్రపరచండి.",
      title_storm: "తుఫాను హెచ్చరిక",
      body_storm: "24 గంటల్లో ఉరుములు/మెరుపులతో వర్షం ఉండొచ్చు. భద్రంగా ఉండండి.",
    },
    hi: {
      title_rain: "भारी बारिश चेतावनी",
      body_rain: "अगले 24 घंटों में भारी बारिश की संभावना। जल निकासी की तैयारी करें।",
      title_wind: "तेज हवा चेतावनी",
      body_wind: "अगले 24 घंटों में तेज हवाएँ। उपकरण सुरक्षित रखें।",
      title_storm: "तूफान चेतावनी",
      body_storm: "अगले 24 घंटों में आंधी-तूफान संभव। सुरक्षित रहें।",
    },
    mr: {
      title_rain: "मुसळधार पावसाची चेतावणी",
      body_rain: "पुढील 24 तासांत मुसळधार पाऊस. पाण्याचा निचरा करा.",
      title_wind: "जोरदार वाऱ्याची चेतावणी",
      body_wind: "पुढील 24 तासांत जोरदार वारे. साधने सुरक्षित ठेवा.",
      title_storm: "वादळाची सूचना",
      body_storm: "पुढील 24 तासांत मेघगर्जनेसह पाऊस. सुरक्षित राहा.",
    },
    ta: {
      title_rain: "கனமழை எச்சரிக்கை",
      body_rain: "அடுத்த 24 மணி நேரத்தில் கன மழை. நீர் வடிகால் தயாராக வைத்துக் கொள்ளவும்.",
      title_wind: "பலமான காற்று எச்சரிக்கை",
      body_wind: "அடுத்த 24 மணி நேரத்தில் பலமான காற்று. உபகரணங்களை பாதுகாப்பாக வையுங்கள்.",
      title_storm: "புயல் எச்சரிக்கை",
      body_storm: "அடுத்த 24 மணி நேரத்தில் இடியுடன் மழை. பாதுகாப்பாக இருங்கள்.",
    },
    kn: {
      title_rain: "ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆ",
      body_rain: "ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆ. ನೀರು ಹೊರಹಾಕುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.",
      title_wind: "ಬಲವಾದ ಗಾಳಿ ಎಚ್ಚರಿಕೆ",
      body_wind: "ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಬಲವಾದ ಗಾಳಿಗಳು. ಉಪಕರಣಗಳನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಿ.",
      title_storm: "ಬಿರುಗಾಳಿ ಎಚ್ಚರಿಕೆ",
      body_storm: "ಮುಂದಿನ 24 ಗಂಟೆಗಳಲ್ಲಿ ಗುಡುಗು ಮಿಂಚಿನ ಮಳೆ. ಸುರಕ್ಷಿತರಾಗಿರಿ.",
    },
  };
  return dict[lang]?.[key] ?? dict.en[key] ?? key;
}

async function sendPush(token: string, title: string, body: string) {
  if (!FCM_KEY) throw new Error("FCM_SERVER_KEY not set");
  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${FCM_KEY}`,
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
      data: { type: "weather_alert" },
      priority: "high",
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("FCM error:", txt);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SERVICE_ROLE_KEY) return json(500, { error: "Service role key missing" });
    if (!OWM_KEY) return json(500, { error: "OPENWEATHER_API_KEY not set" });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: users, error } = await admin
      .from("user_profiles")
      .select("id, state, village, fcm_token, selected_language")
      .not("village", "is", null);

    if (error) return json(500, { error: error.message });

    let notified = 0;

    for (const u of users || []) {
      if (!u?.fcm_token) continue;

      try {
        const { lat, lon } = await geocode(u.village as string, u.state as string | undefined);
        const f = await forecast(lat, lon);
        const kind = classifyAlert(f);
        if (!kind) continue;

        const lang = (u.selected_language as string) || "en";
        const title = t(lang, `title_${kind}`);
        const body = t(lang, `body_${kind}`);
        await sendPush(u.fcm_token as string, title, body);
        notified++;
      } catch (e) {
        console.error("Alert loop error for user", u.id, e);
      }
    }

    return json(200, { success: true, notified });
  } catch (e: any) {
    return json(500, { error: e.message || "Unexpected error" });
  }
});
