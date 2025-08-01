import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  HeartOff,
  CheckCircle, 
  Circle,
  Target,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Share2
} from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBibleStudies, type BibleStudyChapter } from "@/hooks/useBibleStudies";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useToast } from "@/hooks/use-toast";
import { useAdManager } from "@/hooks/useAdManager";

const StudyChapter = () => {
  const { studyId, chapterId } = useParams<{ studyId: string; chapterId: string }>();
  const [showAuth, setShowAuth] = useState(false);
  const [chapter, setChapter] = useState<BibleStudyChapter | null>(null);
  const [study, setStudy] = useState<any>(null);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    chapters, 
    loading, 
    fetchChapters, 
    isChapterCompleted, 
    markChapterAsCompleted
  } = useBibleStudies();
  
  const { favorites, addToFavorites, removeFromFavorites, removeFavoriteByTitle, loadFavorites } = useBibleFavorites();
  const { incrementStudyCount } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });

  useEffect(() => {
    if (studyId) {
      fetchChapters(studyId);
      fetchStudyInfo(studyId);
    }
  }, [studyId]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (chapters.length > 0 && chapterId) {
      const currentChapter = chapters.find(c => c.chapter_number === parseInt(chapterId));
      setChapter(currentChapter || null);
    }
  }, [chapters, chapterId]);

  const fetchStudyInfo = async (slug: string) => {
    try {
      // Usar o sistema local em vez do Supabase
      const { localContent } = await import('@/lib/localContent');
      const studyData = await localContent.getStudyBySlug(slug);
      
      if (studyData) {
        setStudy({
          id: studyData.id,
          title: studyData.title,
          description: studyData.description,
          cover_image: studyData.cover_image,
          total_chapters: studyData.total_chapters,
          is_active: studyData.is_active,
          created_at: studyData.created_at,
          updated_at: studyData.updated_at
        });
      }
    } catch (error) {
      console.error('Error fetching study:', error);
    }
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  const handleMarkAsCompleted = async () => {
    if (!chapter || !study) {
      console.log('Missing chapter or study:', { chapter, study });
      return;
    }
    
    setIsMarkingCompleted(true);
    
    try {
      await markChapterAsCompleted(chapter.id, study.id);
      
      // Incrementar contador de ads quando capítulo é completado
      incrementStudyCount();
      
      // Verificar se há próximo capítulo
      const nextChapter = getNextChapter();
      
      if (nextChapter) {
        // Aguardar um pouco para o usuário ver o toast
        setTimeout(() => {
          navigate(`/estudo/${studyId}/capitulo/${nextChapter.chapter_number}`);
        }, 1500);
      } else {
        // Se for o último capítulo, voltar para a lista de estudos
        setTimeout(() => {
          navigate(`/estudo/${studyId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível marcar o capítulo como concluído.",
        variant: "destructive"
      });
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  const toggleVerseFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar versículos favoritos",
        variant: "destructive"
      });
      return;
    }

    if (!chapter) return;

    const verseKey = `study-verse-${chapter.id}`;
    const isFavorite = favorites.some(fav => 
      fav.title === verseKey
    );

    if (isFavorite) {
      await removeFavoriteByTitle(verseKey);
      toast({
        title: "Removido dos favoritos",
        description: "Versículo removido dos favoritos"
      });
    } else {
      await addToFavorites({
        book: 'study',
        chapter: chapter.chapter_number,
        verse: 0,
        title: verseKey,
        content: chapter.main_verse,
        reference: chapter.main_verse_reference
      });
      toast({
        title: "Adicionado aos favoritos",
        description: `${chapter.main_verse_reference} adicionado aos favoritos`
      });
    }
  };

  const togglePrayerFavorite = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar orações favoritas",
        variant: "destructive"
      });
      return;
    }

    if (!chapter) return;

    const prayerKey = `study-prayer-${chapter.id}`;
    const isFavorite = favorites.some(fav => 
      fav.title === prayerKey
    );

    if (isFavorite) {
      await removeFavoriteByTitle(prayerKey);
      toast({
        title: "Removido dos favoritos",
        description: "Oração removida dos favoritos"
      });
    } else {
      await addToFavorites({
        book: 'study',
        chapter: chapter.chapter_number,
        verse: 1,
        title: prayerKey,
        content: chapter.chapter_prayer,
        reference: `Oração - ${chapter.title}`
      });
      toast({
        title: "Adicionado aos favoritos",
        description: `Oração de "${chapter.title}" adicionada aos favoritos`
      });
    }
  };

  const isVerseFavorite = () => {
    if (!chapter) return false;
    const verseKey = `study-verse-${chapter.id}`;
    return favorites.some(fav => fav.title === verseKey);
  };

  const isPrayerFavorite = () => {
    if (!chapter) return false;
    const prayerKey = `study-prayer-${chapter.id}`;
    return favorites.some(fav => fav.title === prayerKey);
  };

  const getNextChapter = () => {
    if (!chapters.length || !chapter) return null;
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    return currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;
  };

  const getPrevChapter = () => {
    if (!chapters.length || !chapter) return null;
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    return currentIndex > 0 ? chapters[currentIndex - 1] : null;
  };

  // Função utilitária para compartilhar
  const shareContent = async (title: string, text: string) => {
    console.log('[Share] Botão de compartilhar clicado');
    try {
      const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
      console.log('[Share] isCapacitor:', isCapacitor);
      if (isCapacitor && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share) {
        console.log('[Share] Usando window.Capacitor.Plugins.Share...');
        await window.Capacitor.Plugins.Share.share({
          title,
          text,
          dialogTitle: 'Compartilhar com...'
        });
        console.log('[Share] Menu nativo aberto com sucesso!');
        return;
      }
      // Web Share API
      if (navigator.share) {
        try {
          console.log('[Share] Usando Web Share API...');
          await navigator.share({ title, text });
          console.log('[Share] Web Share API chamada com sucesso!');
          return;
        } catch (error) {
          console.error('[Share] Erro na Web Share API:', error);
        }
      }
      // Fallback: copiar
      console.log('[Share] Copiando para área de transferência...');
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      console.log('[Share] Copiado para área de transferência!');
    } catch (err) {
      console.error('[Share] Erro inesperado no compartilhamento:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-card">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                Capítulo do Estudo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para acessar este capítulo
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

  if (loading || !chapter) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="spiritual-card bg-card text-card-foreground dark:bg-card dark:text-white">
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded animate-pulse mb-4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = isChapterCompleted(chapter.id);
  const nextChapter = getNextChapter();
  const prevChapter = getPrevChapter();

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                                <Link to={`/estudo/${studyId}`}>
                <Button variant="ghost">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar ao Estudo
                </Button>
              </Link>
            </div>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Badge variant="outline">
                  Capítulo {chapter.chapter_number}
                </Badge>
                {isCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold heavenly-text mb-4">
                {chapter.title}
              </h1>
              {study && (
                <p className="text-lg text-muted-foreground">
                  {study.title}
                </p>
              )}
            </div>
          </div>

          {/* Conteúdo do capítulo */}
          <Card className="spiritual-card mb-8 bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Versículo Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Versículo */}
              <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                <div className="w-full flex justify-end gap-2 mb-2">
                  {user && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleVerseFavorite}
                        className="h-8 w-8"
                        aria-label={isVerseFavorite() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        {isVerseFavorite() ? (
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        ) : (
                          <HeartOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => shareContent(
                          'Versículo Inspirador',
                          `"${chapter.main_verse}"\n${chapter.main_verse_reference}\n\nEnviado do app Conexão com Deus!`
                        )}
                        aria-label="Compartilhar versículo"
                        className="h-8 w-8"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-lg italic mb-2">
                  "{chapter.main_verse}"
                </p>
                <p className="text-primary font-semibold">
                  {chapter.main_verse_reference}
                </p>
              </div>

              <Separator />

              {/* Leitura Reflexiva */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Leitura Reflexiva</h3>
                </div>
                <div className="prose prose-sm max-w-none space-y-2">
                  {chapter.reflective_reading
                    .replace(/\\n\\n/g, '\n\n')
                    .split('\n\n')
                    .filter(paragraph => paragraph.trim().length > 0)
                    .map((paragraph, index) => (
                      <div key={index} className="bg-muted/20 p-2 rounded-lg">
                        <p className="leading-relaxed text-justify text-base">
                          {paragraph.trim()}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              <Separator />

              {/* Pergunta para Reflexão */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-semibold">Pergunta para Reflexão</h3>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-lg font-medium">
                    {chapter.reflection_question}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Oração do Capítulo */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-green-500" />
                  <h3 className="text-xl font-semibold">Oração do Capítulo</h3>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border-l-4 border-green-500">
                  <div className="w-full flex justify-end gap-2 mb-2">
                    {user && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={togglePrayerFavorite}
                          className="h-8 w-8"
                          aria-label={isPrayerFavorite() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          {isPrayerFavorite() ? (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          ) : (
                            <HeartOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => shareContent(
                            'Oração do Capítulo',
                            `${chapter.chapter_prayer}\n\nEnviado do app Conexão com Deus!`
                          )}
                          aria-label="Compartilhar oração"
                          className="h-8 w-8"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="italic leading-relaxed text-justify text-base">
                    {chapter.chapter_prayer.replace(/\n/g, '\n')}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Aplicação Prática */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                  <h3 className="text-xl font-semibold">Aplicação Prática</h3>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg border-l-4 border-purple-500">
                  <p className="font-medium text-justify text-base">
                    {chapter.practical_application.replace(/\\n/g, '\n')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações e Navegação */}
          <div className="space-y-6">
            {/* Botão Marcar como Concluído */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleMarkAsCompleted}
                disabled={isMarkingCompleted}
                className={`flex-1 ${isCompleted ? 'bg-green-500 hover:bg-green-600' : 'divine-button'}`}
              >
                {isMarkingCompleted ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Capítulo Concluído
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Concluído
                  </>
                )}
              </Button>
            </div>

            {/* Navegação entre capítulos */}
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
              <div className="flex-1">
                {prevChapter ? (
                  <Link to={`/estudo/${studyId}/capitulo/${prevChapter.chapter_number}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Capítulo {prevChapter.chapter_number}
                    </Button>
                  </Link>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Primeiro capítulo
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center">
                <div className="text-sm text-muted-foreground">
                  Capítulo {chapter.chapter_number} de {chapters.length}
                </div>
              </div>
              
              <div className="flex-1 text-right">
                {nextChapter ? (
                  <Link to={`/estudo/${studyId}/capitulo/${nextChapter.chapter_number}`}>
                    <Button className="divine-button w-full sm:w-auto">
                      Capítulo {nextChapter.chapter_number}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Último capítulo
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default StudyChapter; 