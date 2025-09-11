import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Heart, 
  HeartOff, 
  Play, 
  CheckCircle,
  Clock,
  Calendar,
  Target,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Lock
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useBibleStudies, type BibleStudy, type BibleStudyChapter } from '@/hooks/useBibleStudies';
import { useBibleFavorites } from '@/hooks/useBibleFavorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContentAccess } from '@/hooks/useContentAccess';
import { localContent } from '@/lib/localContent';
import { cn } from '@/lib/utils';
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

const Study = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<BibleStudyChapter | null>(null);
  const [showChapterDialog, setShowChapterDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showChapterContent, setShowChapterContent] = useState(false);
  const [study, setStudy] = useState<BibleStudy | null>(null);
  const [studyLoading, setStudyLoading] = useState(true);
  
  const { 
    chapters, 
    loading, 
    fetchChapters,
    isChapterCompleted,
    isChapterFavorite,
    getStudyProgress,
    toggleFavorite
  } = useBibleStudies();

  const { hasPremiumAccess, loading: accessLoading } = useContentAccess();

  useEffect(() => {
    if (studyId) {
      setStudyLoading(true);
      
      // Timeout de segurança para evitar travamento
      const timeoutId = setTimeout(() => {
        setStudyLoading(false);
      }, 15000); // 15 segundos
      
      const loadStudyData = async () => {
        try {
          // Usar o sistema simplificado
          await fetchChapters(studyId);
          
          // Buscar informações do estudo local (agora assíncrono)
          const studyData = await localContent.getStudyBySlug(studyId);
          
          if (studyData) {
            setStudy({
              id: studyData.id,
              title: studyData.title,
              description: studyData.description,
              cover_image: studyData.cover_image,
              total_chapters: studyData.total_chapters,
              is_active: studyData.is_active,
              slug: studyData.slug,
              created_at: studyData.created_at,
              updated_at: studyData.updated_at
            });
          } else {
            // Não deixar o app travar - definir loading como false mesmo com erro
            setStudyLoading(false);
          }
        } catch (error) {
          // Não deixar o app travar - definir loading como false mesmo com erro
          setStudyLoading(false);
          
          // Mostrar toast de erro se disponível
          if (error.message && error.message !== 'Estudo não encontrado') {
            // Tentar usar o toast se disponível
            try {
              const { toast } = require('@/hooks/use-toast');
              toast({
                title: "Erro ao carregar estudo",
                description: "Não foi possível carregar o estudo. Tente novamente.",
                variant: "destructive"
              });
            } catch (toastError) {
            }
          }
        } finally {
          clearTimeout(timeoutId);
          setStudyLoading(false);
        }
      };
      
      loadStudyData().catch(error => {
        clearTimeout(timeoutId);
        setStudyLoading(false);
      });
      
      // Cleanup function
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [studyId]);

  const handleAuthClick = () => {
    setShowAuthDialog(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                Estudo Bíblico
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para acessar este estudo bíblico
              </p>
              <Button className="divine-button" onClick={handleAuthClick}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>
    );
  }

  // Mostrar loading enquanto está carregando o estudo
  if (studyLoading || loading || accessLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Carregando estudo...</h3>
              <p className="text-muted-foreground mb-4">
                Aguarde enquanto carregamos o conteúdo.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Study Loading: {studyLoading?.toString() || 'undefined'}</p>
                <p>Chapters Loading: {loading?.toString() || 'undefined'}</p>
                <p>Access Loading: {accessLoading?.toString() || 'undefined'}</p>
                <p>Study ID: {studyId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Só mostrar "estudo não encontrado" se não estiver carregando E não encontrou o estudo
  if (!study && !studyLoading && !loading && !accessLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Estudo não encontrado</h3>
              <p className="text-muted-foreground mb-4">
                O estudo que você está procurando não existe.
              </p>
              <Link to="/estudos">
                <Button variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar aos Estudos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = getStudyProgress(study.id);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header do Estudo */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/estudos">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar aos Estudos
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="flex justify-center items-center text-2xl sm:text-3xl md:text-4xl font-bold heavenly-text mb-4 break-words">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 mr-3 text-primary" />
              {study?.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto break-words px-2">
              {study?.description}
            </p>
            
            {/* Estatísticas do estudo */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground mt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{chapters.length} capítulos</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>~{Math.ceil(chapters.length * 15)} min</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Estudo prático</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de capítulos */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Card key={i} className="spiritual-card bg-card dark:bg-zinc-900">
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-muted rounded animate-pulse mb-4" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : chapters.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => {
              const isCompleted = isChapterCompleted(chapter.id);
              
              return (
                <Card 
                  key={chapter.id} 
                  className={`spiritual-card group hover:shadow-lg transition-all duration-300 bg-card dark:bg-zinc-900 ${isCompleted ? 'ring-2 ring-green-500/20' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Capítulo {chapter.chapter_number}
                          </Badge>
                          {isCompleted && (
                            <Badge variant="default" className="bg-green-500 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {chapter.title}
                        </CardTitle>
                      </div>
                      <div className="ml-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Versículo principal */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Versículo Principal</p>
                      <p className="text-xs text-muted-foreground italic">
                        "{chapter.main_verse}"
                      </p>
                      <p className="text-xs text-primary font-medium mt-1">
                        {chapter.main_verse_reference}
                      </p>
                    </div>

                    {/* Estatísticas do capítulo */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Leitura Reflexiva</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>Oração</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>Aplicação</span>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <Link to={`/estudo/${study.slug || encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, '-'))}/capitulo/${chapter.chapter_number}`}>
                      <Button className="w-full divine-button group-hover:bg-primary/90 transition-colors">
                        <span>
                          {isCompleted ? 'Revisar Capítulo' : 'Ler Capítulo'}
                        </span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum capítulo encontrado</h3>
              <p className="text-muted-foreground">
                Este estudo ainda não possui capítulos disponíveis.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dicas de estudo */}
        <div className="mt-12">
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dicas para aproveitar ao máximo este estudo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">📖 Leitura Reflexiva</h4>
                  <p className="text-sm text-muted-foreground">
                    Leia com calma, permitindo que as palavras penetrem seu coração. 
                    Pause para refletir quando algo tocar você.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">🤔 Pergunta para Reflexão</h4>
                  <p className="text-sm text-muted-foreground">
                    Responda honestamente à pergunta proposta. 
                    Escreva suas reflexões se desejar.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">🙏 Oração do Capítulo</h4>
                  <p className="text-sm text-muted-foreground">
                    Use a oração sugerida como ponto de partida para sua conversa com Deus.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">✅ Aplicação Prática</h4>
                  <p className="text-sm text-muted-foreground">
                    Coloque em prática o que aprendeu. 
                    A verdadeira transformação acontece na aplicação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Study; 