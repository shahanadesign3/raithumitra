import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useI18n } from "@/i18n/i18n";

const crops = ["Rice", "Maize", "Cotton", "Groundnut"];

const OnboardingCrop = () => {
  const navigate = useNavigate();
  const [crop, setCrop] = useState<string>("");
  const { t } = useI18n();

  const save = () => {
    if (!crop) {
      toast({ title: t("onboarding.crop.selectCrop"), description: t("onboarding.crop.subtitle") });
      return;
    }
    localStorage.setItem("cropType", crop);
    toast({ title: t("onboarding.crop.saved"), description: t("onboarding.crop.savedDesc", { crop }) });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-2xl font-bold">{t("onboarding.crop.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("onboarding.crop.subtitle")}</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label>{t("onboarding.crop.primaryCrop")}</Label>
            <Select onValueChange={(v) => setCrop(v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("onboarding.crop.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {crops.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" className="flex-1" onClick={save}>{t("onboarding.crop.save")}</Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>{t("common.back")}</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingCrop;
