import { supabase } from "@/integrations/supabase/client";
import React, { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only synchronous state updates here
      setAuthed(!!session?.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!authed) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
