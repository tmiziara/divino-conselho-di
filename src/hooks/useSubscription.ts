import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useLocalData } from "./useLocalData";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { localData, syncData, forceSync } = useLocalData();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: "free",
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);

  // Converter dados locais para formato de subscription
  const convertLocalDataToSubscription = (localData: any): SubscriptionData => {
    return {
      subscribed: localData.subscription_status === 'active',
      subscription_tier: localData.subscription_tier || 'free',
      subscription_end: localData.subscription_expires_at,
    };
  };

  // Carregar dados locais primeiro (rápido)
  const loadLocalSubscription = () => {
    if (localData) {
      console.log('[useSubscription] Carregando dados locais:', localData);
      const subscriptionData = convertLocalDataToSubscription(localData);
      setSubscription(subscriptionData);
      setLoading(false);
    }
  };

  // Sincronizar com Supabase em background
  const syncWithSupabase = async () => {
    if (!user?.id) return;

    try {
      console.log('[useSubscription] Iniciando sincronização com Supabase...');
      await syncData(user.id);
    } catch (error) {
      console.error('[useSubscription] Erro na sincronização:', error);
    }
  };

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

    // Carregar dados locais primeiro (rápido)
    loadLocalSubscription();

    // Sincronizar em background (lento)
    syncWithSupabase();
  };

  const createCheckoutSession = async (plan: "premium") => {
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

  // Para mobile - simplificar listeners
  useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent) => {
      console.log('[useSubscription] Dados locais atualizados:', event.detail);
      const subscriptionData = convertLocalDataToSubscription(event.detail);
      setSubscription(subscriptionData);
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate as EventListener);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate as EventListener);
    };
  }, []);

  // Para mobile - carregar dados quando localData mudar
  useEffect(() => {
    if (localData) {
      loadLocalSubscription();
    }
  }, [localData]);

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