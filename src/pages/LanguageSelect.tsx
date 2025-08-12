import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGS = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
] as const;

const LanguageSelect = () => {
  const { setLang, t } = useI18n();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("");
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    document.title = `${t("index.title")} — ${t("languageSelect.title")}`;
  }, [t]);

  const onChoose = (code: string) => {
    setLang(code as any);
    setSelected(code);
    setShowConsent(true);
  };

  const handleAllow = async () => {
    if (typeof Notification !== "undefined") {
      await Notification.requestPermission();
    }
    setShowConsent(false);
    navigate("/welcome");
  };

  const handleDeny = () => {
    setShowConsent(false);
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-16">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("index.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("languageSelect.title")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {LANGS.map((l) => (
          <Button key={l.code} variant="hero" className="py-6 text-base" onClick={() => onChoose(l.code)}>
            {l.label}
          </Button>
        ))}
      </div>

      {showConsent && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">{t("notifications.permissionTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("notifications.permissionBody")}</p>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" variant="hero" onClick={handleAllow}>{t("notifications.allow")}</Button>
              <Button className="flex-1" variant="outline" onClick={handleDeny}>{t("notifications.deny")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;
