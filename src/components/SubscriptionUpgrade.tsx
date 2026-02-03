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
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

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
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const features = [
    {
      icon: BookOpen,
      title: tx('Estudos Biblicos Premium', 'Premium Bible Studies'),
      description: tx('Acesso completo a todos os estudos biblicos', 'Full access to all Bible studies')
    },
    {
      icon: MessageCircle,
      title: tx('Chat Espiritual', 'Spiritual Chat'),
      description: tx('Converse com IA sobre questoes espirituais', 'Talk with AI about spiritual questions')
    },
    {
      icon: Download,
      title: tx('Modo Offline', 'Offline Mode'),
      description: tx('Baixe estudos para usar sem internet', 'Download studies to use without internet')
    },
    {
      icon: Shield,
      title: tx('Conteudo Exclusivo', 'Exclusive Content'),
      description: tx('Versiculos e reflexoes especiais', 'Special verses and reflections')
    }
  ];

  const plans = [
    {
      name: tx('Mensal', 'Monthly'),
      price: 'R$ 9,90',
      period: tx('/mes', '/month'),
      popular: false
    },
    {
      name: tx('Anual', 'Yearly'),
      price: 'R$ 99,90',
      period: tx('/ano', '/year'),
      popular: true,
      savings: tx('Economize R$ 19,90', 'Save R$ 19,90')
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
          {tx('Desbloqueie Todo o Conteudo', 'Unlock All Content')}
        </CardTitle>
        <p className="text-muted-foreground">
          {tx('Faca upgrade para acessar estudos premium, chat espiritual e muito mais', 'Upgrade to access premium studies, spiritual chat, and more')}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
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
                  {tx('Mais Popular', 'Most Popular')}
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

        <div className="space-y-3">
          <h4 className="font-semibold text-center mb-4">{tx('O que voce ganha:', 'What you get:')}</h4>
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

        <div className="space-y-3">
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {tx('Fazer Upgrade Agora', 'Upgrade Now')}
          </Button>

          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              {tx('Continuar com versao gratuita', 'Continue with free version')}
            </Button>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>{tx('Cancelamento a qualquer momento', 'Cancel anytime')}</p>
          <p>{tx('7 dias de garantia', '7-day guarantee')}</p>
          <p>{tx('Acesso imediato', 'Instant access')}</p>
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
