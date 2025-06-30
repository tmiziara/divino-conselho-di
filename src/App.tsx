import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OfflineIndicator from "@/components/OfflineIndicator";
import { useSystemNavigation } from "@/hooks/useSystemNavigation";
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

const AppContent = () => {
  const { isNative, hideSystemUI } = useSystemNavigation();

  // Configurar navegação do sistema quando o app carregar
  React.useEffect(() => {
    if (isNative) {
      hideSystemUI();
    }
  }, [isNative, hideSystemUI]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/biblia" element={<Bible />} />
        <Route path="/conversa" element={<Chat />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/assinatura" element={<Subscription />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/estudos" element={<Studies />} />
        <Route path="/estudos/categoria/:categoryId" element={<CategoryStudies />} />
        <Route path="/estudos/:studyId" element={<Study />} />
        <Route path="/estudos/:studyId/capitulo/:chapterNumber" element={<StudyChapter />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
