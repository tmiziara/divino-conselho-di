import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Share2, Sparkles, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useVerseImage } from "@/hooks/useVerseImage";
import SwipeContainer from "@/components/SwipeContainer";
import { shareVerseImage } from './shareVerseImage';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdManager } from "@/hooks/useAdManager";
import { useLanguage } from "@/hooks/useLanguage";

interface Verse {
  tema: string;
  referencia: string;
  texto: string;
}

const VersiculoDoDia = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { isEnglish } = useLanguage();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBackground, setCurrentBackground] = useState('background1.jpg');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { incrementVerseCount } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });
  const navigate = useNavigate();
  const [guestViews, setGuestViews] = useState(0);
  const [showGuestLimit, setShowGuestLimit] = useState(false);
  const [showReminderCta, setShowReminderCta] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  
  const currentVerse = verses[currentIndex];
  const GUEST_VIEW_KEY = "guest_verse_views";
  const GUEST_VIEW_LIMIT = 2;
  const REMINDER_CTA_KEY = "reminder_cta_verse_v1";
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const triggerGuestLimit = () => {
    setShowGuestLimit(true);
  };

  const safeStorageGet = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const safeStorageSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors to keep UI functional
    }
  };

  // Lista de imagens de background disponíveis
  const backgroundImages = [
    'background1.jpg',
    'background2.jpg', 
    'background3.jpg',
    'background4.jpg',
    'background5.jpg',
    'background6.jpg',
    'background7.jpg',
    'background8.jpg'
  ];

  // Carregar versículos do arquivo
  useEffect(() => {
    const loadVerses = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch('/data/versiculos_por_tema_com_texto.json');
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          setVerses([]);
          setLoadError(tx("Nenhum versículo disponível no momento.", "No verse available at the moment."));
          setLoading(false);
          return;
        }
        setVerses(data);
        
        // Verificar se há parâmetros de notificação na URL
        const theme = searchParams.get('theme');
        const versiculoId = searchParams.get('versiculoId');
        const verseParam = searchParams.get('verse');
        
        if (theme && versiculoId) {
          // Decodificar caracteres especiais
          const decodedTheme = decodeURIComponent(theme);
          const decodedVersiculoId = decodeURIComponent(versiculoId);
          
          
          // Buscar o versículo específico baseado no tema e ID
          const targetVerse = data.find(verse => 
            verse.tema === decodedTheme && 
            verse.referencia.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '-') === decodedVersiculoId
          );
          
          if (targetVerse) {
            
            // Adicionar o versículo específico no início da lista
            const updatedVerses = [targetVerse, ...data];
            setVerses(updatedVerses);
            setCurrentIndex(0); // Mostrar o versículo específico primeiro
            setCurrentBackground(getRandomBackground());
            
            // Limpar os parâmetros da URL após processar
            const url = new URL(window.location.href);
            url.searchParams.delete('theme');
            url.searchParams.delete('versiculoId');
            window.history.replaceState({}, '', url.toString());
          } else {
            setCurrentIndex(getRandomIndex(data.length));
            setCurrentBackground(getRandomBackground());
          }
        } else if (verseParam) {
          try {
            const specificVerse = JSON.parse(decodeURIComponent(verseParam));
            
            // Adicionar o versículo específico no início da lista
            const updatedVerses = [specificVerse, ...data];
            setVerses(updatedVerses);
            setCurrentIndex(0); // Mostrar o versículo específico primeiro
            setCurrentBackground(getRandomBackground());
            
            // Limpar o parâmetro da URL após processar
            const url = new URL(window.location.href);
            url.searchParams.delete('verse');
            window.history.replaceState({}, '', url.toString());
          } catch (error) {
            setCurrentIndex(getRandomIndex(data.length));
            setCurrentBackground(getRandomBackground());
          }
        } else {
          // Comportamento padrão: versículo aleatório
          setCurrentIndex(getRandomIndex(data.length));
          setCurrentBackground(getRandomBackground());
        }
        
        setLoading(false);

        // Phase 1: allow a limited preview for guests
        if (!user) {
          const stored = safeStorageGet(GUEST_VIEW_KEY);
          const initialCount = stored ? parseInt(stored, 10) : 0;
          const nextCount = Math.max(initialCount, 1); // opening counts as first preview
          safeStorageSet(GUEST_VIEW_KEY, nextCount.toString());
          setGuestViews(nextCount);
          if (nextCount >= GUEST_VIEW_LIMIT) {
            triggerGuestLimit();
          }
        }
      } catch (error) {
        setLoadError(tx("Não foi possível carregar os versículos.", "Could not load verses."));
        setLoading(false);
      }
    };

    loadVerses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, reloadToken]);

  const { imageUrl, loading: imageLoading } = useVerseImage({
    verse: currentVerse,
    backgroundImage: currentBackground
  });

  // Função para gerar índice aleatório
  const getRandomIndex = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  // Função para gerar background aleatório
  const getRandomBackground = () => {
    const randomIndex = getRandomIndex(backgroundImages.length);
    return backgroundImages[randomIndex];
  };

  // Nova função para compartilhar a imagem do versículo
  const handleShareImage = async () => {
    if (!imageUrl) return;

    const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

    if (!isNative) {
      alert(tx("O compartilhamento de imagem só está disponível no app instalado.", "Image sharing is only available in the installed app."));
      return;
    }

    try {
      await shareVerseImage(imageUrl);
    } catch (error) {
      alert(tx("Erro ao compartilhar imagem: ", "Error sharing image: ") + error);
    }
  };

  // Substitui o handleShare para chamar o compartilhamento de imagem
  const handleShare = handleShareImage;

  const navigateVerse = (direction: 'prev' | 'next') => {
    // Phase 1: limit guest preview to 2 verses before prompting login
    if (!user && guestViews >= GUEST_VIEW_LIMIT) {
      triggerGuestLimit();
      return;
    }

    if (verses.length === 0) {
      return;
    }

    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentBackground(getRandomBackground());
      incrementVerseCount(); // Incrementar contador de ads
    } else if (direction === 'next' && currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentBackground(getRandomBackground());
      incrementVerseCount(); // Incrementar contador de ads
    } else {
      return;
    }

    // Phase 1: track guest previews
    if (!user) {
      const nextViews = guestViews + 1;
      setGuestViews(nextViews);
      safeStorageSet(GUEST_VIEW_KEY, nextViews.toString());
      if (nextViews >= GUEST_VIEW_LIMIT) {
        triggerGuestLimit();
      }
    }

    // Phase 1: contextual reminder CTA (once)
    if (!safeStorageGet(REMINDER_CTA_KEY)) {
      setShowReminderCta(true);
    }
  };

  // Função para gerar versículo completamente aleatório
  const generateRandomVerse = () => {
    if (!user && guestViews >= GUEST_VIEW_LIMIT) {
      triggerGuestLimit();
      return;
    }

    if (verses.length === 0) {
      return;
    }

    const randomVerseIndex = getRandomIndex(verses.length);
    const randomBackground = getRandomBackground();
    if (randomVerseIndex === currentIndex && randomBackground === currentBackground) {
      return;
    }
    setCurrentIndex(randomVerseIndex);
    setCurrentBackground(randomBackground);

    if (!user) {
      const nextViews = guestViews + 1;
      setGuestViews(nextViews);
      safeStorageSet(GUEST_VIEW_KEY, nextViews.toString());
      if (nextViews >= GUEST_VIEW_LIMIT) {
        triggerGuestLimit();
      }
    }

    if (!safeStorageGet(REMINDER_CTA_KEY)) {
      setShowReminderCta(true);
    }
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">{tx("Carregando versículos...", "Loading verses...")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto text-center">
            <p className="text-muted-foreground mb-4">{loadError}</p>
            <Button onClick={() => setReloadToken((value) => value + 1)}>{tx("Tentar novamente", "Try again")}</Button>
          </div>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h1 className="text-2xl font-bold heavenly-text">
                {tx("Versículo do Dia", "Verse of the Day")}
              </h1>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted-foreground">
              {currentIndex + 1} {tx("de", "of")} {verses.length} {tx("versículos", "verses")}
            </p>

          </div>

          {/* Card do Versículo */}
          <SwipeContainer
            onSwipeLeft={() => navigateVerse('next')}
            onSwipeRight={() => navigateVerse('prev')}
            className="mb-6"
          >
            <Card className="spiritual-card bg-card dark:bg-zinc-900 overflow-hidden">
              <CardContent className="p-0">
                {imageLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">{tx("Gerando imagem...", "Generating image...")}</p>
                    </div>
                  </div>
                ) : imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={currentVerse?.referencia}
                      className="w-full h-auto rounded-t-lg"
                    />
                    
                    {/* Botão de compartilhar (somente logado) */}
                    {user && (
                      <div className="absolute top-4 right-4">
                        <Button
                          onClick={handleShare}
                          size="sm"
                          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-muted-foreground">{tx("Erro ao carregar versículo", "Error loading verse")}</p>
                  </div>
                )}

                {/* Informações do versículo */}
                <div className="p-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {currentVerse?.referencia}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {tx("Tema", "Theme")}: {currentVerse?.tema}
                    </p>
                    <p className="text-foreground leading-relaxed italic">
                      "{currentVerse?.texto}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </SwipeContainer>

          {/* Navegação */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigateVerse('prev')}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {tx("Anterior", "Previous")}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigateVerse('next')}
              disabled={currentIndex === verses.length - 1}
              className="flex-1"
            >
              {tx("Próximo", "Next")}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Botão Aleatório */}
          <div className="text-center">
            <Button
              onClick={generateRandomVerse}
              variant="secondary"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {tx("Versículo Aleatório", "Random Verse")}
            </Button>
          </div>

          {/* Phase 1: Contextual reminder CTA */}
          {showReminderCta && (
            <div className="mt-6">
              <Card className="spiritual-card bg-card dark:bg-zinc-900">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    {tx("Quer receber lembretes diários com versículos?", "Would you like daily verse reminders?")}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        // Phase 2: guided setup with prefilled theme from the verse.
                        const themeParam = currentVerse?.tema ? encodeURIComponent(currentVerse.tema) : "auto";
                        safeStorageSet(REMINDER_CTA_KEY, "dismissed");
                        setShowReminderCta(false);
                        navigate(`/notificacoes?guided=1&source=verse&theme=${themeParam}`);
                      }}
                    >
                      {tx("Ativar lembretes", "Enable reminders")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        safeStorageSet(REMINDER_CTA_KEY, "dismissed");
                        setShowReminderCta(false);
                      }}
                    >
                      {tx("Agora não", "Not now")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Phase 1: Soft sign-up nudge for guests */}
          {showGuestLimit && !user && (
            <div className="mt-6">
              <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-card">
                <CardContent className="text-center p-6">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {tx("Você já viu seus 2 versículos gratuitos. Entre para continuar.", "You already viewed your 2 free verses. Sign in to continue.")}
                  </p>
                  <Button className="divine-button" onClick={handleAuthClick}>
                    {tx("Fazer Login", "Sign In")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {tx("💡 Deslize para navegar ou use o botão aleatório para surpresas!", "💡 Swipe to navigate or use the random button for surprises!")}
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default VersiculoDoDia; 

