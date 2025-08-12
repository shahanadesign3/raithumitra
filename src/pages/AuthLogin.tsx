import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";

const AuthLogin: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Google sign-in failed", description: error.message || "Please try again.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-md py-10">
      <h1 className="text-2xl font-semibold mb-6">Log In</h1>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign In"}</Button>
      </form>
      <div className="my-4 text-center">or</div>
      <Button variant="secondary" onClick={handleGoogle} disabled={loading} className="w-full">Continue with Google</Button>
      <p className="mt-6 text-sm">
        Don't have an account? <a className="underline" href="/auth/signup">Sign up</a>
      </p>
    </main>
  );
};

export default AuthLogin;
