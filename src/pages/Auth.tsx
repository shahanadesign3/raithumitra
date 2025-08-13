import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";

const Auth = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `${t("index.title")} — ${mode === "login" ? t("auth.login") : t("auth.signup")}`;
  }, [mode, t]);

  const redirectAfter = () => {
    // Always send users to onboarding first; dashboard will redirect if already set
    window.location.href = "/onboarding/location";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast({ title: t("auth.checkEmailTitle"), description: t("auth.checkEmailDesc") });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) redirectAfter();
      }
    } catch (err: any) {
      toast({ title: t("common.error"), description: err?.message || t("auth.error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      cleanupAuthState();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/onboarding/location` },
      });
      if (error) throw error;
      // redirect handled by provider
    } catch (err: any) {
      toast({ title: t("common.error"), description: err?.message || t("auth.error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pb-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {mode === "login" ? t("auth.login") : t("auth.signup")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {mode === "login" ? t("auth.login") : t("auth.signup")}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3"><Separator className="flex-1" /><span className="text-xs text-muted-foreground">{t("auth.or")}</span><Separator className="flex-1" /></div>

          <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle} disabled={loading}>
            Continue with Google
          </Button>

          <div className="mt-4 text-sm text-center">
            {mode === "login" ? (
              <button className="underline" onClick={() => setMode("signup")}>
                {t("auth.noAccount")} {t("auth.signup")}
              </button>
            ) : (
              <button className="underline" onClick={() => setMode("login")}>
                {t("auth.haveAccount")} {t("auth.login")}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
