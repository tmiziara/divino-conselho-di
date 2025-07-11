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

  // Listener para deeplinks
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
            const verse = params.get('verse');
            if (verse) {
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

  // Adiciona paddingBottom global exceto na página de perfil
  const isProfile = location.pathname === '/perfil';

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
        <Route path="/conversa" element={<Chat />} />
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
        <Route path="/notificacoes" element={<Notifications />} />
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
