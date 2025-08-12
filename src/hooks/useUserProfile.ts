import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserProfile = {
  id: string;
  state: string | null;
  village: string | null;
  preferred_crop: string | null;
  fcm_token: string | null;
  selected_language: string | null;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (mounted) setProfile(data as UserProfile | null);
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const save = async (updates: Partial<UserProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const payload = { id: user.id, ...updates } as Partial<UserProfile> & { id: string };
    const { data, error } = await supabase.from("user_profiles").upsert(payload).select().maybeSingle();
    if (error) throw error;
    setProfile(data as UserProfile);
    return data as UserProfile;
  };

  return { profile, loading, error, save };
}
