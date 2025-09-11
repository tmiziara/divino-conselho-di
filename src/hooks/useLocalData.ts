import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocalUserData {
  subscription_tier: 'free' | 'premium' | 'basic';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_expires_at: string | null;
  last_sync: string;
  user_id: string;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSync: string | null;
  error: string | null;
}

const LOCAL_DATA_KEY = 'local_user_data';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

export const useLocalData = () => {
  const [localData, setLocalData] = useState<LocalUserData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSync: null,
    error: null
  });

  // Carregar dados locais
  const loadLocalData = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_DATA_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setLocalData(data);
        return data;
      }
    } catch (error) {
    }
    return null;
  }, []);

  // Salvar dados locais
  const saveLocalData = useCallback((data: LocalUserData) => {
    try {
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
      setLocalData(data);
    } catch (error) {
    }
  }, []);

  // Buscar dados do Supabase
  const fetchSupabaseData = useCallback(async (userId: string): Promise<LocalUserData | null> => {
    try {
      
      // Buscar dados do perfil do usuário (que contém informações de assinatura)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return null;
      }

      // Buscar dados de assinatura da tabela subscribers
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Determinar tier e status da assinatura
      let subscription_tier: 'free' | 'premium' | 'basic' = 'free';
      let subscription_status: 'active' | 'inactive' | 'cancelled' = 'inactive';
      let subscription_expires_at: string | null = null;

      if (subscriberData && !subscriberError) {
        subscription_tier = (subscriberData.subscription_tier as any) || 'free';
        subscription_status = subscriberData.subscribed ? 'active' : 'inactive';
        subscription_expires_at = subscriberData.subscription_end;
      } else if (profileData) {
        // Fallback para dados do perfil
        subscription_status = profileData.subscription_status as any || 'inactive';
        subscription_expires_at = profileData.subscription_expires_at;
      }

      const supabaseData: LocalUserData = {
        subscription_tier,
        subscription_status,
        subscription_expires_at,
        last_sync: new Date().toISOString(),
        user_id: userId
      };

      return supabaseData;
    } catch (error) {
      return null;
    }
  }, []);

  // Comparar dados locais com Supabase
  const compareData = useCallback((local: LocalUserData, remote: LocalUserData): boolean => {
    const fieldsToCompare = [
      'subscription_tier',
      'subscription_status',
      'subscription_expires_at'
    ];

    for (const field of fieldsToCompare) {
      if (local[field as keyof LocalUserData] !== remote[field as keyof LocalUserData]) {
        return false;
      }
    }

    return true;
  }, []);

  // Sincronizar dados em background
  const syncData = useCallback(async (userId: string, force = false) => {
    if (syncStatus.isSyncing && !force) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      
      const supabaseData = await fetchSupabaseData(userId);
      if (!supabaseData) {
        throw new Error('Não foi possível obter dados do Supabase');
      }

      const currentLocalData = loadLocalData();
      
      if (!currentLocalData || force || !compareData(currentLocalData, supabaseData)) {
        saveLocalData(supabaseData);
        
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('userDataUpdated', {
          detail: supabaseData
        }));
      }

      setSyncStatus({
        isSyncing: false,
        lastSync: new Date().toISOString(),
        error: null
      });

    } catch (error) {
      setSyncStatus({
        isSyncing: false,
        lastSync: syncStatus.lastSync,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }, [syncStatus.isSyncing, syncStatus.lastSync, loadLocalData, saveLocalData, fetchSupabaseData, compareData]);

  // Função para limpar dados locais
  const clearLocalData = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_DATA_KEY);
      setLocalData(null);
    } catch (error) {
    }
  }, []);

  // Listener para login do usuário
  useEffect(() => {
    const handleUserLogin = (event: CustomEvent) => {
      const { userId } = event.detail;
      
      // Forçar sincronização inicial
      syncData(userId, true);
    };

    const handleUserLogout = () => {
      clearLocalData();
    };

    window.addEventListener('userLoggedIn', handleUserLogin as EventListener);
    window.addEventListener('userLoggedOut', handleUserLogout);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin as EventListener);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, [syncData, clearLocalData]);

  // Inicializar dados locais
  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  // Para mobile - sincronização menos frequente
  useEffect(() => {
    if (!localData?.user_id) return;

    // Sincronizar apenas uma vez por sessão para mobile
    const syncOnce = () => {
      syncData(localData.user_id);
    };

    // Aguardar 2 segundos antes da primeira sincronização
    const timer = setTimeout(syncOnce, 2000);

    return () => clearTimeout(timer);
  }, [localData?.user_id, syncData]);

  // Função para forçar sincronização
  const forceSync = useCallback((userId: string) => {
    syncData(userId, true);
  }, [syncData]);

  return {
    localData,
    syncStatus,
    syncData,
    forceSync,
    clearLocalData,
    loadLocalData
  };
}; 