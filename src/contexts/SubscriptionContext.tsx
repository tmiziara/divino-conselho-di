import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (plan: "basico" | "premium") => Promise<any>;
  openCustomerPortal: () => Promise<any>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Cache global para evitar múltiplas chamadas
let subscriptionCache: {
  data: SubscriptionData | null;
  timestamp: number;
  userId: string | null;
} = {
  data: null,
  timestamp: 0,
  userId: null
};

// Cache válido por 10 minutos
const CACHE_DURATION = 10 * 60 * 1000;

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: "free",
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);

  const checkSubscription = async (forceRefresh = false) => {
    // Se não há usuário, resetar para estado padrão
    if (!user) {
      setSubscription({
        subscribed: false,
        subscription_tier: "free",
        subscription_end: null,
      });
      setLoading(false);
      // Limpar cache quando não há usuário
      subscriptionCache = { data: null, timestamp: 0, userId: null };
      return;
    }

    // Verificar cache
    const now = Date.now();
    const isCacheValid = subscriptionCache.data && 
                        subscriptionCache.userId === user.id &&
                        (now - subscriptionCache.timestamp) < CACHE_DURATION;

    if (isCacheValid && !forceRefresh) {
      console.log('[SubscriptionContext] Using cached data');
      setSubscription(subscriptionCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.log('[SubscriptionContext] Error checking subscription:', error);
        
        // Check if it's an authentication error (invalid JWT)
        if (error.message?.includes('Edge Function returned a non-2xx status code')) {
          console.log('[SubscriptionContext] Detected invalid authentication, will be handled by useAuth');
          setLoading(false);
          return;
        }
        
        // For other errors, set default state
        const defaultState = {
          subscribed: false,
          subscription_tier: "free",
          subscription_end: null,
        };
        setSubscription(defaultState);
        // Não cachear dados de erro
        subscriptionCache = { data: null, timestamp: 0, userId: null };
      } else if (data) {
        console.log('[SubscriptionContext] Subscription data received:', data);
        const subscriptionData = {
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || "free",
          subscription_end: data.subscription_end || null,
        };
        
        setSubscription(subscriptionData);
        
        // Cachear os dados
        subscriptionCache = {
          data: subscriptionData,
          timestamp: now,
          userId: user.id
        };
      }
    } catch (error) {
      console.log('[SubscriptionContext] Error invoking subscription check:', error);
      const defaultState = {
        subscribed: false,
        subscription_tier: "free",
        subscription_end: null,
      };
      setSubscription(defaultState);
      // Não cachear dados de erro
      subscriptionCache = { data: null, timestamp: 0, userId: null };
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription(true);
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

  const value = {
    subscription,
    loading,
    refreshSubscription,
    createCheckoutSession,
    openCustomerPortal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 