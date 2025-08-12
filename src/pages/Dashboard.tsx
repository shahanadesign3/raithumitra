import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, CloudRain, Thermometer, Wind, Droplets, Sprout, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/i18n";

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

  const location = localStorage.getItem("userLocation");
  const crop = localStorage.getItem("cropType");

  useEffect(() => {
    if (!location) navigate("/onboarding/location");
    else if (!crop) navigate("/onboarding/crop");
  }, [location, crop, navigate]);

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
  const rainSoon = sampleForecast.some((d) => d.rainChance >= 70);
  const highWind = sampleForecast.some((d) => d.wind >= 20);
  const goodPlanting = sampleWeather.temp >= 20 && sampleWeather.temp <= 32 && !highWind;

  const cropLabel = crop || t("dashboard.notSet");

  return [
    goodPlanting
      ? {
          title: t("dashboard.advisory.planting.goodTitle", { crop: cropLabel }),
          desc: t("dashboard.advisory.planting.goodDesc", { temp: sampleWeather.temp, feels: sampleWeather.feelsLike }),
          Icon: Sprout,
        }
      : {
          title: t("dashboard.advisory.planting.badTitle"),
          desc: t("dashboard.advisory.planting.badDesc", { crop: cropLabel }),
          Icon: Sprout,
        },
    rainSoon
      ? {
          title: t("dashboard.advisory.irrigation.goodTitle", { crop: cropLabel }),
          desc: t("dashboard.advisory.irrigation.goodDesc"),
          Icon: Droplets,
        }
      : {
          title: t("dashboard.advisory.irrigation.badTitle", { crop: cropLabel }),
          desc: t("dashboard.advisory.irrigation.badDesc"),
          Icon: Droplets,
        },
    highWind
      ? {
          title: t("dashboard.advisory.spraying.badTitle"),
          desc: t("dashboard.advisory.spraying.badDesc"),
          Icon: ShieldAlert,
        }
      : {
          title: t("dashboard.advisory.spraying.goodTitle"),
          desc: t("dashboard.advisory.spraying.goodDesc", { crop: cropLabel }),
          Icon: ShieldAlert,
        },
  ];
}, [crop]);

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

  return (
    <div className="min-h-screen">
      <header className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
        <div>
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
              <span>{sampleWeather.temp}°C</span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3"><Sun className="text-primary" /><div><div className="font-semibold">{t(`dashboard.conditions.${sampleWeather.condition}`)}</div><div className="text-sm text-muted-foreground">{t("dashboard.labels.feelsLike", { temp: sampleWeather.feelsLike })}</div></div></div>
            <div className="flex items-center gap-3"><Wind className="text-primary" /><div><div className="font-semibold">{t("dashboard.labels.wind")}</div><div className="text-sm text-muted-foreground">{sampleWeather.wind} km/h</div></div></div>
            <div className="flex items-center gap-3"><Droplets className="text-primary" /><div><div className="font-semibold">{t("dashboard.labels.humidity")}</div><div className="text-sm text-muted-foreground">{sampleWeather.humidity}%</div></div></div>
          </CardContent>
        </Card>

        {/* 5-Day Forecast */}
        <section>
          <h2 className="text-lg font-semibold mb-3">{t("dashboard.forecast")}</h2>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {sampleForecast.map((d) => (
              <Card key={d.day}>
                <CardContent className="py-4 flex flex-col items-center gap-1">
                  <div className="text-sm text-muted-foreground">{d.day}</div>
                  <div className="w-6 h-6">{IconFor(d.icon)}</div>
                  <div className="text-sm font-medium">{d.high}° / {d.low}°</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Advisories */}
        <section>
          <h2 className="text-lg font-semibold mb-3">{t("dashboard.advisories")}</h2>
          <div className="grid grid-cols-1 gap-4">
            {advisories.map(({ title, desc, Icon }, i) => (
              <Card key={i}>
                <CardContent className="py-4 flex items-start gap-3">
                  <Icon className="text-primary" />
                  <div>
                    <div className="font-semibold">{title}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
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
