import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farm.jpg";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("index.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("index.subtitle")}</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <img
          src={heroImage}
          alt={t("index.title")}
          loading="lazy"
          className="w-full max-w-xl rounded-xl shadow-sm"
        />
        <p className="mt-8 text-lg text-muted-foreground max-w-md">
          {t("index.subtitle")}
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => navigate("/onboarding/location")}>
            {t("index.getStarted")}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
