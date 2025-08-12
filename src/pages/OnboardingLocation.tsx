import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const OnboardingLocation = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      toast({ title: "Enter a location", description: "Please type your village/city or pincode." });
      return;
    }
    localStorage.setItem("userLocation", value.trim());
    toast({ title: "Location saved", description: `${value.trim()} set as your primary location.` });
    navigate("/onboarding/crop");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-2xl font-bold">Set Your Location</h1>
        <p className="text-muted-foreground mt-1">Enter your village/city name (e.g., Namburu) or pincode.</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <form onSubmit={onSave} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Village/City or Pincode</Label>
            <Input
              id="location"
              placeholder="e.g., Namburu or 522508"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Location input"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="hero" className="flex-1">Save Location</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default OnboardingLocation;
