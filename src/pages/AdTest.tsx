import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { useAdManager } from "@/hooks/useAdManager";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/hooks/useLanguage";

const AdTest = () => {
  const { incrementVerseCount, incrementStudyCount, showRewardedAd, verseCount, studyCount } = useAdManager({
    versesPerAd: 3, // Test setting with fewer verses.
    studiesPerAd: 1,
  });
  const { subscription } = useSubscription();
  const { isEnglish } = useLanguage();
  const [lastAdTime, setLastAdTime] = useState(0);
  const [dailyAdCount, setDailyAdCount] = useState(0);
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const handleTestVerseAd = () => {
    incrementVerseCount();
  };

  const handleTestStudyAd = () => {
    incrementStudyCount();
  };

  const handleTestRewardedAd = async () => {
    await showRewardedAd(() => {});
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => {}} />

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{tx("Teste de Ads", "Ads Test")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <Badge variant={subscription.subscription_tier === "premium" ? "default" : "secondary"}>
                  {subscription.subscription_tier === "premium" ? "Premium" : tx("Gratuito", "Free")}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{tx("Versículos navegados:", "Verses navigated:")}</span>
                  <Badge variant="outline">{verseCount}/3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>{tx("Estudos completados:", "Studies completed:")}</span>
                  <Badge variant="outline">{studyCount}/1</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>{tx("Ads hoje:", "Ads today:")}</span>
                  <Badge variant="outline">{dailyAdCount}/20</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>{tx("Cooldown:", "Cooldown:")}</span>
                  <Badge variant="outline">
                    {lastAdTime > 0 ? `${Math.ceil((60000 - (Date.now() - lastAdTime)) / 1000)}s` : tx("Pronto", "Ready")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleTestVerseAd} className="w-full" disabled={subscription.subscription_tier === "premium"}>
                  {tx("Simular Navegação de Versículo", "Simulate Verse Navigation")}
                </Button>

                <Button onClick={handleTestStudyAd} className="w-full" disabled={subscription.subscription_tier === "premium"}>
                  {tx("Simular Estudo Completado", "Simulate Completed Study")}
                </Button>

                <Button onClick={handleTestRewardedAd} className="w-full" disabled={subscription.subscription_tier === "premium"}>
                  {tx("Testar Ad Recompensado", "Test Rewarded Ad")}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-4">
                <p>{tx("• Ads só aparecem para usuários gratuitos", "• Ads only show for free users")}</p>
                <p>{tx("• Ad intersticial a cada 3 versículos", "• Interstitial ad every 3 verses")}</p>
                <p>{tx("• Ad intersticial a cada 1 estudo", "• Interstitial ad every 1 study")}</p>
                <p>{tx("• Ad recompensado disponível sempre", "• Rewarded ad always available")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdTest;
