import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "te";

type Dict = Record<string, any>;

const en: Dict = {
  common: {
    language: "Language",
    english: "English",
    telugu: "తెలుగు",
    save: "Save",
    back: "Back",
  },
  index: {
    title: "Farmer Weather Advisor",
    subtitle: "Simple forecasts and crop advisories tailored to your fields.",
    getStarted: "Get Started",
    skip: "Skip to Dashboard",
  },
  onboarding: {
    location: {
      title: "Set Your Location",
      subtitle: "Choose your State and Village/City.",
      selectState: "Select State",
      selectCity: "Select Village/City",
      saveLocation: "Save Location",
      enterPrompt: "Please select both state and village/city.",
      saved: "Location saved",
      savedDesc: "{place} set as your primary location.",
      stateMissing: "Select a state",
      cityMissing: "Select a village/city",
      unavailable: "City list for this state is coming soon.",
    },
    crop: {
      title: "Select Your Crop",
      subtitle: "Choose the crop you primarily grow to tailor advisories.",
      primaryCrop: "Primary Crop",
      placeholder: "Select a crop",
      selectCrop: "Select a crop",
      saved: "Crop saved",
      savedDesc: "{crop} set as your primary crop.",
      save: "Save",
    },
  },
  dashboard: {
    primaryCropLabel: "Primary crop: {crop}",
    notSet: "Not set",
    currentWeather: "Current Weather",
    forecast: "5-Day Forecast",
    advisories: "Advisories",
    alerts: {
      title: "Critical Weather Alerts",
      desc: "Get notified about heavy rain, frost, or storms.",
      enable: "Enable Alerts",
      enabled: "Alerts Enabled",
      unsupportedTitle: "Alerts unsupported",
      unsupportedDesc: "Your browser does not support notifications.",
      disabledTitle: "Alerts disabled",
      disabledDesc: "You can change notification permissions in your browser settings.",
      enabledNotifTitle: "Weather alerts enabled",
      enabledNotifBody: "You'll receive critical alerts for {location}.",
    },
    conditions: {
      "Clear Sky": "Clear Sky",
      "Light Rain": "Light Rain",
      "Heavy Rain": "Heavy Rain",
      "Sunny": "Sunny",
      "Clouds": "Cloudy",
    },
    labels: {
      condition: "Condition",
      wind: "Wind",
      humidity: "Humidity",
      feelsLike: "Feels like {temp}°C",
    },
    advisory: {
      planting: {
        goodTitle: "Ideal for planting {crop}",
        goodDesc: "Temperature {temp}–{feels}°C. Light winds. Soil moisture favourable.",
        badTitle: "Planting not ideal today",
        badDesc: "Wait for cooler temps or lighter winds for best germination of {crop}.",
      },
      irrigation: {
        goodTitle: "No irrigation needed for {crop}",
        goodDesc: "Heavy rain expected within 24–48 hours. Conserve water and prepare drainage.",
        badTitle: "Irrigate {crop} today",
        badDesc: "No rain expected. Monitor soil moisture and irrigate as needed.",
      },
      spraying: {
        badTitle: "Avoid spraying pesticides/fertilizers",
        badDesc: "High winds expected — risk of drift/runoff. Reschedule spraying for calmer conditions.",
        goodTitle: "Good conditions for spraying",
        goodDesc: "Low wind and no rain expected. Suitable for targeted application on {crop}.",
      },
    },
  },
};

const te: Dict = {
  common: {
    language: "భాష",
    english: "English",
    telugu: "తెలుగు",
    save: "సేవ్",
    back: "వెనక్కి",
  },
  index: {
    title: "రైతు వాతావరణ సలహాదారు",
    subtitle: "మీ పొలాలకు సరిపోయే వాతావరణం మరియు పంట సలహాలు.",
    getStarted: "ప్రారంభించండి",
    skip: "డాష్‌బోర్డ్‌కి వెళ్లండి",
  },
  onboarding: {
    location: {
      title: "మీ ప్రదేశాన్ని సెట్ చేయండి",
      subtitle: "మీ రాష్ట్రం మరియు గ్రామం/నగరాన్ని ఎంచుకోండి.",
      selectState: "రాష్ట్రాన్ని ఎంచుకోండి",
      selectCity: "గ్రామం/నగరాన్ని ఎంచుకోండి",
      saveLocation: "ప్రదేశాన్ని సేవ్ చేయండి",
      enterPrompt: "దయచేసి రాష్ట్రం మరియు గ్రామం/నగరాన్ని ఎంచుకోండి.",
      saved: "ప్రదేశం సేవ్ చేయబడింది",
      savedDesc: "{place} మీ ప్రాథమిక ప్రదేశంగా సెట్ చేయబడింది.",
      stateMissing: "రాష్ట్రాన్ని ఎంచుకోండి",
      cityMissing: "గ్రామం/నగరాన్ని ఎంచుకోండి",
      unavailable: "ఈ రాష్ట్రానికి నగరాల జాబితా త్వరలో అందుబాటులో ఉంటుంది.",
    },
    crop: {
      title: "మీ పంటను ఎంచుకోండి",
      subtitle: "మీరు ప్రధానంగా పండించే పంటను ఎంచుకోండి.",
      primaryCrop: "ప్రధాన పంట",
      placeholder: "పంటను ఎంచుకోండి",
      selectCrop: "పంటను ఎంచుకోండి",
      saved: "పంట సేవ్ చేయబడింది",
      savedDesc: "{crop} మీ ప్రధాన పంటగా సెట్ చేయబడింది.",
      save: "సేవ్",
    },
  },
  dashboard: {
    primaryCropLabel: "ప్రధాన పంట: {crop}",
    notSet: "సెట్ చేయలేదు",
    currentWeather: "ప్రస్తుత వాతావరణం",
    forecast: "5-రోజుల సూచన",
    advisories: "సలహాలు",
    alerts: {
      title: "తీవ్ర వాతావరణ హెచ్చరికలు",
      desc: "భారీ వర్షం, మంచు, తుఫానులకు సంబంధించిన సూచనలు పొందండి.",
      enable: "అలర్ట్స్ ప్రారంభించండి",
      enabled: "అలర్ట్స్ ప్రారంభించబడ్డాయి",
      unsupportedTitle: "అలర్ట్స్ అందుబాటులో లేవు",
      unsupportedDesc: "మీ బ్రౌజర్ నోటిఫికేషన్లను మద్దతు ఇవ్వదు.",
      disabledTitle: "అలర్ట్స్ నిలిపివేయబడ్డాయి",
      disabledDesc: "బ్రౌజర్ సెట్టింగ్స్‌లో మీరు మార్పులు చేయవచ్చు.",
      enabledNotifTitle: "వాతావరణ అలర్ట్స్ ప్రారంభించబడ్డాయి",
      enabledNotifBody: "{location} కోసం మీరు సూచనలు పొందుతారు.",
    },
    conditions: {
      "Clear Sky": "స్పష్టమైన ఆకాశం",
      "Light Rain": "చిన్నపాటి వర్షం",
      "Heavy Rain": "భారీ వర్షం",
      "Sunny": "ఎండగా ఉంది",
      "Clouds": "మేఘావృతం",
    },
    labels: {
      condition: "పరిస్థితి",
      wind: "గాలి",
      humidity: "ఆర్ద్రత",
      feelsLike: "అనిపించే ఉష్ణోగ్రత {temp}°C",
    },
    advisory: {
      planting: {
        goodTitle: "{crop} నాటడానికి అనుకూలం",
        goodDesc: "ఉష్ణోగ్రత {temp}–{feels}°C. తేలికపాటి గాలులు. నేల తడిగా ఉంది.",
        badTitle: "ఈరోజు నాటడం అనుకూలం కాదు",
        badDesc: "ఉష్ణోగ్రతలు తగ్గేవరకు లేదా గాలులు తగ్గేవరకు వేచి ఉండండి ({crop}).",
      },
      irrigation: {
        goodTitle: "{crop} కి నీరు అవసరం లేదు",
        goodDesc: "24–48 గంటల్లో భారీ వర్షం వచ్చే అవకాశం. నీరు ఆదా చేయండి.",
        badTitle: "ఈరోజు {crop} కి నీరు పెట్టండి",
        badDesc: "వర్షం లేదు. నేల తడిని చూసుకుని నీరు పెట్టండి.",
      },
      spraying: {
        badTitle: "ఈరోజు పురుగుల మందును స్ప్రే చేయవద్దు",
        badDesc: "బలమైన గాలులు — ఔషధం వేరే చోటుకు వెళ్లే ప్రమాదం. వాయిదా వేసుకోండి.",
        goodTitle: "స్ప్రే చేయడానికి మంచిన పరిస్థితులు",
        goodDesc: "తక్కువ గాలి, వర్షం లేదు. {crop} పై లక్ష్యంగా స్ప్రే చేయండి.",
      },
    },
  },
};

const dictionaries: Record<Lang, Dict> = { en, te };

function interpolate(str: string, params?: Record<string, any>) {
  if (!params) return str;
  return str.replace(/\{(.*?)\}/g, (_, k) => (params[k] ?? `{${k}}`).toString());
}

function getPath(dict: Dict, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), dict);
}

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("appLang") as Lang) || "en");

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("appLang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, any>) => {
      const value = getPath(dictionaries[lang], key) ?? getPath(dictionaries.en, key) ?? key;
      if (typeof value === "string") return interpolate(value, params);
      return key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
