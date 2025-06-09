import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  loading: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user) {
      setSubscription({ subscribed: false, loading: false });
      return;
    }

    try {
      setSubscription(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar o status da assinatura",
        variant: "destructive",
      });
      setSubscription({ subscribed: false, loading: false });
    }
  };

  const createCheckout = async (tier: 'padrao' | 'premium') => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para assinar",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de pagamento",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerenciar sua assinatura",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal do cliente",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    ...subscription,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};