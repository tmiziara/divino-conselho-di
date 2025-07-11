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
        console.log('[LocalData] Dados locais carregados:', data);
        return data;
      }
    } catch (error) {
      console.error('[LocalData] Erro ao carregar dados locais:', error);
    }
    return null;
  }, []);

  // Salvar dados locais
  const saveLocalData = useCallback((data: LocalUserData) => {
    try {
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
      setLocalData(data);
      console.log('[LocalData] Dados locais salvos:', data);
    } catch (error) {
      console.error('[LocalData] Erro ao salvar dados locais:', error);
    }
  }, []);

  // Buscar dados do Supabase
  const fetchSupabaseData = useCallback(async (userId: string): Promise<LocalUserData | null> => {
    try {
      console.log('[LocalData] Buscando dados do Supabase para usuário:', userId);
      
      // Buscar dados do perfil do usuário (que contém informações de assinatura)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[LocalData] Erro ao buscar perfil:', profileError);
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

      console.log('[LocalData] Dados do Supabase obtidos:', supabaseData);
      return supabaseData;
    } catch (error) {
      console.error('[LocalData] Erro ao buscar dados do Supabase:', error);
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
        console.log(`[LocalData] Dados diferentes no campo ${field}:`, {
          local: local[field as keyof LocalUserData],
          remote: remote[field as keyof LocalUserData]
        });
        return false;
      }
    }

    console.log('[LocalData] Dados idênticos, sem necessidade de atualização');
    return true;
  }, []);

  // Sincronizar dados em background
  const syncData = useCallback(async (userId: string, force = false) => {
    if (syncStatus.isSyncing && !force) {
      console.log('[LocalData] Sincronização já em andamento, ignorando');
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      console.log('[LocalData] Iniciando sincronização...');
      
      const supabaseData = await fetchSupabaseData(userId);
      if (!supabaseData) {
        throw new Error('Não foi possível obter dados do Supabase');
      }

      const currentLocalData = loadLocalData();
      
      if (!currentLocalData || force || !compareData(currentLocalData, supabaseData)) {
        console.log('[LocalData] Atualizando dados locais com dados do Supabase');
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

      console.log('[LocalData] Sincronização concluída com sucesso');
    } catch (error) {
      console.error('[LocalData] Erro na sincronização:', error);
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
      console.log('[LocalData] Dados locais limpos');
    } catch (error) {
      console.error('[LocalData] Erro ao limpar dados locais:', error);
    }
  }, []);

  // Listener para login do usuário
  useEffect(() => {
    const handleUserLogin = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log('[LocalData] Usuário logado, inicializando dados para:', userId);
      
      // Forçar sincronização inicial
      syncData(userId, true);
    };

    const handleUserLogout = () => {
      console.log('[LocalData] Usuário deslogado, limpando dados locais...');
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
      console.log('[LocalData] Sincronização única para mobile');
      syncData(localData.user_id);
    };

    // Aguardar 2 segundos antes da primeira sincronização
    const timer = setTimeout(syncOnce, 2000);

    return () => clearTimeout(timer);
  }, [localData?.user_id, syncData]);

  // Função para forçar sincronização
  const forceSync = useCallback((userId: string) => {
    console.log('[LocalData] Forçando sincronização...');
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