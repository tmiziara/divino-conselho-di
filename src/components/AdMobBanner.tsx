import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';

interface AdMobBannerProps {
  className?: string;
}

const AdMobBanner: React.FC<AdMobBannerProps> = ({ className = '' }) => {
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { isEnglish } = useLanguage();
  const tx = useCallback((pt: string, en: string) => (isEnglish ? en : pt), [isEnglish]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bannerShownRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<any[]>([]);

  const getAdaptiveBannerHeight = () => {
    if (typeof window === 'undefined') return 0;
    const width = window.innerWidth;
    if (width >= 728) return 90;
    if (width >= 468) return 60;
    return 50;
  };

  // ID do banner de produção
  const BANNER_AD_ID = "ca-app-pub-7772749408418204/7297967059";

  // Função para mostrar o banner
  const showBanner = useCallback(async () => {
    // VERIFICAÇÃO DUPLA: nunca mostrar para premium
    if (subscription?.subscription_tier === "premium") {
      return;
    }

    if (bannerShownRef.current || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      
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
      
    } catch (err) {
      setError(err instanceof Error ? err.message : tx('Erro desconhecido', 'Unknown error'));
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
  }, [isLoading, subscription?.subscription_tier, tx]);

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
    } catch (err) {
    }
  };

  // Configurar listeners para eventos do banner
  const setupListeners = useCallback(async () => {
    try {
      // Listener para quando o banner é carregado
      const loadedListener = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        setIsLoading(false);
      });

      // Listener para quando o banner é fechado
      const closedListener = await AdMob.addListener(BannerAdPluginEvents.Closed, () => {
        bannerShownRef.current = false;
        setIsVisible(false);
        localStorage.removeItem('admob_banner_shown');
      });

      // Listener para quando o banner falha ao carregar
      const failedListener = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
        setIsLoading(false);
        setError(tx('Falha ao carregar banner', 'Failed to load banner'));
        
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
      });

      listenersRef.current = [loadedListener, closedListener, failedListener, impressionListener];
    } catch (err) {
    }
  }, [showBanner, subscription?.subscription_tier, tx]);

  // PRINCIPAL: Gerenciar visibilidade do banner baseado no status da assinatura
  useEffect(() => {
    if (subscriptionLoading) {
      return;
    }


    const manageBanner = async () => {
      if (subscription?.subscription_tier === "premium") {
        // USUÁRIO PREMIUM: SEMPRE ocultar banner e limpar tudo
        
        // Limpar localStorage imediatamente
        localStorage.removeItem('admob_banner_shown');
        
        // Resetar estado interno
        bannerShownRef.current = false;
        setIsVisible(false);
        
        // SEMPRE tentar ocultar o banner (mesmo que não esteja no estado interno)
        try {
          await AdMob.hideBanner();
        } catch (err) {
        }
        
      } else {
        // USUÁRIO GRATUITO: mostrar banner se não estiver visível
        if (!bannerShownRef.current) {
          await showBanner();
        }
      }
    };

    manageBanner();
  }, [showBanner, subscription?.subscription_tier, subscriptionLoading]);

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
  }, [setupListeners]);

  // Phase 4: reserve safe space so the native banner does not overlap nav/content.
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    if (subscriptionLoading || subscription?.subscription_tier === "premium") {
      document.documentElement.style.setProperty('--admob-banner-height', '0px');
      return;
    }

    const updateBannerHeight = () => {
      const shouldReserveSpace = isVisible || isLoading || !!error;
      const height = shouldReserveSpace ? getAdaptiveBannerHeight() : 0;
      document.documentElement.style.setProperty('--admob-banner-height', `${height}px`);
    };

    updateBannerHeight();
    window.addEventListener('resize', updateBannerHeight);

    return () => {
      window.removeEventListener('resize', updateBannerHeight);
      document.documentElement.style.setProperty('--admob-banner-height', '0px');
    };
  }, [isVisible, isLoading, error, subscription?.subscription_tier, subscriptionLoading]);

  // VERIFICAÇÃO INMEDIATA: sempre ocultar banner para usuários premium
  useEffect(() => {
    if (!subscriptionLoading && subscription?.subscription_tier === "premium") {
      
      // Limpar localStorage
      localStorage.removeItem('admob_banner_shown');
      
      // Tentar ocultar banner nativo
      AdMob.hideBanner().catch(err => {
      });
    }
  }, [subscriptionLoading, subscription?.subscription_tier]);

  // VERIFICAÇÃO FINAL: NUNCA renderizar para usuários premium
  if (subscriptionLoading) {
    return null;
  }

  if (subscription?.subscription_tier === "premium") {
    // Garantir que localStorage esteja limpo
    localStorage.removeItem('admob_banner_shown');
    return null;
  }

  // Se chegou até aqui, é usuário gratuito

  // Se há erro, mostrar indicador de erro
  if (error) {
    return (
      <div className={`admob-banner-error ${className}`}>
        <div className="text-xs text-muted-foreground p-2 text-center">
          {tx('Erro no banner:', 'Banner error:')} {error}
        </div>
      </div>
    );
  }

  // Se está carregando, mostrar indicador de carregamento
  if (isLoading) {
    return (
      <div className={`admob-banner-loading ${className}`}>
        <div className="text-xs text-muted-foreground p-2 text-center">
          {tx('Carregando banner...', 'Loading banner...')}
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
        {tx('Banner AdMob', 'AdMob Banner')}
      </div>
    </div>
  );
};

export default AdMobBanner; 
