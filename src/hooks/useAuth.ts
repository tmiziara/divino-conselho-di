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
      // Try to get user profile to validate if user exists in database
      const { error } = await supabase.auth.getUser();
      if (error && error.message.includes("User from sub claim in JWT does not exist")) {
        console.log("[useAuth] Invalid JWT detected - user doesn't exist in database");
        await clearInvalidAuth();
        return false;
      }
      return true;
    } catch (error) {
      console.log("[useAuth] Error validating user:", error);
      return true; // Don't clear auth on network errors
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.log("[useAuth] Session error:", error);
        if (error.message.includes("User from sub claim in JWT does not exist")) {
          await clearInvalidAuth();
          return;
        }
      }

      if (session?.user) {
        const isValid = await validateUserExists(session.user);
        if (isValid) {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state change:", event);
      
      if (session?.user) {
        const isValid = await validateUserExists(session.user);
        if (isValid) {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
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