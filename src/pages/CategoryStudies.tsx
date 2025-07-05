import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Heart, ChevronRight, Sparkles, Clock, Lock, ArrowLeft } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBibleStudies } from "@/hooks/useBibleStudies";
import { useStudyCategories } from "@/hooks/useStudyCategories";
import { useSubscription } from "@/hooks/useSubscription";
import { getCategoryConfig } from "@/lib/categories";

const CategoryStudies = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { studies, loading, progress } = useBibleStudies();
  const categorizedStudies = useStudyCategories(studies, progress);

  const hasPremiumAccess = useMemo(() => {
    if (subscriptionLoading || subscription === undefined) return undefined;
    return subscription.subscribed && subscription.subscription_tier === 'premium';
  }, [subscription, subscriptionLoading]);

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  // Encontrar a categoria atual
  const currentCategory = categorizedStudies.find(cat => cat.id === categoryId);
  const categoryConfig = getCategoryConfig(categoryId || '');

  console.time('CategoryStudiesPageLoad');

  if (!user) {
    console.timeEnd('CategoryStudiesPageLoad');
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card text-card-foreground dark:bg-zinc-900 dark:text-white">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                Estudos Bíblicos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para acessar estudos bíblicos profundos e salvar seu progresso
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

  if (!currentCategory || !categoryConfig) {
    console.timeEnd('CategoryStudiesPageLoad');
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card text-card-foreground dark:bg-zinc-900 dark:text-white">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Categoria não encontrada</h3>
              <p className="text-muted-foreground mb-4">
                A categoria que você está procurando não existe.
              </p>
              <Button onClick={() => navigate('/estudos')} className="divine-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Estudos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const IconComponent = categoryConfig.icon;

  if (loading || subscriptionLoading || subscription === undefined) {
    // Mostra loading
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="spiritual-card bg-card text-card-foreground dark:bg-zinc-900 dark:text-white">
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

  // Quando dados carregados, medir tempo até o conteúdo aparecer
  console.timeEnd('CategoryStudiesPageLoad');

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header da Categoria */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/estudos')}
            className="mb-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Estudos
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${categoryConfig.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              <IconComponent className={`w-8 h-8 ${categoryConfig.color}`} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold heavenly-text">
                {categoryConfig.name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {categoryConfig.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{currentCategory.count} {currentCategory.count === 1 ? 'estudo' : 'estudos'}</span>
            {currentCategory.studies.some(study => study.is_premium) && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                <Lock className="w-3 h-3 mr-1" />
                Inclui conteúdo premium
              </Badge>
            )}
          </div>
        </div>

        {loading || subscriptionLoading || subscription === undefined ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="spiritual-card bg-card text-card-foreground dark:bg-zinc-900 dark:text-white">
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
        ) : currentCategory.studies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategory.studies.map((study) => {
              const studyProgress = progress.filter(p => p.study_id === study.id);
              const completedChapters = studyProgress.filter(p => p.is_completed).length;
              const totalChapters = study.total_chapters;
              const categoryConfig = getCategoryConfig(study.category);
              
              return (
                <Card key={study.id} className="spiritual-card group hover:shadow-lg transition-all duration-300 bg-card text-card-foreground dark:bg-zinc-900 dark:text-white">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg md:text-xl group-hover:text-primary transition-colors mb-2 break-words">
                          {study.title}
                        </CardTitle>
                        <CardDescription className="text-sm break-words">
                          {study.description}
                        </CardDescription>
                        {/* Categoria do estudo */}
                        {categoryConfig && (
                          <div className="flex items-center gap-1 mt-1">
                            <categoryConfig.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">{categoryConfig.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="relative flex-shrink-0">
                        <div className="flex flex-col items-center gap-1">
                          {study.is_premium && (
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-1 py-0.5 min-w-0"
                            >
                              <Lock className="w-2 h-2 mr-0.5 flex-shrink-0" />
                              <span className="truncate">Premium</span>
                            </Badge>
                          )}
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progresso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {completedChapters}/{totalChapters} capítulos
                        </span>
                      </div>
                      <Progress 
                        value={totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0} 
                        className="h-2" 
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{totalChapters} capítulos • Navegação livre</span>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    {study.is_premium && hasPremiumAccess === false ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Button 
                                className="w-full divine-button group-hover:bg-primary/90 transition-colors"
                                disabled={true}
                              >
                                <span>Assinatura Necessária</span>
                                <Lock className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Você precisa fazer upgrade da sua assinatura para acessar este estudo.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : hasPremiumAccess === true || !study.is_premium ? (
                      <Link to={`/estudo/${study.slug || encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, '-'))}`}>
                        <Button className="w-full divine-button group-hover:bg-primary/90 transition-colors">
                          <span>Começar Estudo</span>
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="spiritual-card max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum estudo nesta categoria</h3>
              <p className="text-muted-foreground mb-4">
                Em breve teremos estudos nesta categoria!
              </p>
              <Button onClick={() => navigate('/estudos')} className="divine-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Estudos
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryStudies; 