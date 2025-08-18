import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farm.jpg";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <header className="px-6 pt-8 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
          {t("index.title")}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg animate-fade-in delay-100">{t("index.subtitle")}</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center relative z-10">
        <div className="relative group">
          <img
            src={heroImage}
            alt={t("index.title")}
            loading="lazy"
            className="w-full max-w-2xl rounded-2xl shadow-soft group-hover:shadow-hero transition-all duration-500 hover:scale-[1.02] animate-fade-in delay-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <p className="mt-12 text-xl text-muted-foreground max-w-lg leading-relaxed animate-fade-in delay-300">
          {t("index.subtitle")}
        </p>
        
        <div className="mt-12 flex flex-col gap-4 w-full max-w-sm animate-fade-in delay-500">
          <Button 
            variant="hero" 
            size="lg" 
            onClick={() => navigate("/language")}
            className="h-14 text-lg font-semibold tracking-wide hover:scale-105 transition-transform duration-200"
          >
            {t("index.getStarted")}
          </Button>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-8 h-8 mx-auto mb-2 bg-primary/20 rounded-full flex items-center justify-center">
                🌦️
              </div>
              <p className="text-sm font-medium">Weather</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-8 h-8 mx-auto mb-2 bg-accent/20 rounded-full flex items-center justify-center">
                🌱
              </div>
              <p className="text-sm font-medium">Crops</p>
            </div>
            <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <div className="w-8 h-8 mx-auto mb-2 bg-secondary/40 rounded-full flex items-center justify-center">
                📱
              </div>
              <p className="text-sm font-medium">Alerts</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
