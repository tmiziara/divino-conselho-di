import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Heart, 
  HeartOff,
  CheckCircle, 
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
import { useContentAccess } from "@/hooks/useContentAccess";

const StudyChapter = () => {
  const { studyId, chapterId } = useParams<{ studyId: string; chapterId: string }>();
  const [showAuth, setShowAuth] = useState(false);
  const [chapter, setChapter] = useState<BibleStudyChapter | null>(null);
  const [study, setStudy] = useState<any>(null);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const [showReminderCta, setShowReminderCta] = useState(false);
  const [studyLoading, setStudyLoading] = useState(true);
  // Phase 3: lock premium chapters behind a clear paywall.
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);
  // Phase 4: allow a rewarded ad to unlock a single premium chapter preview per session.
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const [isUnlockingPreview, setIsUnlockingPreview] = useState(false);
  const [isPreparingRewarded, setIsPreparingRewarded] = useState(false);
  const preparingRewardedRef = useRef(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasPremiumAccess, loading: accessLoading } = useContentAccess();
  const { 
    chapters, 
    loading, 
    fetchChapters, 
    isChapterCompleted, 
    markChapterAsCompleted
  } = useBibleStudies();
  
  const { favorites, addToFavorites, removeFavoriteByTitle, loadFavorites } = useBibleFavorites();
  const { incrementStudyCount, showRewardedAd, prepareRewardedAd, isRewardedReady } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });
  const REMINDER_CTA_KEY = "reminder_cta_study_v1";
  const PREVIEW_KEY_PREFIX = "rewarded_preview_chapter_v1";
  const safeStorageSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors to keep UI functional
    }
  };

  const getPreviewKey = () => {
    if (!studyId || !chapterId) return null;
    return `${PREVIEW_KEY_PREFIX}_${studyId}_${chapterId}`;
  };

  const hasPreviewAccess = () => {
    if (previewUnlocked) return true;
    const key = getPreviewKey();
    if (!key) return false;
    try {
      return sessionStorage.getItem(key) === "true";
    } catch (error) {
      return false;
    }
  };

  const savePreviewAccess = () => {
    const key = getPreviewKey();
    if (!key) return;
    try {
      sessionStorage.setItem(key, "true");
    } catch (error) {
    }
  };

  useEffect(() => {
    if (!studyId || accessLoading) return;

    const loadStudy = async () => {
      setStudyLoading(true);
      const studyData = await fetchStudyInfo(studyId);
      const previewAvailable = previewUnlocked || hasPreviewAccess();
      const hasAccess = hasPremiumAccess();
      const isPremiumStudy = !!studyData?.is_premium;
      const locked = isPremiumStudy && !hasAccess && !previewAvailable;
      setIsPremiumLocked(locked);

      if (isPremiumStudy && !hasAccess) {
        if (previewAvailable && chapterId) {
          const chapterNumber = parseInt(chapterId, 10);
          if (Number.isFinite(chapterNumber)) {
            await loadPreviewChapter(studyId, chapterNumber);
          }
        } else {
          setChapter(null);
        }
        setStudyLoading(false);
        return;
      }

      await fetchChapters(studyId);
      setStudyLoading(false);
    };

    loadStudy().catch(() => setStudyLoading(false));
  }, [studyId, accessLoading, hasPremiumAccess, previewUnlocked]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (isPremiumLocked) {
      setChapter(null);
      return;
    }
    if (chapters.length > 0 && chapterId) {
      const currentChapter = chapters.find(c => c.chapter_number === parseInt(chapterId));
      setChapter(currentChapter || null);
    }
  }, [chapters, chapterId, isPremiumLocked]);

  useEffect(() => {
    // Keep preview state in sync with sessionStorage per chapter.
    setPreviewUnlocked(hasPreviewAccess());
  }, [studyId, chapterId, previewUnlocked]);

  useEffect(() => {
    if (!chapterId) return;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [chapterId]);

  useEffect(() => {
    if (!isPremiumLocked || isRewardedReady || isPreparingRewarded) return;
    if (preparingRewardedRef.current) return;
    preparingRewardedRef.current = true;
    setIsPreparingRewarded(true);
    prepareRewardedAd()
      .finally(() => {
        preparingRewardedRef.current = false;
        setIsPreparingRewarded(false);
      });
  }, [isPremiumLocked, isRewardedReady, prepareRewardedAd]);

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
          is_premium: studyData.is_premium,
          slug: studyData.slug,
          created_at: studyData.created_at,
          updated_at: studyData.updated_at
        });
      }
      return studyData || null;
    } catch (error) {
      return null;
    }
  };

  const loadPreviewChapter = async (slug: string, chapterNumber: number) => {
    try {
      // Phase 4 fix: load only the requested premium chapter when unlocked via rewarded ad.
      const { localContent } = await import('@/lib/localContent');
      const studyData = await localContent.getStudyBySlug(slug);
      if (!studyData) {
        return null;
      }
      const preview = await localContent.getChapter(studyData.id, chapterNumber);
      if (preview) {
        setChapter(preview);
      }
      return preview || null;
    } catch (error) {
      return null;
    }
  };
  const handleAuthClick = () => {
    setShowAuth(true);
  };

  const runRewardedUnlock = async () => {
    if (!studyId || !chapterId) return;
    await showRewardedAd(async () => {
      savePreviewAccess();
      setPreviewUnlocked(true);
      setIsPremiumLocked(false);
      const chapterNumber = parseInt(chapterId, 10);
      if (Number.isFinite(chapterNumber)) {
        await loadPreviewChapter(studyId, chapterNumber);
      }
      toast({
        title: "Prévia liberada",
        description: "Este capítulo premium foi liberado após o anúncio."
      });
    });
  };

  const handleUnlockPreview = async () => {
    if (!studyId || !chapterId) return;

    if (!isRewardedReady) {
      return;
    }

    setIsUnlockingPreview(true);
    await runRewardedUnlock();
    setIsUnlockingPreview(false);
  };

  // Note: rewarded ads must be initiated by explicit user gesture on Android.

  const handleMarkAsCompleted = async () => {
    if (!chapter || !study) {
      return;
    }

    if (isChapterCompleted(chapter.id)) {
      const nextChapter = getNextChapter();
      if (nextChapter) {
        navigate(`/estudo/${studyId}/capitulo/${nextChapter.chapter_number}`);
      } else {
        navigate(`/estudo/${studyId}`);
      }
      return;
    }
    
    setIsMarkingCompleted(true);
    
    try {
      await markChapterAsCompleted(chapter.id, study.id);
      
      // Phase 4: reduce interstitials in the completion moment with a delay/cooldown.
      incrementStudyCount({ source: 'study', sensitive: true, delayMs: 2000 });

      // Phase 1: contextual reminder CTA after completion (once)
      try {
        if (!localStorage.getItem(REMINDER_CTA_KEY)) {
          setShowReminderCta(true);
        }
      } catch (error) {
        setShowReminderCta(true);
      }
      
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

    try {
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
    } catch (error: any) {
      toast({
        title: "Não foi possível salvar o favorito",
        description: error?.message || "Tente novamente.",
        variant: "destructive"
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

    try {
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
    } catch (error: any) {
      toast({
        title: "Não foi possível salvar o favorito",
        description: error?.message || "Tente novamente.",
        variant: "destructive"
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
    try {
      const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
      if (isCapacitor && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share) {
        await window.Capacitor.Plugins.Share.share({
          title,
          text,
          dialogTitle: 'Compartilhar com...'
        });
        return;
      }
      if (navigator.share) {
        try {
          await navigator.share({ title, text });
          return;
        } catch (error) {
        }
      }
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
    } catch (err) {
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

  if ((studyLoading && !chapter) || accessLoading) {
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

  const isEffectivelyLocked = isPremiumLocked && !previewUnlocked;

  if (isEffectivelyLocked) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-xl mx-auto bg-card dark:bg-card">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                Capítulo premium bloqueado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Este capítulo faz parte do plano Premium.
              </p>
              <p className="text-xs text-muted-foreground">
                Assista a um anúncio para liberar uma prévia deste capítulo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleUnlockPreview}
                  disabled={isUnlockingPreview || isPreparingRewarded}
                >
                  {isUnlockingPreview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Abrindo anúncio...
                    </>
                  ) : !isRewardedReady ? (
                    <>
                      {isPreparingRewarded && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      )}
                      Carregando anúncio...
                    </>
                  ) : (
                    "Ver anúncio e liberar prévia"
                  )}
                </Button>
                <Button
                  className="divine-button"
                  onClick={() => navigate('/assinatura?plan=premium')}
                >
                  Fazer assinatura Premium
                </Button>
                <Link to={"/estudos"}>
                  <Button variant="outline">
                    Ver outros estudos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  if (!chapter && !loading && !studyLoading && !accessLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-xl mx-auto bg-card dark:bg-card">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                Capítulo não encontrado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                O capítulo que você está procurando não existe.
              </p>
              <Link to={`/estudo/${studyId || ''}`}>
                <Button variant="outline">
                  Voltar ao Estudo
                </Button>
              </Link>
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
                    .replace(/\n\n/g, '\n\n')
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
                    {chapter.practical_application.replace(/\n/g, '\n')}
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

            {/* Phase 1: contextual reminder CTA */}
            {showReminderCta && (
              <Card className="spiritual-card bg-card dark:bg-zinc-900">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Quer receber lembretes diários para continuar seus estudos?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        // Phase 2: guided setup for study completion reminders.
                        safeStorageSet(REMINDER_CTA_KEY, "dismissed");
                        setShowReminderCta(false);
                        navigate("/notificacoes?guided=1&source=study&theme=auto");
                      }}
                    >
                      Ativar lembretes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        safeStorageSet(REMINDER_CTA_KEY, "dismissed");
                        setShowReminderCta(false);
                      }}
                    >
                      Agora não
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
