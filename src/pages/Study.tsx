import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  Heart,
  Target,
  Sparkles,
  Lock
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useBibleStudies, type BibleStudy, type BibleStudyChapter } from '@/hooks/useBibleStudies';
import { useContentAccess } from '@/hooks/useContentAccess';
import { localContent } from '@/lib/localContent';
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";

const Study = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [study, setStudy] = useState<BibleStudy | null>(null);
  const [studyLoading, setStudyLoading] = useState(true);
  // Phase 3: premium lock state + preview for premium studies.
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);
  const [previewChapter, setPreviewChapter] = useState<BibleStudyChapter | null>(null);
  // Phase 4: keep track of rewarded unlock for chapter 1 in this session.
  const [isChapterOneUnlocked, setIsChapterOneUnlocked] = useState(false);
  
  const { 
    chapters, 
    loading, 
    fetchChapters,
    isChapterCompleted
  } = useBibleStudies();

  const { hasPremiumAccess, loading: accessLoading } = useContentAccess();

  useEffect(() => {
    if (!studyId || accessLoading) return;
    setStudyLoading(true);

    // Timeout de segurança para evitar travamento
    const timeoutId = setTimeout(() => {
      setStudyLoading(false);
    }, 15000); // 15 segundos

    const loadStudyData = async () => {
      try {
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
            is_premium: studyData.is_premium,
            slug: studyData.slug,
            created_at: studyData.created_at,
            updated_at: studyData.updated_at
          });

          const canAccessPremium = !studyData.is_premium || hasPremiumAccess();
          if (studyData.is_premium && !canAccessPremium) {
            setIsPremiumLocked(true);
            // Preview: carregar apenas o primeiro capítulo para mostrar um gostinho.
            const preview = await localContent.getChapter(studyData.id, 1);
            setPreviewChapter(preview || null);
            return;
          }

          setIsPremiumLocked(false);
          setPreviewChapter(null);
          // Usar o sistema simplificado (apenas quando há acesso)
          await fetchChapters(studyId);
        } else {
          // Não deixar o app travar - definir loading como false mesmo com erro
          setStudyLoading(false);
        }
      } catch (error: any) {
        // Não deixar o app travar - definir loading como false mesmo com erro
        setStudyLoading(false);

        // Mostrar toast de erro se disponível
        if (error?.message && error.message !== 'Estudo não encontrado') {
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

    loadStudyData().catch(() => {
      clearTimeout(timeoutId);
      setStudyLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [studyId, accessLoading, hasPremiumAccess, fetchChapters]);

  useEffect(() => {
    if (!studyId) return;
    try {
      const key = `rewarded_preview_chapter_v1_${studyId}_1`;
      setIsChapterOneUnlocked(sessionStorage.getItem(key) === "true");
    } catch (error) {
      setIsChapterOneUnlocked(false);
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
  if (studyLoading || accessLoading || (loading && !isPremiumLocked)) {
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

  if (study && isPremiumLocked) {
    const previewText = previewChapter?.reflective_reading
      ?.replace(/\n\n/g, '\n\n')
      .split('\n\n')
      .find(paragraph => paragraph.trim().length > 0);

    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-2xl mx-auto bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
            <CardHeader className="text-center">
              <CardTitle className="heavenly-text text-2xl">
                <Lock className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                Estudo premium bloqueado
              </CardTitle>
              <p className="text-muted-foreground">
                Este estudo faz parte do plano Premium.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewChapter && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-primary mb-2">Preview do Capítulo 1</p>
                  <p className="text-sm italic mb-2">"{previewChapter.main_verse}"</p>
                  <p className="text-xs text-muted-foreground">{previewChapter.main_verse_reference}</p>
                  {previewText && (
                    <p className="text-sm text-muted-foreground mt-3">{previewText}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Você pode liberar 1 capítulo premium assistindo a um anúncio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Phase 4: send the user to a locked chapter where the rewarded preview is available. */}
                {!isChapterOneUnlocked ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/estudo/${study.slug || encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, '-'))}/capitulo/1`)}
                  >
                    Ver anúncio e liberar capítulo 1
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/estudo/${study.slug || encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, '-'))}/capitulo/1`)}
                  >
                    Ler capítulo 1 liberado
                  </Button>
                )}
                <Button
                  className="divine-button flex-1"
                  onClick={() => navigate('/assinatura?plan=premium')}
                >
                  Fazer assinatura Premium
                </Button>
                <Link to="/estudos" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Ver outros estudos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
