import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useAdManager } from "@/hooks/useAdManager";
import { useSubscription } from "@/hooks/useSubscription";

const AdTest = () => {
  const { incrementVerseCount, incrementStudyCount, showRewardedAd, verseCount, studyCount } = useAdManager({ 
    versesPerAd: 3, // Teste com menos versículos
    studiesPerAd: 1 
  });
  const { subscription } = useSubscription();
  const [lastAdTime, setLastAdTime] = useState(0);
  const [dailyAdCount, setDailyAdCount] = useState(0);

  const handleTestVerseAd = () => {
    incrementVerseCount();
  };

  const handleTestStudyAd = () => {
    incrementStudyCount();
  };

  const handleTestRewardedAd = async () => {
    await showRewardedAd(() => {
      console.log('Recompensa recebida!');
    });
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => {}} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Teste de Ads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="text-center mb-4">
                <Badge variant={subscription.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                  {subscription.subscription_tier === 'premium' ? 'Premium' : 'Gratuito'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Versículos navegados:</span>
                  <Badge variant="outline">{verseCount}/3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estudos completados:</span>
                  <Badge variant="outline">{studyCount}/1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ads hoje:</span>
                  <Badge variant="outline">{dailyAdCount}/20</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cooldown:</span>
                  <Badge variant="outline">
                    {lastAdTime > 0 ? `${Math.ceil((60000 - (Date.now() - lastAdTime)) / 1000)}s` : 'Pronto'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleTestVerseAd}
                  className="w-full"
                  disabled={subscription.subscription_tier === 'premium'}
                >
                  Simular Navegação de Versículo
                </Button>

                <Button 
                  onClick={handleTestStudyAd}
                  className="w-full"
                  disabled={subscription.subscription_tier === 'premium'}
                >
                  Simular Estudo Completado
                </Button>

                <Button 
                  onClick={handleTestRewardedAd}
                  className="w-full"
                  disabled={subscription.subscription_tier === 'premium'}
                >
                  Testar Ad Recompensado
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-4">
                <p>• Ads só aparecem para usuários gratuitos</p>
                <p>• Ad intersticial a cada 3 versículos</p>
                <p>• Ad intersticial a cada 1 estudo</p>
                <p>• Ad recompensado disponível sempre</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdTest; 