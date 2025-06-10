import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: "free",
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({
        subscribed: false,
        subscription_tier: "free",
        subscription_end: null,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.log('[useSubscription] Error checking subscription:', error);
        
        // Check if it's an authentication error (invalid JWT)
        if (error.message?.includes('Edge Function returned a non-2xx status code')) {
          console.log('[useSubscription] Detected invalid authentication, will be handled by useAuth');
          // Don't set subscription state here, let useAuth handle the invalid token
          setLoading(false);
          return;
        }
        
        // For other errors, set default state
        setSubscription({
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null,
        });
        setLoading(false);
        return;
      }

      if (data) {
        console.log('[useSubscription] Subscription data received:', data);
        setSubscription({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || "free",
          subscription_end: data.subscription_end || null,
        });
      }
    } catch (error) {
      console.log('[useSubscription] Error invoking subscription check:', error);
      setSubscription({
        subscribed: false,
        subscription_tier: "free",
        subscription_end: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: "basico" | "premium") => {
    if (!user) throw new Error("User must be authenticated");

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { plan },
    });

    if (error) throw error;
    return data;
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error("User must be authenticated");

    const { data, error } = await supabase.functions.invoke('customer-portal');
    
    if (error) throw error;
    return data;
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };
};