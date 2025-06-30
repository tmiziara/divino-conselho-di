import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sparkles, 
  BookOpen, 
  MessageCircle, 
  Download, 
  Shield,
  Check,
  Lock
} from 'lucide-react';

interface SubscriptionUpgradeProps {
  onUpgrade: () => void;
  onClose?: () => void;
  variant?: 'modal' | 'inline';
}

const SubscriptionUpgrade: React.FC<SubscriptionUpgradeProps> = ({ 
  onUpgrade, 
  onClose, 
  variant = 'inline' 
}) => {
  const features = [
    {
      icon: BookOpen,
      title: 'Estudos Bíblicos Premium',
      description: 'Acesso completo a todos os estudos bíblicos'
    },
    {
      icon: MessageCircle,
      title: 'Chat Espiritual',
      description: 'Converse com IA sobre questões espirituais'
    },
    {
      icon: Download,
      title: 'Modo Offline',
      description: 'Baixe estudos para usar sem internet'
    },
    {
      icon: Shield,
      title: 'Conteúdo Exclusivo',
      description: 'Versículos e reflexões especiais'
    }
  ];

  const plans = [
    {
      name: 'Mensal',
      price: 'R$ 9,90',
      period: '/mês',
      popular: false
    },
    {
      name: 'Anual',
      price: 'R$ 99,90',
      period: '/ano',
      popular: true,
      savings: 'Economize R$ 19,90'
    }
  ];

  const content = (
    <Card className="spiritual-card border-2 border-gradient-to-r from-amber-500 to-orange-500">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          Desbloqueie Todo o Conteúdo
        </CardTitle>
        <p className="text-muted-foreground">
          Faça upgrade para acessar estudos premium, chat espiritual e muito mais
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative cursor-pointer transition-all hover:scale-105 ${
                plan.popular 
                  ? 'border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50' 
                  : 'border border-border'
              }`}
              onClick={() => onUpgrade()}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500">
                  Mais Popular
                </Badge>
              )}
              <CardContent className="pt-6 text-center">
                <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.savings && (
                  <p className="text-sm text-green-600 font-medium">{plan.savings}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Funcionalidades */}
        <div className="space-y-3">
          <h4 className="font-semibold text-center mb-4">O que você ganha:</h4>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 bg-primary/10 rounded-full">
                <feature.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-sm">{feature.title}</h5>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              <Check className="w-4 h-4 text-green-500" />
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Fazer Upgrade Agora
          </Button>
          
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline" 
              className="w-full"
            >
              Continuar com versão gratuita
            </Button>
          )}
        </div>

        {/* Garantia */}
        <div className="text-center text-xs text-muted-foreground">
          <p>✓ Cancelamento a qualquer momento</p>
          <p>✓ 7 dias de garantia</p>
          <p>✓ Acesso imediato</p>
        </div>
      </CardContent>
    </Card>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default SubscriptionUpgrade; 