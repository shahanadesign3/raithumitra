import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { IN_STATES, STATE_CITIES } from "@/data/locations";
import { useI18n } from "@/i18n/i18n";

const OnboardingLocation = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const defaultState = "Andhra Pradesh";
  const [stateSel, setStateSel] = useState<string>(defaultState);
  const cities = useMemo(() => STATE_CITIES[stateSel] || [], [stateSel]);
  const [city, setCity] = useState<string>("Namburu");

  useEffect(() => {
    if (!cities.length) {
      setCity("");
      return;
    }
    // Ensure a valid default city (prefer Namburu if available)
    if (!city || !cities.includes(city)) {
      const preferred = cities.includes("Namburu") ? "Namburu" : cities[0];
      setCity(preferred || "");
    }
  }, [stateSel]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateSel) {
      toast({ title: t("onboarding.location.stateMissing"), description: t("onboarding.location.enterPrompt") });
      return;
    }
    if (!city) {
      toast({ title: t("onboarding.location.cityMissing"), description: t("onboarding.location.enterPrompt") });
      return;
    }

    localStorage.setItem("userState", stateSel);
    localStorage.setItem("userLocation", city);
    toast({ title: t("onboarding.location.saved"), description: t("onboarding.location.savedDesc", { place: city }) });
    navigate("/onboarding/crop");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-2xl font-bold">{t("onboarding.location.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("onboarding.location.subtitle")}</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <form onSubmit={onSave} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="state">{t("onboarding.location.selectState")}</Label>
            <Select value={stateSel} onValueChange={(v) => setStateSel(v)}>
              <SelectTrigger id="state">
                <SelectValue placeholder={t("onboarding.location.selectState")} />
              </SelectTrigger>
              <SelectContent>
                {IN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{lang === "en" ? s : t(`states.${s}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t("onboarding.location.selectCity")}</Label>
            <Select value={city} onValueChange={(v) => setCity(v)} disabled={cities.length === 0}>
              <SelectTrigger id="city">
                <SelectValue placeholder={cities.length ? t("onboarding.location.selectCity") : t("onboarding.location.unavailable")} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{lang === "en" ? c : (t(`cities.AP.${c}`) || c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="hero" className="flex-1">{t("onboarding.location.saveLocation")}</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>{t("common.back")}</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default OnboardingLocation;
