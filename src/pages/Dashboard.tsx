import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, CloudRain, Thermometer, Wind, Droplets, Sprout, ShieldAlert, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/i18n";
import { useWeather } from "@/hooks/useWeather";
import { useUserProfile } from "@/hooks/useUserProfile";

type ForecastDay = {
  day: string;
  high: number;
  low: number;
  icon: "sun" | "rain" | "cloud";
  rainChance: number; // 0-100
  wind: number; // km/h
};

const sampleWeather = {
  condition: "Clear Sky",
  temp: 29,
  feelsLike: 31,
  wind: 10,
  humidity: 58,
};

const sampleForecast: ForecastDay[] = [
  { day: "Mon", high: 31, low: 24, icon: "sun", rainChance: 10, wind: 9 },
  { day: "Tue", high: 28, low: 22, icon: "rain", rainChance: 70, wind: 12 },
  { day: "Wed", high: 30, low: 23, icon: "cloud", rainChance: 30, wind: 11 },
  { day: "Thu", high: 27, low: 21, icon: "rain", rainChance: 80, wind: 18 },
  { day: "Fri", high: 32, low: 25, icon: "sun", rainChance: 5, wind: 8 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [alertsEnabled, setAlertsEnabled] = useState<"granted" | "denied" | "default">("default");
  const { current, forecast, loading, error } = useWeather();
  const { profile } = useUserProfile();

  // Get data from profile or fallback to localStorage
  const location = profile?.village && profile?.state 
    ? `${profile.village}, ${profile.state}` 
    : localStorage.getItem("userLocation");
  const crop = profile?.preferred_crop || localStorage.getItem("cropType");

  useEffect(() => {
    if (!profile?.village && !localStorage.getItem("userLocation")) {
      navigate("/onboarding/location");
    } else if (!profile?.preferred_crop && !localStorage.getItem("cropType")) {
      navigate("/onboarding/crop");
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setAlertsEnabled(Notification.permission);
    }
  }, []);

const enableAlerts = async () => {
  if (typeof Notification === "undefined") {
    toast({ title: t("dashboard.alerts.unsupportedTitle"), description: t("dashboard.alerts.unsupportedDesc") });
    return;
  }
  const perm = await Notification.requestPermission();
  setAlertsEnabled(perm);
  if (perm === "granted") {
    new Notification(t("dashboard.alerts.enabledNotifTitle"), { body: t("dashboard.alerts.enabledNotifBody", { location: location || t("dashboard.notSet") }) });
  } else {
    toast({ title: t("dashboard.alerts.disabledTitle"), description: t("dashboard.alerts.disabledDesc") });
  }
};

const advisories = useMemo(() => {
  if (!current) return [];
  
  const conditions = [];
  
  // Temperature-based advisories
  if (current.temp > 35) {
    conditions.push({
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      text: t("dashboard.advisories.heatWave")
    });
  }
  
  // Rain-based advisories  
  if (current.main === "Rain" || current.main === "Thunderstorm") {
    conditions.push({
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      text: t("dashboard.advisories.rain")
    });
  }
  
  // Dynamic planting advisories based on weather conditions
  const temp = current.temp;
  const humidity = current.humidity;
  const isRainy = current.main === "Rain" || current.main === "Thunderstorm";
  const isClear = current.main === "Clear" || current.main === "Clouds";
  
  // Ideal conditions: 20-30°C, not too humid, not rainy
  if (temp >= 20 && temp <= 30 && humidity < 80 && !isRainy && isClear) {
    conditions.push({
      icon: <Sprout className="w-5 h-5 text-green-500" />,
      text: t("dashboard.advisories.ideal")
    });
  }
  // Good conditions: 18-35°C, moderate conditions
  else if (temp >= 18 && temp <= 35 && humidity < 85 && !isRainy) {
    conditions.push({
      icon: <Sprout className="w-5 h-5 text-yellow-500" />,
      text: t("dashboard.advisories.good")
    });
  }
  // Not ideal conditions
  else {
    conditions.push({
      icon: <Sprout className="w-5 h-5 text-red-500" />,
      text: t("dashboard.advisories.notIdeal")
    });
  }
  
  return conditions;
}, [current, t]);

  const conditionKey = useMemo(() => {
    const main = current?.main;
    const desc = (current?.description || "").toLowerCase();
    if (main === "Clear") return "Sunny";
    if (main === "Clouds") return "Clouds";
    if (main === "Rain" || main === "Drizzle") return desc.includes("heavy") ? "Heavy Rain" : "Light Rain";
    return main || "Sunny";
  }, [current]);

  const IconFor = (name: ForecastDay["icon"]) => {
    switch (name) {
      case "rain":
        return <CloudRain className="text-primary" />;
      case "cloud":
        return <CloudRain className="text-muted-foreground" />;
      default:
        return <Sun className="text-primary" />;
    }
  };

  const dayKey = (abbr: string): string => {
    const map: Record<string, string> = { Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat", Sun: "sun" };
    return map[abbr] || abbr.toLowerCase();
  };
  return (
    <div className="min-h-screen">
      <header className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("index.title")}</div>
          <h1 className="text-2xl font-bold">{location || t("dashboard.notSet")}</h1>
          <p className="text-muted-foreground">{t("dashboard.primaryCropLabel", { crop: crop || t("dashboard.notSet") })}</p>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="px-6 pb-16 space-y-8">
        {/* Current Weather */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">{t("dashboard.currentWeather")}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Thermometer className="" />
              <span>{(current?.temp ?? sampleWeather.temp)}°C</span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3"><Sun className="text-primary" /><div><div className="font-semibold">{t(`dashboard.conditions.${conditionKey}`)}</div><div className="text-sm text-muted-foreground">{t("dashboard.labels.feelsLike", { temp: (current?.feelsLike ?? sampleWeather.feelsLike) })}</div></div></div>
            <div className="flex items-center gap-3"><Wind className="text-primary" /><div><div className="font-semibold">{t("dashboard.labels.wind")}</div><div className="text-sm text-muted-foreground">{(current?.wind_kmh ?? sampleWeather.wind)} km/h</div></div></div>
            <div className="flex items-center gap-3"><Droplets className="text-primary" /><div><div className="font-semibold">{t("dashboard.labels.humidity")}</div><div className="text-sm text-muted-foreground">{(current?.humidity ?? sampleWeather.humidity)}%</div></div></div>
          </CardContent>
        </Card>

        {/* 5-Day Forecast */}
        <section>
          <h2 className="text-lg font-semibold mb-3">{t("dashboard.forecast")}</h2>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {(forecast.length ? forecast : sampleForecast).map((d) => (
              <Card key={d.day}>
                <CardContent className="py-4 flex flex-col items-center gap-1">
                  <div className="text-sm text-muted-foreground">{t(`days.short.${dayKey(d.day)}`)}</div>
                  <div className="w-6 h-6">{IconFor(d.icon)}</div>
                  <div className="text-sm font-medium">{d.high}° / {d.low}°</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Advisories */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Advisories</h2>
          <div className="grid grid-cols-1 gap-4">
            {advisories.map((advisory, i) => (
              <Card key={i}>
                <CardContent className="py-4 flex items-start gap-3">
                  {advisory.icon}
                  <div>
                    <div className="text-sm text-muted-foreground">{advisory.text}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("dashboard.alerts.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.alerts.desc")}</p>
          </div>
          {alertsEnabled !== "granted" ? (
            <Button variant="hero" onClick={enableAlerts}>{t("dashboard.alerts.enable")}</Button>
          ) : (
            <Button variant="secondary" disabled>{t("dashboard.alerts.enabled")}</Button>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
