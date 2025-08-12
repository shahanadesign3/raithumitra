import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farm.jpg";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Farmer Weather Advisor</h1>
        <p className="text-muted-foreground mt-2">Simple forecasts and crop advisories tailored to your fields.</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <img
          src={heroImage}
          alt="Illustration of green farm fields with sunrise and tractor"
          loading="lazy"
          className="w-full max-w-xl rounded-xl shadow-sm"
        />
        <p className="mt-8 text-lg text-muted-foreground max-w-md">
          Get local weather, 5-day forecasts, irrigation and spraying guidance — made farmer-friendly.
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
          <Button variant="hero" size="lg" onClick={() => navigate("/onboarding/location")}>Get Started</Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")}>Skip to Dashboard</Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
