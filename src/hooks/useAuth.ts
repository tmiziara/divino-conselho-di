import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearInvalidAuth = async () => {
    console.log("[useAuth] Clearing invalid authentication state");
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const validateUserExists = async (currentUser: User) => {
    try {
      // Simplified validation - only clear auth on specific JWT errors
      const { error } = await supabase.auth.getUser();
      if (error && error.message.includes("JWT expired")) {
        console.log("[useAuth] JWT expired - refreshing session");
        return true; // Let Supabase handle token refresh
      }
      return true;
    } catch (error) {
      console.log("[useAuth] Error validating user:", error);
      return true; // Don't clear auth on errors
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.log("[useAuth] Session error:", error);
        // Only clear auth on very specific errors
        if (error.message.includes("User from sub claim in JWT does not exist")) {
          await clearInvalidAuth();
          return;
        }
      }

      // Set user from session without extensive validation
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state change:", event);
      
      // Simplified auth state handling
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log("[useAuth] Manual sign out");
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
  };
};