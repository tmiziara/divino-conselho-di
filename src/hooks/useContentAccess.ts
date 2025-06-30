import { useState, useEffect, useCallback } from 'react';
import { contentAccess, Feature } from '@/lib/contentAccessManager';
import { localStorage } from '@/lib/localStorage';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useContentAccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState<Record<Feature, boolean>>({
    premium_studies: false,
    premium_verses: false,
    spiritual_chat: false,
    advanced_analytics: false,
    offline_access: false,
    export_data: false
  });

  // Verificar acesso a uma funcionalidade específica
  const checkAccess = useCallback(async (feature: Feature): Promise<boolean> => {
    try {
      setIsLoading(true);
      const hasAccess = await contentAccess.canAccess(feature);
      
      setHasAccess(prev => ({
        ...prev,
        [feature]: hasAccess
      }));
      
      return hasAccess;
    } catch (error) {
      console.error(`Error checking access to ${feature}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar conteúdo premium
  const loadPremiumContent = useCallback(async (contentType: string) => {
    try {
      setIsLoading(true);
      
      // Verificar acesso primeiro
      if (!await checkAccess('premium_studies')) {
        toast({
          title: "Assinatura necessária",
          description: "Faça upgrade da sua assinatura para acessar este conteúdo.",
          variant: "destructive"
        });
        return null;
      }
      
      const content = await contentAccess.loadPremiumContent(contentType);
      return content;
    } catch (error) {
      console.error(`Error loading premium content ${contentType}:`, error);
      toast({
        title: "Erro ao carregar conteúdo",
        description: "Não foi possível carregar o conteúdo premium.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkAccess, toast]);

  // Carregar estudo específico
  const loadStudy = useCallback(async (studyId: string) => {
    try {
      setIsLoading(true);
      
      const study = await contentAccess.loadStudy(studyId);
      return study;
    } catch (error) {
      console.error(`Error loading study ${studyId}:`, error);
      
      if (error.message === 'Subscription required') {
        toast({
          title: "Assinatura necessária",
          description: "Faça upgrade da sua assinatura para acessar este estudo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao carregar estudo",
          description: "Não foi possível carregar o estudo.",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Pré-carregar conteúdo essencial
  const preloadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      await contentAccess.preloadEssentialContent();
    } catch (error) {
      console.error('Error preloading content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar acesso inicial
  useEffect(() => {
    if (user) {
      // Verificar acesso a funcionalidades principais
      const checkInitialAccess = async () => {
        await Promise.all([
          checkAccess('premium_studies'),
          checkAccess('spiritual_chat'),
          checkAccess('offline_access')
        ]);
      };
      
      checkInitialAccess();
    } else {
      // Resetar acesso quando não há usuário
      setHasAccess({
        premium_studies: false,
        premium_verses: false,
        spiritual_chat: false,
        advanced_analytics: false,
        offline_access: false,
        export_data: false
      });
    }
  }, [user, checkAccess]);

  // Obter estatísticas de uso
  const getUsageStats = useCallback(() => {
    return contentAccess.getUsageStats();
  }, []);

  // Limpar cache
  const clearCache = useCallback(() => {
    localStorage.clearCache();
    toast({
      title: "Cache limpo",
      description: "O cache foi limpo com sucesso.",
    });
  }, [toast]);

  return {
    isLoading,
    hasAccess,
    checkAccess,
    loadPremiumContent,
    loadStudy,
    preloadContent,
    getUsageStats,
    clearCache
  };
}; 