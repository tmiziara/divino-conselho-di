import { useState, useMemo } from "react";
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
import { useBibleStudies } from "@/hooks/useBibleStudies";
import { useStudyCategories } from "@/hooks/useStudyCategories";
import { useSubscription } from "@/hooks/useSubscription";
import { getCategoryConfig } from "@/lib/categories";

const Studies = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { studies, loading, progress } = useBibleStudies();
  const categorizedStudies = useStudyCategories(studies, progress);

  // Função para verificar se tem acesso premium (memoizada)
  const hasPremiumAccess = useMemo(() => {
    if (subscriptionLoading || subscription === undefined) return undefined;
    if (subscription.subscribed && subscription.subscription_tier === 'premium') {
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

  console.time('StudiesPageLoad');

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

  // Log para depuração robusta
  console.log('categorizedStudies.length:', categorizedStudies.length);
  console.log('orderedCategories.length:', orderedCategories.length);
  try {
    console.log('categorizedStudies:', JSON.stringify(categorizedStudies));
    console.log('orderedCategories:', JSON.stringify(orderedCategories));
  } catch (e) {
    console.log('Erro ao serializar arrays para log:', e);
  }

  // Separar categorias
  const inProgressCategory = orderedCategories.find(cat => cat.id === 'em-progresso' && cat.count > 0);
  const completedCategory = orderedCategories.find(cat => cat.id === 'completos');
  const otherCategories = orderedCategories.filter(cat => cat.id !== 'em-progresso' && cat.id !== 'completos');

  if (!user) {
    console.timeEnd('StudiesPageLoad');
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
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

  if (loading || subscriptionLoading || subscription === undefined) {
    // Mostra loading
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="spiritual-card">
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
  console.timeEnd('StudiesPageLoad');

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="flex justify-center items-center text-2xl sm:text-3xl md:text-4xl font-bold heavenly-text mb-4 break-words">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 mr-3 text-primary" />
            Estudos Bíblicos
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground break-words px-2">
            Explore estudos organizados por categoria e acompanhe seu progresso
          </p>
        </div>

        {(loading || subscriptionLoading || subscription === undefined) ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="spiritual-card">
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
                <Card className="spiritual-card max-w-md mx-auto bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-amber-800">Desbloqueie Todos os Estudos</h3>
                    </div>
                    <p className="text-sm text-amber-700 mb-4">
                      Faça upgrade da sua assinatura para acessar estudos premium exclusivos
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/assinatura'}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Fazer Assinatura
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
                Nenhuma categoria disponível.
              </div>
            )}
          </>
        ) : (
          <Card className="spiritual-card max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum estudo disponível</h3>
              <p className="text-muted-foreground">
                Em breve teremos estudos bíblicos incríveis para você!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informações adicionais */}
        <div className="mt-12">
          <Card className="spiritual-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Como funcionam os estudos?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Escolha a Categoria</h4>
                  <p className="text-sm text-muted-foreground">
                    Selecione uma área que fale ao seu coração
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Navegue Livremente</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesse qualquer capítulo na ordem que preferir
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Aplique na Vida</h4>
                  <p className="text-sm text-muted-foreground">
                    Reflita, ore e pratique os ensinamentos
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