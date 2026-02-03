import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Subscription = () => {
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);
  const [showAuth, setShowAuth] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { subscription, createCheckoutSession, openCustomerPortal, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedPlan = params.get("plan");
  const [selected, setSelected] = useState<string | null>(selectedPlan);

  const plans = [
    {
      id: "free",
      name: tx("Gratuito", "Free"),
      price: "R$ 0",
      period: tx("/mês", "/month"),
      description: tx("Recursos essenciais para iniciar sua jornada espiritual", "Essential features to start your spiritual journey"),
      features: [
        tx("Leitura completa da Bíblia", "Full Bible reading"),
        tx("Busca de versículos", "Verse search"),
        tx("Favoritos limitados (10)", "Limited favorites (10)"),
        tx("Chat com créditos (limitado)", "Chat with credits (limited)"),
      ],
      icon: Star,
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 15",
      period: tx("/mês", "/month"),
      description: tx("Acesso total ao conteúdo premium do app", "Full access to premium app content"),
      features: [
        tx("Tudo do plano Gratuito", "Everything in the Free plan"),
        tx("Versões AA/ACF da Bíblia", "AA/ACF Bible versions"),
        tx("Estudos bíblicos premium", "Premium Bible studies"),
        tx("Favoritos ilimitados", "Unlimited favorites"),
        tx("Chat sem consumir créditos", "Chat without spending credits"),
        tx("Sem anúncios", "No ads"),
      ],
      icon: Zap,
      popular: true,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (planId === "free") {
      toast({
        title: tx("Plano Gratuito", "Free Plan"),
        description: tx("Você já está no plano gratuito!", "You are already on the free plan!"),
      });
      return;
    }

    try {
      setCheckoutLoading(planId);
      const data = await createCheckoutSession(planId as "basico" | "premium");
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível iniciar o processo de pagamento.", "Could not start the checkout process."),
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const data = await openCustomerPortal();
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível abrir o portal de assinaturas.", "Could not open the subscriptions portal."),
        variant: "destructive",
      });
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription.subscription_tier === planId;
  };

  const getButtonText = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return tx("Plano Atual", "Current Plan");
    }
    return planId === "free" ? tx("Gratuito", "Free") : tx("Assinar Agora", "Subscribe Now");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 heavenly-text">
            {tx("Escolha Seu Plano Espiritual", "Choose Your Spiritual Plan")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {tx("Desbloqueie todo o potencial da sua jornada espiritual com nossos planos personalizados", "Unlock the full potential of your spiritual journey with our personalized plans")}
          </p>
          
          {user && !subscriptionLoading && subscription !== undefined && subscription.subscribed && (
            <div className="mt-8">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {/* Phase 3 fix: reflect legacy "basic" tier correctly in UI */}
                {tx("Plano Atual", "Current Plan")}: {subscription.subscription_tier === "premium" ? "Premium" : subscription.subscription_tier === "basic" ? tx("Básico", "Basic") : tx("Gratuito", "Free")}
              </Badge>
              <div className="mt-4">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/5"
                >
                  {tx("Gerenciar Assinatura", "Manage Subscription")}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrent = isCurrentPlan(plan.id);
            const isSelected = selected === plan.id;
            return (
              <div key={plan.id} className="relative flex flex-col cursor-pointer" onClick={() => setSelected(plan.id)}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground">
                      {tx("Mais Popular", "Most Popular")}
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1">
                    <Badge className="bg-primary text-primary-foreground">
                      <Check className="w-4 h-4 mr-1 inline-block" />
                      {tx("Plano Atual", "Current Plan")}
                    </Badge>
                  </div>
                )}
                <Card className={`bg-card border border-border hover:border-primary/30 transition-all duration-300 ${
                  isCurrent ? 'ring-2 ring-primary/20' : isSelected ? 'ring-2 ring-primary/20' : ''
                }`}>
                  <CardHeader className="text-center pb-2 md:pb-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-full flex items-center justify-center mb-2 md:mb-3 ${
                      isCurrent ? 'bg-primary/20' : isSelected ? 'bg-primary/20' : 'bg-primary/10'
                    }`}>
                      <IconComponent className={`w-5 h-5 md:w-6 md:h-6 text-primary`} />
                    </div>
                    <CardTitle className="text-lg md:text-xl mb-1 text-card-foreground">{plan.name}</CardTitle>
                    <div className="mb-1 md:mb-2">
                      <div className="flex items-baseline justify-center gap-0">
                        <span className="text-xl md:text-2xl font-bold text-primary">
                          {plan.price}
                        </span>
                        <span className="text-sm md:text-base text-muted-foreground font-normal">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                    <CardDescription className="text-xs md:text-sm leading-tight text-muted-foreground">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <ul className="mb-6 mt-2 space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrent}
                      className={`w-full ${
                        isCurrent 
                          ? 'bg-primary/50 text-primary-foreground cursor-not-allowed' 
                          : isSelected 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {isCurrent ? tx("Plano Atual", "Current Plan") : plan.id === 'free' ? tx("Gratuito", "Free") : tx("Assinar Agora", "Subscribe Now")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 md:mt-16">
          <p className="text-muted-foreground text-sm md:text-base">
            {tx("Tem dúvidas? Entre em contato conosco e teremos prazer em ajudar.", "Have questions? Contact us and we will be glad to help.")}
          </p>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Subscription;
