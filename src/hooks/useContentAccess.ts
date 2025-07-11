import { useSubscription } from './useSubscription';
import { useLocalData } from './useLocalData';
import { useAuth } from './useAuth';

export const useContentAccess = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { localData, syncStatus } = useLocalData();

  // Determinar se o usuário tem acesso premium
  const hasPremiumAccess = () => {
    // Se não há usuário, não tem acesso premium
    if (!user) return false;

    // Se ainda está carregando, usar dados locais se disponíveis
    if (subscriptionLoading) {
      if (localData) {
        return localData.subscription_status === 'active' && 
               (localData.subscription_tier === 'premium' || localData.subscription_tier === 'basic');
      }
      return false; // Aguardar carregamento
    }

    // Usar dados da subscription (que já inclui dados locais)
    return subscription.subscribed && 
           (subscription.subscription_tier === 'premium' || subscription.subscription_tier === 'basic');
  };

  // Verificar se a assinatura está ativa
  const isSubscriptionActive = () => {
    if (!user) return false;

    if (subscriptionLoading) {
      if (localData) {
        return localData.subscription_status === 'active';
      }
      return false;
    }

    return subscription.subscribed;
  };

  // Verificar se é usuário premium
  const isPremiumUser = () => {
    if (!user) return false;

    if (subscriptionLoading) {
      if (localData) {
        return localData.subscription_tier === 'premium';
      }
      return false;
    }

    return subscription.subscription_tier === 'premium';
  };

  // Verificar se é usuário básico
  const isBasicUser = () => {
    if (!user) return false;

    if (subscriptionLoading) {
      if (localData) {
        return localData.subscription_tier === 'basic';
      }
      return false;
    }

    return subscription.subscription_tier === 'basic';
  };

  // Verificar se é usuário gratuito
  const isFreeUser = () => {
    if (!user) return true;

    if (subscriptionLoading) {
      if (localData) {
        return localData.subscription_tier === 'free';
      }
      return true; // Assumir gratuito durante carregamento
    }

    return subscription.subscription_tier === 'free';
  };

  // Verificar se os dados estão prontos
  const isDataReady = () => {
    if (!user) return true; // Usuário não autenticado - dados prontos
    if (subscriptionLoading) return false; // Ainda carregando
    return true; // Dados prontos
  };

  // Status de sincronização
  const getSyncStatus = () => {
    return {
      isSyncing: syncStatus.isSyncing,
      lastSync: syncStatus.lastSync,
      error: syncStatus.error,
      hasLocalData: !!localData
    };
  };

  return {
    hasPremiumAccess,
    isSubscriptionActive,
    isPremiumUser,
    isBasicUser,
    isFreeUser,
    isDataReady,
    getSyncStatus,
    subscription,
    localData,
    loading: subscriptionLoading
  };
}; 