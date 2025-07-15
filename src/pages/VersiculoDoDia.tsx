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
import { useSearchParams } from "react-router-dom";
import { useAdManager } from "@/hooks/useAdManager";

interface Verse {
  tema: string;
  referencia: string;
  texto: string;
}

const VersiculoDoDia = () => {
  console.log('[VersiculoDoDia] Componente montado');
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBackground, setCurrentBackground] = useState('background1.jpg');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { incrementVerseCount } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });
  
  const currentVerse = verses[currentIndex];

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
    console.log('[VersiculoDoDia] useEffect executado, searchParams:', searchParams.toString());
    const loadVerses = async () => {
      try {
        const response = await fetch('/data/versiculos_por_tema_com_texto.json');
        const data = await response.json();
        setVerses(data);
        
        // Verificar se há parâmetros de notificação na URL
        const theme = searchParams.get('theme');
        const versiculoId = searchParams.get('versiculoId');
        const verseParam = searchParams.get('verse');
        
        if (theme && versiculoId) {
          // Decodificar caracteres especiais
          const decodedTheme = decodeURIComponent(theme);
          const decodedVersiculoId = decodeURIComponent(versiculoId);
          
          console.log('[VersiculoDoDia] Parâmetros de notificação recebidos:', { 
            originalTheme: theme, 
            decodedTheme, 
            originalVersiculoId: versiculoId, 
            decodedVersiculoId 
          });
          
          // Buscar o versículo específico baseado no tema e ID
          const targetVerse = data.find(verse => 
            verse.tema === decodedTheme && 
            verse.referencia.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '-') === decodedVersiculoId
          );
          
          if (targetVerse) {
            console.log('[VersiculoDoDia] Versículo encontrado:', targetVerse);
            
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
            console.warn('[VersiculoDoDia] Versículo não encontrado:', { theme, versiculoId });
            setCurrentIndex(getRandomIndex(data.length));
            setCurrentBackground(getRandomBackground());
          }
        } else if (verseParam) {
          try {
            const specificVerse = JSON.parse(decodeURIComponent(verseParam));
            console.log('[VersiculoDoDia] Versículo específico recebido:', specificVerse);
            
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
            console.error('[VersiculoDoDia] Erro ao processar versículo da URL:', error);
            setCurrentIndex(getRandomIndex(data.length));
            setCurrentBackground(getRandomBackground());
          }
        } else {
          // Comportamento padrão: versículo aleatório
          setCurrentIndex(getRandomIndex(data.length));
          setCurrentBackground(getRandomBackground());
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar versículos:', error);
        setLoading(false);
      }
    };

    loadVerses();
  }, [searchParams]);

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
    console.log('[DEBUG] isNative:', isNative, 'Capacitor:', (window as any).Capacitor);

    if (!isNative) {
      alert('O compartilhamento de imagem só está disponível no app instalado.');
      return;
    }

    try {
      await shareVerseImage(imageUrl);
      console.log('[DEBUG] Compartilhamento de imagem chamado!');
    } catch (error) {
      alert('Erro ao compartilhar imagem: ' + error);
      console.error('[DEBUG] Erro ao compartilhar imagem:', error);
    }
  };

  // Substitui o handleShare para chamar o compartilhamento de imagem
  const handleShare = handleShareImage;

  const navigateVerse = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentBackground(getRandomBackground());
      incrementVerseCount(); // Incrementar contador de ads
    } else if (direction === 'next' && currentIndex < verses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentBackground(getRandomBackground());
      incrementVerseCount(); // Incrementar contador de ads
    }
  };

  // Função para gerar versículo completamente aleatório
  const generateRandomVerse = () => {
    const randomVerseIndex = getRandomIndex(verses.length);
    const randomBackground = getRandomBackground();
    
    setCurrentIndex(randomVerseIndex);
    setCurrentBackground(randomBackground);
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  // Se não estiver logado, mostrar tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-card">
            <CardContent className="text-center p-6">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2 heavenly-text">
                Versículo do Dia
              </h2>
              <p className="text-muted-foreground mb-6">
                Faça login para acessar versículos inspiradores e compartilhar com seus amigos
              </p>
              <Button className="divine-button" onClick={handleAuthClick}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Carregando versículos...</p>
          </div>
        </div>
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
                Versículo do Dia
              </h1>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted-foreground">
              {currentIndex + 1} de {verses.length} versículos
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
                      <p className="text-muted-foreground">Gerando imagem...</p>
                    </div>
                  </div>
                ) : imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt={currentVerse?.referencia}
                      className="w-full h-auto rounded-t-lg"
                    />
                    
                    {/* Botão de compartilhar */}
                    <div className="absolute top-4 right-4">
                      <Button
                        onClick={handleShare}
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-muted-foreground">Erro ao carregar versículo</p>
                  </div>
                )}

                {/* Informações do versículo */}
                <div className="p-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {currentVerse?.referencia}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tema: {currentVerse?.tema}
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
              Anterior
            </Button>

            <Button
              variant="outline"
              onClick={() => navigateVerse('next')}
              disabled={currentIndex === verses.length - 1}
              className="flex-1"
            >
              Próximo
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
              Versículo Aleatório
            </Button>
          </div>

          {/* Instruções */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Deslize para navegar ou use o botão aleatório para surpresas!
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default VersiculoDoDia; 