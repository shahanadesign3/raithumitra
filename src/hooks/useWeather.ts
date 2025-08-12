import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getGuestId } from "@/lib/guest";

export type WeatherCurrent = {
  temp: number;
  feelsLike: number;
  wind_kmh: number;
  humidity: number;
  main: string;
  description: string;
  icon: string;
};

export type WeatherForecastDay = {
  date: string;
  day: string; // Mon, Tue, ...
  high: number;
  low: number;
  rainChance: number; // 0-100
  wind: number; // km/h
  main: string;
};

export function useWeather() {
  const [current, setCurrent] = useState<WeatherCurrent | null>(null);
  const [forecast, setForecast] = useState<WeatherForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const id = getGuestId();
        const { data, error } = await supabase.functions.invoke("weather", { body: { id } });
        if (error) throw error;
        if (!data) throw new Error("No data");
        if (!active) return;
        setCurrent(data.current);
        setForecast(data.forecast);
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load weather");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const uiForecast = useMemo(
    () =>
      forecast.map((d) => ({
        day: d.day as "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun",
        high: d.high,
        low: d.low,
        icon: d.main === "Rain" || d.main === "Thunderstorm" ? "rain" : d.main === "Clouds" ? "cloud" : "sun",
        rainChance: d.rainChance,
        wind: d.wind,
      })),
    [forecast]
  );

  return { current, forecast: uiForecast, loading, error };
}
