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
  Sparkles
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useBibleStudies, type BibleStudy, type BibleStudyChapter } from '@/hooks/useBibleStudies';
import { useBibleFavorites } from '@/hooks/useBibleFavorites';
import { useIsMobile } from '@/hooks/use-mobile';
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
    getStudyProgress
  } = useBibleStudies();

  useEffect(() => {
    if (studyId) {
      console.log('Study component: studyId received:', studyId);
      console.log('Is mobile:', isMobile);
      setStudyLoading(true);
      
      const loadStudyData = async () => {
        try {
          // Primeiro, buscar todos os estudos ativos
          console.log('Fetching all active studies...');
          const { data: allStudies, error: allStudiesError } = await import('@/integrations/supabase/client').then(
            ({ supabase }) => supabase
              .from('bible_studies')
              .select('*')
              .eq('is_active', true)
          );
          
          console.log('All studies result:', { allStudies, allStudiesError });
          
          if (allStudies && allStudies.length > 0) {
            // Converter o slug para título para comparação
            const searchTitle = decodeURIComponent(studyId).replace(/-/g, ' ').toLowerCase();
            console.log('Searching for title:', searchTitle);
            
            // Encontrar o estudo que corresponde ao título
            const foundStudy = allStudies.find(study => 
              study.title.toLowerCase().includes(searchTitle) ||
              searchTitle.includes(study.title.toLowerCase())
            );
            
            if (foundStudy) {
              console.log('Found study by title comparison:', foundStudy);
              setStudy(foundStudy);
              
              // Agora buscar os capítulos usando o ID do estudo encontrado
              console.log('Fetching chapters for study ID:', foundStudy.id);
              await fetchChapters(studyId);
            } else {
              console.log('No study found by title, using first study');
              setStudy(allStudies[0]);
              await fetchChapters(studyId);
            }
          } else {
            console.error('No active studies found, using hardcoded fallback');
            
            // Fallback hardcoded para o estudo "Vencendo a Ansiedade com Fé"
            const fallbackStudy = {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'Vencendo a Ansiedade com Fé',
              description: 'Um estudo bíblico de 7 capítulos para superar a ansiedade através da fé em Deus, baseado em passagens fundamentais da Escritura.',
              total_chapters: 7,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            console.log('Using hardcoded fallback study:', fallbackStudy);
            setStudy(fallbackStudy);
            await fetchChapters(studyId);
          }
        } catch (error) {
          console.error('Error in loadStudyData:', error);
          
          // Último recurso: usar estudo hardcoded
          console.log('Using hardcoded study as last resort');
          const fallbackStudy = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Vencendo a Ansiedade com Fé',
            description: 'Um estudo bíblico de 7 capítulos para superar a ansiedade através da fé em Deus, baseado em passagens fundamentais da Escritura.',
            total_chapters: 7,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setStudy(fallbackStudy);
          await fetchChapters(studyId);
        } finally {
          setStudyLoading(false);
        }
      };
      
      loadStudyData();
    }
  }, [studyId]);

  const fetchStudyInfo = async (slug: string) => {
    try {
      console.log('fetchStudyInfo called with slug:', slug);
      // Converter o slug de volta para o título
      const title = decodeURIComponent(slug).replace(/-/g, ' ');
      console.log('fetchStudyInfo: decoded title:', title);
      
      // Primeiro vamos buscar todos os estudos para debug
      const { data: allStudies, error: allStudiesError } = await import('@/integrations/supabase/client').then(
        ({ supabase }) => supabase
          .from('bible_studies')
          .select('*')
          .eq('is_active', true)
      );
      
      console.log('All active studies:', allStudies);
      
      // Agora buscar o estudo específico
      const { data, error } = await import('@/integrations/supabase/client').then(
        ({ supabase }) => supabase
          .from('bible_studies')
          .select('*')
          .eq('is_active', true)
          .ilike('title', `%${title}%`)
          .single()
      );

      console.log('fetchStudyInfo result:', { data, error, searchTitle: title });

      if (error) {
        console.error('Error in fetchStudyInfo:', error);
        throw error;
      }
      setStudy(data);
    } catch (error) {
      console.error('Error fetching study:', error);
      
      // Se os capítulos foram carregados, vamos buscar o estudo pelo ID do primeiro capítulo
      if (chapters.length > 0) {
        try {
          console.log('Trying to get study from first chapter...');
          const firstChapter = chapters[0];
          console.log('First chapter:', firstChapter);
          
          const { data: studyFromChapter, error: studyError } = await import('@/integrations/supabase/client').then(
            ({ supabase }) => supabase
              .from('bible_studies')
              .select('*')
              .eq('id', firstChapter.study_id)
              .single()
          );
          
          console.log('Study from chapter result:', { studyFromChapter, studyError });
          
          if (studyFromChapter) {
            console.log('Found study from chapter:', studyFromChapter);
            setStudy(studyFromChapter);
            return;
          }
        } catch (chapterError) {
          console.error('Error getting study from chapter:', chapterError);
        }
      }
      
      // Vamos tentar uma busca mais flexível
      try {
        console.log('Trying alternative search...');
        const { data: alternativeData, error: alternativeError } = await import('@/integrations/supabase/client').then(
          ({ supabase }) => supabase
            .from('bible_studies')
            .select('*')
            .eq('is_active', true)
            .ilike('title', `%vencendo%ansiedade%`)
            .single()
        );
        
        console.log('Alternative search result:', { alternativeData, alternativeError });
        
        if (alternativeData) {
          setStudy(alternativeData);
        }
      } catch (altError) {
        console.error('Alternative search also failed:', altError);
      }
    } finally {
      setStudyLoading(false);
    }
  };

  const handleAuthClick = () => {
    setShowAuthDialog(true);
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
  if (studyLoading || loading) {
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Carregando estudo...</h3>
              <p className="text-muted-foreground mb-4">
                Aguarde enquanto carregamos o conteúdo.
              </p>
              <div className="text-xs text-muted-foreground">
                <p>Study Loading: {studyLoading.toString()}</p>
                <p>Chapters Loading: {loading.toString()}</p>
                <p>Study ID: {studyId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Só mostrar "estudo não encontrado" se não estiver carregando E não encontrou o estudo
  if (!study && !studyLoading && !loading) {
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
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
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/estudos">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar aos Estudos
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold heavenly-text mb-4">
              {study.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              {study.description}
            </p>
            
            {/* Progresso geral */}
            <Card className="spiritual-card max-w-md mx-auto mb-6">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Seu Progresso</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.completed}/{progress.total} capítulos
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-3 mb-2" />
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{study.total_chapters} capítulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Navegação livre</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de capítulos */}
        {(() => {
          console.log('Study render: loading =', loading, 'chapters.length =', chapters.length);
          console.log('Study render: chapters =', chapters);
          
          if (loading) {
            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Card key={i} className="spiritual-card">
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
            );
          } else if (chapters.length > 0) {
            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter) => {
                  const isCompleted = isChapterCompleted(chapter.id);
                  const isFavorite = isChapterFavorite(chapter.id);
                  
                  return (
                    <Card 
                      key={chapter.id} 
                      className={`spiritual-card group hover:shadow-lg transition-all duration-300 ${
                        isCompleted ? 'ring-2 ring-green-500/20' : ''
                      }`}
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
                        <Link to={`/estudos/${encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, '-'))}/capitulo/${chapter.chapter_number}`}>
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
            );
          } else {
            return (
              <Card className="spiritual-card max-w-md mx-auto">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum capítulo encontrado</h3>
                  <p className="text-muted-foreground">
                    Este estudo ainda não possui capítulos disponíveis.
                  </p>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Debug:</strong> Loading: {loading.toString()}, Chapters: {chapters.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })()}

        {/* Dicas de estudo */}
        <div className="mt-12">
          <Card className="spiritual-card">
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