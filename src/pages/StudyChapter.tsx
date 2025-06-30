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
  ChevronRight
} from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBibleStudies, type BibleStudyChapter } from "@/hooks/useBibleStudies";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useToast } from "@/hooks/use-toast";

const StudyChapter = () => {
  const { studyId, chapterNumber } = useParams<{ studyId: string; chapterNumber: string }>();
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
    if (chapters.length > 0 && chapterNumber) {
      const currentChapter = chapters.find(c => c.chapter_number === parseInt(chapterNumber));
      setChapter(currentChapter || null);
    }
  }, [chapters, chapterNumber]);

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
      
      // Verificar se há próximo capítulo
      const nextChapter = getNextChapter();
      
      if (nextChapter) {
        // Aguardar um pouco para o usuário ver o toast
        setTimeout(() => {
          navigate(`/estudos/${studyId}/capitulo/${nextChapter.chapter_number}`);
        }, 1500);
      } else {
        // Se for o último capítulo, voltar para a lista de estudos
        setTimeout(() => {
          navigate(`/estudos/${studyId}`);
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
        reference: `${chapter.main_verse_reference} - ${chapter.title}`
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

  if (!user) {
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
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
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="spiritual-card">
              <CardContent className="py-12 text-center">
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded animate-pulse w-1/2 mx-auto" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4 mx-auto" />
                  <div className="h-64 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = isChapterCompleted(chapter.id);
  const nextChapter = getNextChapter();
  const prevChapter = getPrevChapter();

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link to={`/estudos/${studyId}`}>
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
          <Card className="spiritual-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Versículo Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Versículo */}
              <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg italic mb-2">
                      "{chapter.main_verse}"
                    </p>
                    <p className="text-primary font-semibold">
                      {chapter.main_verse_reference}
                    </p>
                  </div>
                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleVerseFavorite}
                      className="flex-shrink-0 h-8 w-8 ml-2"
                    >
                      {isVerseFavorite() ? (
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      ) : (
                        <HeartOff className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
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
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border-l-4 border-green-500 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="italic leading-relaxed text-justify text-base">
                        {chapter.chapter_prayer.replace(/\\n/g, '\n')}
                      </p>
                    </div>
                    {user && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePrayerFavorite}
                        className="flex-shrink-0 h-8 w-8 ml-2"
                      >
                        {isPrayerFavorite() ? (
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        ) : (
                          <HeartOff className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
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
                  <Link to={`/estudos/${studyId}/capitulo/${prevChapter.chapter_number}`}>
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
                  <Link to={`/estudos/${studyId}/capitulo/${nextChapter.chapter_number}`}>
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