import React, { useEffect, useRef, useState } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';
import { useSubscription } from '@/hooks/useSubscription';

interface AdMobBannerProps {
  className?: string;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({ className = '' }) => {
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bannerShownRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<any[]>([]);

  // ID do banner de produção
  const BANNER_AD_ID = "ca-app-pub-7772749408418204/7297967059";

  // Função para mostrar o banner
  const showBanner = async () => {
    // VERIFICAÇÃO DUPLA: nunca mostrar para premium
    if (subscription?.subscription_tier === "premium") {
      console.log('[AdMobBanner] Tentativa de mostrar banner para usuário premium - BLOQUEADO');
      return;
    }

    if (bannerShownRef.current || isLoading) {
      console.log('[AdMobBanner] Banner já está visível ou carregando');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[AdMobBanner] Tentando mostrar banner...');
      
      await AdMob.showBanner({
        adId: BANNER_AD_ID,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: false,
      });

      bannerShownRef.current = true;
      setIsVisible(true);
      setIsLoading(false);
      
      // Salvar estado no localStorage
      localStorage.setItem('admob_banner_shown', 'true');
      
      console.log('[AdMobBanner] Banner exibido com sucesso');
    } catch (err) {
      console.error('[AdMobBanner] Erro ao mostrar banner:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsLoading(false);
      
      // Tentar novamente após 5 segundos (apenas para usuários gratuitos)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = setTimeout(() => {
        if (!bannerShownRef.current && subscription?.subscription_tier !== "premium") {
          showBanner();
        }
      }, 5000);
    }
  };

  // Função para ocultar o banner
  const hideBanner = async () => {
    if (!bannerShownRef.current) {
      return;
    }

    try {
      await AdMob.hideBanner();
      bannerShownRef.current = false;
      setIsVisible(false);
      localStorage.removeItem('admob_banner_shown');
      console.log('[AdMobBanner] Banner ocultado com sucesso');
    } catch (err) {
      console.error('[AdMobBanner] Erro ao ocultar banner:', err);
    }
  };

  // Configurar listeners para eventos do banner
  const setupListeners = async () => {
    try {
      // Listener para quando o banner é carregado
      const loadedListener = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('[AdMobBanner] Banner carregado com sucesso');
        setIsLoading(false);
      });

      // Listener para quando o banner é fechado
      const closedListener = await AdMob.addListener(BannerAdPluginEvents.Closed, () => {
        console.log('[AdMobBanner] Banner fechado');
        bannerShownRef.current = false;
        setIsVisible(false);
        localStorage.removeItem('admob_banner_shown');
      });

      // Listener para quando o banner falha ao carregar
      const failedListener = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
        console.log('[AdMobBanner] Banner falhou ao carregar:', err);
        setIsLoading(false);
        setError('Falha ao carregar banner');
        
        // Tentar novamente após 10 segundos (apenas para usuários gratuitos)
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          if (!bannerShownRef.current && subscription?.subscription_tier !== "premium") {
            showBanner();
          }
        }, 10000);
      });

      // Listener para quando o banner é impressionado
      const impressionListener = await AdMob.addListener(BannerAdPluginEvents.AdImpression, () => {
        console.log('[AdMobBanner] Banner impressionado');
      });

      listenersRef.current = [loadedListener, closedListener, failedListener, impressionListener];
      console.log('[AdMobBanner] Listeners configurados com sucesso');
    } catch (err) {
      console.error('[AdMobBanner] Erro ao configurar listeners:', err);
    }
  };

  // PRINCIPAL: Gerenciar visibilidade do banner baseado no status da assinatura
  useEffect(() => {
    if (subscriptionLoading) {
      console.log('[AdMobBanner] Carregando assinatura...');
      return;
    }

    console.log('[AdMobBanner] Status da assinatura atualizado:', {
      tier: subscription?.subscription_tier,
      subscribed: subscription?.subscribed,
      isPremium: subscription?.subscription_tier === "premium"
    });

    const manageBanner = async () => {
      if (subscription?.subscription_tier === "premium") {
        // USUÁRIO PREMIUM: SEMPRE ocultar banner e limpar tudo
        console.log('[AdMobBanner] Usuário premium detectado - ocultando banner e limpando localStorage');
        
        // Limpar localStorage imediatamente
        localStorage.removeItem('admob_banner_shown');
        
        // Resetar estado interno
        bannerShownRef.current = false;
        setIsVisible(false);
        
        // SEMPRE tentar ocultar o banner (mesmo que não esteja no estado interno)
        try {
          await AdMob.hideBanner();
          console.log('[AdMobBanner] Banner nativo ocultado para usuário premium');
        } catch (err) {
          console.log('[AdMobBanner] Banner já estava oculto ou erro ao ocultar:', err);
        }
        
        console.log('[AdMobBanner] Banner ocultado e estado limpo para usuário premium');
      } else {
        // USUÁRIO GRATUITO: mostrar banner se não estiver visível
        if (!bannerShownRef.current) {
          console.log('[AdMobBanner] Usuário gratuito - mostrando banner');
          await showBanner();
        }
      }
    };

    manageBanner();
  }, [subscription?.subscription_tier, subscriptionLoading]);

  // Configurar listeners quando o componente montar
  useEffect(() => {
    setupListeners();

    return () => {
      // Limpar listeners
      listenersRef.current.forEach(listener => {
        if (listener && typeof listener.remove === 'function') {
          listener.remove();
        }
      });

      // Limpar timeout de retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // VERIFICAÇÃO INMEDIATA: sempre ocultar banner para usuários premium
  useEffect(() => {
    if (!subscriptionLoading && subscription?.subscription_tier === "premium") {
      console.log('[AdMobBanner] Verificação imediata: usuário premium - ocultando banner');
      
      // Limpar localStorage
      localStorage.removeItem('admob_banner_shown');
      
      // Tentar ocultar banner nativo
      AdMob.hideBanner().catch(err => {
        console.log('[AdMobBanner] Banner já estava oculto na verificação imediata');
      });
    }
  }, [subscriptionLoading, subscription?.subscription_tier]);

  // VERIFICAÇÃO FINAL: NUNCA renderizar para usuários premium
  if (subscriptionLoading) {
    console.log('[AdMobBanner] Carregando assinatura - não renderizar');
    return null;
  }

  if (subscription?.subscription_tier === "premium") {
    console.log('[AdMobBanner] Usuário premium - NUNCA renderizar banner');
    // Garantir que localStorage esteja limpo
    localStorage.removeItem('admob_banner_shown');
    return null;
  }

  // Se chegou até aqui, é usuário gratuito
  console.log('[AdMobBanner] Usuário gratuito - renderizando banner');

  // Se há erro, mostrar indicador de erro
  if (error) {
    return (
      <div className={`admob-banner-error ${className}`}>
        <div className="text-xs text-muted-foreground p-2 text-center">
          Erro no banner: {error}
        </div>
      </div>
    );
  }

  // Se está carregando, mostrar indicador de carregamento
  if (isLoading) {
    return (
      <div className={`admob-banner-loading ${className}`}>
        <div className="text-xs text-muted-foreground p-2 text-center">
          Carregando banner...
        </div>
      </div>
    );
  }

  // Se o banner está visível, não renderizar nada (o banner nativo do AdMob será exibido)
  if (isVisible) {
    return null;
  }

  // Se não está visível, mostrar placeholder
  return (
    <div className={`admob-banner-placeholder ${className}`}>
      <div className="text-xs text-muted-foreground p-2 text-center">
        Banner AdMob
      </div>
    </div>
  );
};

export default AdMobBanner; 