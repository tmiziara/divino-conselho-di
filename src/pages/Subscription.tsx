import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

const Subscription = () => {
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
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Recursos básicos para começar sua jornada espiritual",
      features: [
        "Leitura completa da Bíblia",
        "Busca básica de versículos",
        "Favoritos limitados (10)",
        "Chat espiritual básico (5 mensagens/dia)",
      ],
      icon: Star,
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 45",
      period: "/mês",
      description: "Para líderes espirituais e estudantes avançados",
      features: [
        "Tudo do plano Básico",
        "Chat espiritual ilimitado",
        "Comentários bíblicos avançados",
        "Estudos temáticos exclusivos",
        "Grupos de estudo virtuais",
        "Exportação de anotações",
        "API para desenvolvedores",
        "Suporte premium 24/7",
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
        title: "Plano Gratuito",
        description: "Você já está no plano gratuito!",
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
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de pagamento.",
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
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de assinaturas.",
        variant: "destructive",
      });
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription.subscription_tier === planId;
  };

  const getButtonText = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return "Plano Atual";
    }
    return planId === "free" ? "Gratuito" : "Assinar Agora";
  };

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 heavenly-text">
            Escolha Seu Plano Espiritual
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial da sua jornada espiritual com nossos planos personalizados
          </p>
          
          {user && !subscriptionLoading && subscription !== undefined && subscription.subscribed && (
            <div className="mt-8">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Plano Atual: {subscription.subscription_tier === "premium" ? "Premium" : "Gratuito"}
              </Badge>
              <div className="mt-4">
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="border-primary/20"
                >
                  Gerenciar Assinatura
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
                      Mais Popular
                    </Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1">
                    <Badge className="bg-primary text-white">
                      <Check className="w-4 h-4 mr-1 inline-block" />
                      Plano Atual
                    </Badge>
                  </div>
                )}
                <Card className="bg-card dark:bg-zinc-900">
                  <CardHeader className="text-center pb-2 md:pb-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-full flex items-center justify-center mb-2 md:mb-3 ${
                      isCurrent ? 'bg-primary/20' : isSelected ? 'bg-primary/20' : 'bg-primary/10'
                    }`}>
                      <IconComponent className={`w-5 h-5 md:w-6 md:h-6 text-primary`} />
                    </div>
                    <CardTitle className="text-lg md:text-xl mb-1">{plan.name}</CardTitle>
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
                    <CardDescription className="text-xs md:text-sm leading-tight">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <ul className="mb-6 mt-2 space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrent}
                      className={`w-full ${isCurrent ? 'bg-primary text-white cursor-not-allowed' : isSelected ? 'bg-primary/80 text-white' : ''}`}
                    >
                      {isCurrent ? 'Plano Atual' : plan.id === 'free' ? 'Gratuito' : 'Assinar Agora'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 md:mt-16">
          <p className="text-muted-foreground text-sm md:text-base">
            Tem dúvidas? Entre em contato conosco e teremos prazer em ajudar.
          </p>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Subscription;

