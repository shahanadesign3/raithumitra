import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const crops = ["Rice", "Maize", "Cotton", "Groundnut"];

const OnboardingCrop = () => {
  const navigate = useNavigate();
  const [crop, setCrop] = useState<string>("");

  const save = () => {
    if (!crop) {
      toast({ title: "Select a crop", description: "Please choose your primary crop." });
      return;
    }
    localStorage.setItem("cropType", crop);
    toast({ title: "Crop saved", description: `${crop} set as your primary crop.` });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 pt-8">
        <h1 className="text-2xl font-bold">Select Your Crop</h1>
        <p className="text-muted-foreground mt-1">Choose the crop you primarily grow to tailor advisories.</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label>Primary Crop</Label>
            <Select onValueChange={(v) => setCrop(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" className="flex-1" onClick={save}>Save</Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingCrop;
