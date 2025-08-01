import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import OfflineIndicator from "@/components/OfflineIndicator";
import { useSystemNavigation } from "@/hooks/useSystemNavigation";
import { LoadingProvider } from "@/components/LoadingProvider";
import Index from "./pages/Index";
import Bible from "./pages/Bible";
import Chat from "./pages/Chat";

import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Studies from "./pages/Studies";
import Study from "./pages/Study";
import StudyChapter from "./pages/StudyChapter";
import CategoryStudies from "./pages/CategoryStudies";
import NotFound from "./pages/NotFound";
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from "@capacitor-community/admob";
import { StatusBar } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { useSubscription } from "@/hooks/useSubscription";
import BuyCredits from "./pages/BuyCredits";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import VersiculoDoDia from "./pages/VersiculoDoDia";
import AdTest from "./pages/AdTest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

const ADMOB_TEST_BANNER_ID = "ca-app-pub-3940256099942544/6300978111";

const AppContent = () => {
  const { isNative, hideSystemUI } = useSystemNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const initializedRef = React.useRef(false);
  const { subscription, loading: subscriptionLoading } = useSubscription();

  // Verificar se o app foi aberto por uma notificação
  React.useEffect(() => {
    // Verificar todos os deeplinks salvos no localStorage
    const checkPendingDeeplinks = () => {
      const keys = Object.keys(localStorage);
      const pendingDeeplinkKeys = keys.filter(key => key.startsWith('pendingDeeplink_'));
      
      if (pendingDeeplinkKeys.length > 0) {
        console.log('[App] Encontrados deeplinks pendentes:', pendingDeeplinkKeys);
        
        // Usar o primeiro deeplink encontrado (mais recente)
        const firstKey = pendingDeeplinkKeys[0];
        const pendingDeeplink = localStorage.getItem(firstKey);
        
        if (pendingDeeplink) {
          console.log('[App] Redirecionando após abertura por notificação:', pendingDeeplink);
          localStorage.removeItem(firstKey); // Remove imediatamente para evitar redirecionamentos indevidos
          
          try {
            console.log('[App] Criando URL object com:', pendingDeeplink);
            const url = new URL(pendingDeeplink);
            const path = url.pathname;
            const params = new URLSearchParams(url.search);
            
            console.log('[App] Processando deeplink salvo - Path:', path);
            console.log('[App] Processando deeplink salvo - Params:', params.toString());
            console.log('[App] Path length:', path.length);
            console.log('[App] Path === "/versiculo-do-dia":', path === '/versiculo-do-dia');
            
            // Para deeplinks com formato conexaodeus://, extrair o path manualmente
            let actualPath = path;
            if (path === '' && pendingDeeplink.includes('conexaodeus://')) {
              const pathMatch = pendingDeeplink.match(/conexaodeus:\/\/([^?]+)/);
              if (pathMatch) {
                actualPath = '/' + pathMatch[1];
                console.log('[App] Path extraído manualmente:', actualPath);
              }
            }
            
            if (actualPath === '/versiculo-do-dia') {
              const theme = params.get('theme');
              const versiculoId = params.get('versiculoId');
              
              if (theme && versiculoId) {
                // Decodificar caracteres especiais
                const decodedTheme = decodeURIComponent(theme);
                const decodedVersiculoId = decodeURIComponent(versiculoId);
                
                console.log('[App] Redirecionando para versículo específico:', { 
                  originalTheme: theme, 
                  decodedTheme, 
                  originalVersiculoId: versiculoId, 
                  decodedVersiculoId 
                });
                
                const targetUrl = `/versiculo-do-dia?theme=${encodeURIComponent(decodedTheme)}&versiculoId=${encodeURIComponent(decodedVersiculoId)}`;
                console.log('[App] URL de destino:', targetUrl);
                navigate(targetUrl);
                console.log('[App] Navegação executada para:', targetUrl);
              } else {
                console.log('[App] Redirecionando para versículo do dia (sem parâmetros)');
                navigate('/versiculo-do-dia');
                console.log('[App] Navegação executada para: /versiculo-do-dia');
              }
            }
          } catch (error) {
            console.error('[App] Erro ao processar deeplink salvo:', error);
          }
        }
      }
    };
    
    // Verificar imediatamente
    checkPendingDeeplinks();
    
    // Verificar novamente após um pequeno delay para garantir que o app carregou completamente
    const timer = setTimeout(checkPendingDeeplinks, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Debug: log da rota atual
  console.log("[App] Rota atual:", location.pathname);

  // Tratamento de erro para rotas inválidas
  React.useEffect(() => {
    const validRoutes = ['/', '/biblia', '/versiculo-do-dia', '/estudos', '/favoritos', '/chat', '/perfil', '/assinatura', '/success', '/cancel', '/notificacoes'];
    const isValidRoute = validRoutes.some(route => 
      location.pathname === route || 
      location.pathname.startsWith('/estudo/') || 
      location.pathname.startsWith('/categoria/')
    );
    
    if (!isValidRoute) {
      console.warn("[App] Rota não reconhecida:", location.pathname);
    }
  }, [location.pathname]);

  // Configurar navegação do sistema quando o app carregar
  React.useEffect(() => {
    if (isNative) {
      hideSystemUI();
      // Configurar StatusBar para não sobrepor o WebView
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    }
  }, [isNative, hideSystemUI]);

  // Inicializa o AdMob apenas uma vez
  React.useEffect(() => {
    if (!initializedRef.current) {
      try {
        AdMob.initialize({
          testingDevices: [],
          initializeForTesting: true,
        });
        initializedRef.current = true;
        console.log("[AdMob] Inicializado com sucesso");
      } catch (error) {
        console.error("[AdMob] Erro na inicialização:", error);
      }
    }
  }, []);

  // Mostra o banner em todas as páginas, exceto para premium
  React.useEffect(() => {
    if (subscriptionLoading) return;
    if (subscription.subscription_tier !== "premium") {
      try {
        AdMob.showBanner({
          adId: "ca-app-pub-3940256099942544/6300978111",
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: true,
        });
        console.log("[AdMob] Banner exibido em:", location.pathname);
      } catch (error) {
        console.error("[AdMob] Erro ao mostrar banner:", error);
      }
    } else {
      try {
        AdMob.hideBanner();
        console.log("[AdMob] Banner ocultado para usuário premium");
      } catch (error) {
        console.error("[AdMob] Erro ao esconder banner:", error);
      }
    }
  }, [location.pathname, subscription.subscription_tier, subscriptionLoading]);

  // Listeners para eventos do banner
  React.useEffect(() => {
    let loadedHandle, closedHandle, failedHandle, impressionHandle;
    (async () => {
      loadedHandle = await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        console.log('[AdMob] bannerAdLoaded');
      });
      closedHandle = await AdMob.addListener(BannerAdPluginEvents.Closed, () => {
        console.log('[AdMob] bannerAdClosed');
      });
      failedHandle = await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
        console.log('[AdMob] bannerAdFailedToLoad', err);
      });
      impressionHandle = await AdMob.addListener(BannerAdPluginEvents.AdImpression, () => {
        console.log('[AdMob] bannerAdImpression');
      });
    })();
    return () => {
      const removeHandle = (handle) => {
        if (handle && typeof handle.then === 'function') {
          handle.then((h) => h.remove && h.remove());
        } else if (handle && typeof handle.remove === 'function') {
          handle.remove();
        }
      };
      removeHandle(loadedHandle);
      removeHandle(closedHandle);
      removeHandle(failedHandle);
      removeHandle(impressionHandle);
    };
  }, []);

  // Listener para deeplinks (Capacitor)
  React.useEffect(() => {
    let urlOpenHandle;
    (async () => {
      urlOpenHandle = await CapacitorApp.addListener('appUrlOpen', (data) => {
        console.log('[Deeplink] URL recebido:', data.url);
        try {
          const url = new URL(data.url);
          const path = url.pathname;
          const params = new URLSearchParams(url.search);
          console.log('[Deeplink] Path:', path);
          console.log('[Deeplink] Params:', params.toString());
          // Processar diferentes tipos de deeplinks
          if (path === '/versiculo-do-dia') {
            const theme = params.get('theme');
            const versiculoId = params.get('versiculoId');
            const verse = params.get('verse');
            
            if (theme && versiculoId) {
              console.log('[Deeplink] Redirecionando para versículo específico:', { theme, versiculoId });
              navigate(`/versiculo-do-dia?theme=${theme}&versiculoId=${versiculoId}`);
            } else if (verse) {
              console.log('[Deeplink] Redirecionando para versículo:', verse);
              navigate(`/versiculo-do-dia?verse=${verse}`);
            } else {
              navigate('/versiculo-do-dia');
            }
          } else if (path === '/notificacoes') {
            console.log('[Deeplink] Redirecionando para notificações');
            navigate('/notificacoes');
          } else if (path === '/biblia') {
            console.log('[Deeplink] Redirecionando para bíblia');
            navigate('/biblia');
          } else {
            console.log('[Deeplink] Rota não reconhecida:', path);
          }
        } catch (error) {
          console.error('[Deeplink] Erro ao processar URL:', error);
        }
      });
    })();
    return () => {
      if (urlOpenHandle && typeof urlOpenHandle.then === 'function') {
        urlOpenHandle.then((h) => h.remove && h.remove());
      } else if (urlOpenHandle && typeof urlOpenHandle.remove === 'function') {
        urlOpenHandle.remove();
      }
    };
  }, [navigate]);

  // Listener para deeplinks (Cordova - backup)
  React.useEffect(() => {
    const handleCordovaDeepLink = (event: any) => {
      // Capturar tanto eventos normais quanto CustomEvents
      const url = event.url || event.detail?.url;
      if (!url) return;

      console.log('[Cordova DeepLink] Recebido:', url);
      
      try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname;
        const theme = parsedUrl.searchParams.get('theme');
        const versiculoId = parsedUrl.searchParams.get('versiculoId');

        console.log('[Cordova DeepLink] Path:', path);
        console.log('[Cordova DeepLink] Theme:', theme);
        console.log('[Cordova DeepLink] VersiculoId:', versiculoId);

        if (path.includes('versiculo-do-dia') && theme && versiculoId) {
          console.log('[Cordova DeepLink] Redirecionando para versículo:', { theme, versiculoId });
          navigate(`/versiculo-do-dia?theme=${theme}&versiculoId=${versiculoId}`);
        } else if (path.includes('versiculo-do-dia')) {
          console.log('[Cordova DeepLink] Redirecionando para versículo do dia (sem parâmetros)');
          navigate('/versiculo-do-dia');
        }
      } catch (error) {
        console.error('[Cordova DeepLink] Erro ao processar URL:', error);
      }
    };

    window.addEventListener('appUrlOpen', handleCordovaDeepLink);

    return () => {
      window.removeEventListener('appUrlOpen', handleCordovaDeepLink);
    };
  }, [navigate]);

  // Adiciona paddingBottom global exceto na página de perfil
  const isProfile = location.pathname === '/perfil';

  // Adicionar otimização mobile
  useMobileOptimization();

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingBottom: isProfile ? 0 : 60,
      }}
    >
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/biblia" element={<Bible />} />
        <Route path="/versiculo-do-dia" element={<VersiculoDoDia />} />


        <Route path="/estudos" element={<Studies />} />
        <Route path="/estudo/:studyId" element={<Study />} />
        <Route path="/estudo/:studyId/capitulo/:chapterId" element={<StudyChapter />} />
        <Route path="/categoria/:categoryId" element={<CategoryStudies />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/assinatura" element={<Subscription />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/comprar-creditos" element={<BuyCredits />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
        <Route path="/notificacoes" element={<Notifications />} />
        <Route path="/ad-test" element={<AdTest />} />
        {/* Rotas alternativas/antigas para compatibilidade */}
        <Route path="/estudos" element={<Studies />} />
        <Route path="/estudos/categoria/:categoryId" element={<CategoryStudies />} />
        <Route path="/estudos/:studyId" element={<Study />} />
        <Route path="/estudos/:studyId/capitulo/:chapterNumber" element={<StudyChapter />} />
        {/* Fim das rotas alternativas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
    </div>
  );
};

const App = () => {
  React.useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
