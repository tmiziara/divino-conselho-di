import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    id: 'free',
    name: 'Plano Free',
    price: 'Grátis',
    period: '',
    description: 'Acesso básico aos recursos espirituais',
    features: [
      'Leitura limitada da Bíblia',
      'Sistema de favoritos básico',
      'Chat espiritual limitado (5 mensagens/dia)',
      'Acesso a alguns devocionais'
    ],
    popular: false,
    isFree: true
  },
  {
    id: 'padrao',
    name: 'Plano Padrão',
    price: 'R$ 25',
    period: '/mês',
    description: 'Acesso completo aos recursos básicos',
    features: [
      'Leitura completa da Bíblia',
      'Sistema de favoritos',
      'Histórico de leitura',
      'Chat espiritual básico'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 'R$ 45',
    period: '/mês',
    description: 'Todos os recursos + funcionalidades avançadas',
    features: [
      'Todos os recursos do Plano Padrão',
      'Chat espiritual avançado',
      'Devocional diário personalizado',
      'Análises de progresso detalhadas',
      'Suporte prioritário'
    ],
    popular: true
  }
];

export const SubscriptionPlans = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, createCheckout, openCustomerPortal } = useSubscription();

  const handlePlanSelect = (planId: string) => {
    if (!user) {
      // Could redirect to login or show auth dialog
      return;
    }
    createCheckout(planId as 'padrao' | 'premium');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Escolha seu Plano</h2>
        <p className="text-muted-foreground">
          Selecione o plano ideal para sua jornada espiritual
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = subscribed ? subscription_tier === plan.id : plan.id === 'free';
          const isFreeUser = !subscribed && plan.id === 'free';
          
          return (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''} ${isFreeUser ? 'border-accent' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Mais Popular
                </Badge>
              )}
              
              {isFreeUser && (
                <Badge variant="secondary" className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                  Seu Plano Atual
                </Badge>
              )}
              
              {isCurrentPlan && subscribed && (
                <Badge variant="secondary" className="absolute -top-2 right-4">
                  Plano Atual
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.isFree ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    Plano Atual
                  </Button>
                ) : isCurrentPlan && subscribed ? (
                  <Button 
                    onClick={openCustomerPortal}
                    variant="outline" 
                    className="w-full"
                  >
                    Gerenciar Assinatura
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handlePlanSelect(plan.id)}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={!user}
                  >
                    {!user ? 'Faça login para assinar' : 'Assinar'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subscribed && (
        <div className="text-center mt-8">
          <Button 
            onClick={openCustomerPortal}
            variant="ghost"
            className="text-muted-foreground"
          >
            Gerenciar todas as assinaturas →
          </Button>
        </div>
      )}
    </div>
  );
};