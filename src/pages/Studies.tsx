import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Heart, ChevronRight, Sparkles, Clock, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import CategoryCard from "@/components/CategoryCard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useBibleStudies } from "@/hooks/useBibleStudies";
import { useStudyCategories } from "@/hooks/useStudyCategories";
import { useSubscription } from "@/hooks/useSubscription";
import { getCategoryConfig } from "@/lib/categories";

const Studies = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { isEnglish } = useLanguage();
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { studies, loading, progress } = useBibleStudies();
  const categorizedStudies = useStudyCategories(studies, progress);
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  // Função para verificar se tem acesso premium (memoizada)
  const hasPremiumAccess = useMemo(() => {
    if (subscriptionLoading || subscription === undefined) return undefined;
    // Phase 3 fix: treat legacy "basic" as premium access to keep entitlements consistent.
    if (subscription.subscribed && (subscription.subscription_tier === 'premium' || subscription.subscription_tier === 'basic')) {
      return true;
    }
    return false;
  }, [subscription, subscriptionLoading]);

  // Determinar se deve mostrar o card de assinatura
  const shouldShowSubscriptionCard = () => {
    if (subscriptionLoading || subscription === undefined) return false;
    if (hasPremiumAccess) return false;
    return true;
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  // Ordenar categorias conforme desejado (sempre antes de qualquer return!)
  const orderedCategories = useMemo(() => {
    const order = [
      'completos',
      'em-progresso',
      'familia',
      'relacionamentos',
      'proposito-carreira',
      'financas',
      'vida-espiritual',
    ];
    return order
      .map(id => categorizedStudies.find(cat => cat.id === id))
      .filter(Boolean);
  }, [categorizedStudies]);


  // Separar categorias
  const inProgressCategory = orderedCategories.find(cat => cat.id === 'em-progresso' && cat.count > 0);
  const completedCategory = orderedCategories.find(cat => cat.id === 'completos');
  const otherCategories = orderedCategories.filter(cat => cat.id !== 'em-progresso' && cat.id !== 'completos');

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                {tx("Estudos Bíblicos", "Bible Studies")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                {tx("Faça login para acessar estudos bíblicos profundos e salvar seu progresso", "Sign in to access deep Bible studies and save your progress")}
              </p>
              <Button className="divine-button" onClick={handleAuthClick}>
                {tx("Fazer Login", "Sign In")}
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  if (loading || subscriptionLoading || subscription === undefined) {
    // Mostra loading
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="spiritual-card bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
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

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="flex justify-center items-center text-2xl sm:text-3xl md:text-4xl font-bold heavenly-text mb-4 break-words">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 mr-3 text-primary" />
            {tx("Estudos Bíblicos", "Bible Studies")}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground break-words px-2">
            {tx("Explore estudos organizados por categoria e acompanhe seu progresso", "Explore studies organized by category and track your progress")}
          </p>
        </div>

        {(loading || subscriptionLoading || subscription === undefined) ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="spiritual-card bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
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
        ) : orderedCategories.length > 0 ? (
          <>
            {/* Botão de Assinatura - Só aparece se deve mostrar */}
            {shouldShowSubscriptionCard() && (
              <div className="mb-8 text-center">
                <Card className="spiritual-card max-w-md mx-auto bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 border-amber-200 dark:border-amber-700">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-200" />
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-100">{tx("Desbloqueie Todos os Estudos", "Unlock All Studies")}</h3>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-200 mb-4">
                      {tx("Faça upgrade da sua assinatura para acessar estudos premium exclusivos", "Upgrade your subscription to access exclusive premium studies")}
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/assinatura'}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-amber-700 dark:to-orange-700 text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {tx("Fazer Assinatura", "Subscribe")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Grid de Categorias 2 colunas, cards menores */}
            {orderedCategories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Em Progresso centralizado se existir */}
                {inProgressCategory && (
                  <div className="col-span-2 flex justify-center">
                    <CategoryCard 
                      key={inProgressCategory.id}
                      category={inProgressCategory}
                      hasPremiumAccess={hasPremiumAccess}
                      small
                    />
                  </div>
                )}
                {/* Outras categorias (exceto completos) */}
                {otherCategories.map((category, idx) => (
                  <CategoryCard 
                    key={category.id || idx}
                    category={category}
                    hasPremiumAccess={hasPremiumAccess}
                    small
                  />
                ))}
                {/* Completos sempre no final */}
                {completedCategory && (
                  <CategoryCard 
                    key={completedCategory.id}
                    category={completedCategory}
                    hasPremiumAccess={hasPremiumAccess}
                    small
                  />
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                {tx("Nenhuma categoria disponível.", "No categories available.")}
              </div>
            )}
          </>
        ) : (
          <Card className="spiritual-card max-w-md mx-auto bg-card dark:bg-zinc-900">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">{tx("Nenhum estudo disponível", "No studies available")}</h3>
              <p className="text-muted-foreground">
                {tx("Em breve teremos estudos bíblicos incríveis para você!", "We will have amazing Bible studies for you soon!")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informações adicionais */}
        <div className="mt-12">
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {tx("Como funcionam os estudos?", "How do studies work?")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">{tx("Escolha a Categoria", "Choose a Category")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tx("Selecione uma área que fale ao seu coração", "Choose an area that speaks to your heart")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">{tx("Navegue Livremente", "Browse Freely")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tx("Acesse qualquer capítulo na ordem que preferir", "Access any chapter in the order you prefer")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">{tx("Aplique na Vida", "Apply It to Life")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tx("Reflita, ore e pratique os ensinamentos", "Reflect, pray, and put the teachings into practice")}
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

export default Studies; 
