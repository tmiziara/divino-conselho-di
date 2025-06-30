import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSubscription, clearSubscriptionCache } from "@/lib/subscriptionSingleton";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

interface SubscriptionProviderProps {
  children: ReactNode;
  initialSubscription?: SubscriptionData;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | undefined;
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

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children, initialSubscription }) => {
  console.log("[SubscriptionProvider] montado");
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | undefined>(initialSubscription);
  const [loading, setLoading] = useState(!initialSubscription);
  const userIdRef = useRef<string | null>(user?.id || null);

  useEffect(() => {
    if (!user) {
      setSubscription(undefined);
      setLoading(false);
      clearSubscriptionCache();
      userIdRef.current = null;
      return;
    }
    // Se já existe valor carregado, nunca mostra loading
    if (subscription && userIdRef.current === user.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    userIdRef.current = user.id;
    getSubscription(user.id, async () => {
      console.log('[SubscriptionProvider] Buscando assinatura do usuário', user.id);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return {
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || "free",
        subscription_end: data.subscription_end || null,
      };
    })
      .then((data) => {
        setSubscription(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.id]);

  const refreshSubscription = async () => {
    if (!user) return;
    await getSubscription(user.id, async () => {
      console.log('[SubscriptionProvider] Refresh assinatura do usuário', user.id);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return {
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || "free",
        subscription_end: data.subscription_end || null,
      };
    })
      .then(setSubscription);
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

  // Memoizar o valor do contexto para evitar re-renders e múltiplos fetches
  const value = useMemo(() => ({
    subscription,
    loading,
    refreshSubscription,
    createCheckoutSession,
    openCustomerPortal,
  }), [subscription, loading]);

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