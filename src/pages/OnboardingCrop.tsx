import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";
import { getGuestId } from "@/lib/guest";

type CropOption = { value: string; label: string };

const OnboardingCrop = () => {
  const navigate = useNavigate();
  const [crop, setCrop] = useState<string>("");
  const [options, setOptions] = useState<CropOption[]>([]);
  const { t, lang } = useI18n();

  useEffect(() => {
    const loadCrops = async () => {
      const state = localStorage.getItem("userState") || "Andhra Pradesh";
      const village = localStorage.getItem("userLocation") || "";

      let query = supabase
        .from("crop_data")
        .select("crop_name_english, crop_name_telugu, state_english, village_english")
        .eq("state_english", state);

      if (village) query = query.eq("village_english", village);

      const { data, error } = await query.order("crop_name_english", { ascending: true });

      if (error) {
        console.error("Failed to fetch crops:", error);
      }

      let rows = data || [];

      if (!rows.length) {
        const { data: stateOnly } = await supabase
          .from("crop_data")
          .select("crop_name_english, crop_name_telugu, state_english, village_english")
          .eq("state_english", state)
          .order("crop_name_english", { ascending: true });
        rows = stateOnly || [];
      }

      const dedup = new Map<string, { en: string; te?: string }>();
      rows.forEach((r: any) => {
        const en = r.crop_name_english?.trim();
        const te = r.crop_name_telugu?.trim();
        if (en && !dedup.has(en)) dedup.set(en, { en, te });
      });

      let opts: CropOption[] = Array.from(dedup.values()).map(({ en, te }) => ({
        value: en,
        label: lang === "te" && te ? te : en,
      }));

      if (!opts.length) {
        const fallback: Array<{ en: string; te: string }> = [
          { en: "Rice", te: "వరి" },
          { en: "Maize", te: "మొక్కజొన్న" },
          { en: "Groundnut", te: "పల్లి" },
          { en: "Cotton", te: "పత్తి" },
          { en: "Sugarcane", te: "చెరకు" },
          { en: "Chillies", te: "మిరపకాయలు" },
          { en: "Tobacco", te: "పొగాకు" },
          { en: "Turmeric", te: "పసుపు" },
          { en: "Red gram", te: "కందిపప్పు" },
          { en: "Black gram", te: "మినుములు" },
          { en: "Green gram", te: "పెసలు" },
          { en: "Sesame", te: "నువ్వులు" },
          { en: "Sunflower", te: "సూర్యకాంతి" },
          { en: "Jowar", te: "జొన్న" },
          { en: "Bajra", te: "సజ్జలు" },
          { en: "Banana", te: "అరటి" },
          { en: "Mango", te: "మామిడి" },
          { en: "Coconut", te: "కొబ్బరి" },
          { en: "Papaya", te: "బొప్పాయి" },
          { en: "Tomato", te: "టమాటా" },
          { en: "Brinjal", te: "వంకాయ" },
          { en: "Okra", te: "బెండకాయ" },
          { en: "Onion", te: "ఉల్లి" },
        ];
        opts = fallback.map(({ en, te }) => ({ value: en, label: lang === "te" ? te : en }));
      }

      setOptions(opts);
    };

    loadCrops();
  }, [lang]);

  const save = async () => {
    if (!crop) {
      toast({ title: t("onboarding.crop.selectCrop"), description: t("onboarding.crop.subtitle") });
      return;
    }

    // Persist locally for instant UX
    localStorage.setItem("cropType", crop);

    // Prepare payload for guest profile upsert via Edge Function
    const state = localStorage.getItem("userState") || "";
    const village = localStorage.getItem("userLocation") || "";
    
    try {
      const id = getGuestId();
      console.log("Attempting to save guest profile with ID:", id);
      
      // Try edge function first
      try {
        const { data, error } = await supabase.functions.invoke("guest-profile", {
          body: { id, selected_language: lang, state, village, preferred_crop: crop },
        });
        
        console.log("Edge function response:", { data, error });
        
        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }
        
        toast({ title: t("onboarding.crop.saved"), description: t("onboarding.crop.savedDesc", { crop }) });
        navigate("/dashboard");
        return;
      } catch (edgeFunctionError) {
        console.warn("Edge function failed, trying direct database upsert:", edgeFunctionError);
        
        // Fallback: Direct database upsert (this should work with our open RLS policies)
        const { error: dbError } = await supabase
          .from("user_profiles")
          .upsert({
            id,
            selected_language: lang,
            state,
            village,
            preferred_crop: crop,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }
        
        toast({ title: t("onboarding.crop.saved"), description: t("onboarding.crop.savedDesc", { crop }) });
        navigate("/dashboard");
        return;
      }
    } catch (e: any) {
      console.error("All save methods failed:", e);
      toast({ 
        title: t("common.error"), 
        description: e.message || t("common.errors.saveFailed"), 
        variant: "destructive" 
      });
    }
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
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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

