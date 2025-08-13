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
import FCMInitializer from "@/components/FCMInitializer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <FCMInitializer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LanguageSelect />} />
            <Route path="/language" element={<LanguageSelect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/login" element={<Auth />} />
            <Route path="/auth/signup" element={<Auth />} />
            <Route path="/welcome" element={<Index />} />
            <Route path="/onboarding/location" element={<ProtectedRoute><OnboardingLocation /></ProtectedRoute>} />
            <Route path="/onboarding/crop" element={<ProtectedRoute><OnboardingCrop /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
