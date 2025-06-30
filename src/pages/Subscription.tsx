import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const { subscription, createCheckoutSession, openCustomerPortal, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();

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
      id: "basico",
      name: "Básico",
      price: "R$ 25",
      period: "/mês",
      description: "Ideal para quem quer aprofundar seus estudos bíblicos",
      features: [
        "Tudo do plano Gratuito",
        "Favoritos ilimitados",
        "Chat espiritual expandido (50 mensagens/dia)",
        "Planos de leitura personalizados",
        "Notas e comentários pessoais",
        "Suporte prioritário",
      ],
      icon: Crown,
      popular: true,
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
      popular: false,
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
    if (planId === "free") {
      return "Gratuito";
    }
    return "Assinar Agora";
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
                Plano Atual: {subscription.subscription_tier === "basico" ? "Básico" : "Premium"}
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
            
            return (
              <Card 
                key={plan.id} 
                className={`spiritual-card relative ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                } ${isCurrent ? 'bg-primary/5 border-primary' : ''} 
                h-fit flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2 md:pb-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-full flex items-center justify-center mb-2 md:mb-3 ${
                    isCurrent ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <IconComponent className={`w-5 h-5 md:w-6 md:h-6 ${
                      isCurrent ? 'text-primary' : 'text-primary'
                    }`} />
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
                
                <CardContent className="flex-1 flex flex-col pt-0 md:pt-2">
                  <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-3 h-3 md:w-4 md:h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs md:text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || checkoutLoading === plan.id}
                    className={`w-full ${
                      plan.popular && !isCurrent ? 'divine-button' : ''
                    } ${isCurrent ? 'bg-muted text-muted-foreground' : ''}`}
                    variant={plan.popular && !isCurrent ? 'default' : 'outline'}
                    size="sm"
                  >
                    {checkoutLoading === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      getButtonText(plan.id)
                    )}
                  </Button>
                </CardContent>
              </Card>
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

