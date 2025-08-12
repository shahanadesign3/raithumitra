import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/i18n/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OnboardingLocation from "./pages/OnboardingLocation";
import OnboardingCrop from "./pages/OnboardingCrop";
import Dashboard from "./pages/Dashboard";
import LanguageSelect from "./pages/LanguageSelect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LanguageSelect />} />
            <Route path="/language" element={<LanguageSelect />} />
            <Route path="/welcome" element={<Index />} />
            <Route path="/onboarding/location" element={<OnboardingLocation />} />
            <Route path="/onboarding/crop" element={<OnboardingCrop />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
