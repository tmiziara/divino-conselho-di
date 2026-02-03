import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/analytics";
import { useLanguage } from "@/hooks/useLanguage";

const Success = () => {
  const { checkSubscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user } = useAuth();
  const { isEnglish } = useLanguage();
  const tx = useCallback((pt: string, en: string) => (isEnglish ? en : pt), [isEnglish]);

  useEffect(() => {
    toast({
      title: tx("Pagamento Confirmado!", "Payment Confirmed!"),
      description: tx("Sua assinatura foi ativada com sucesso.", "Your subscription was activated successfully."),
    });

    if (user?.id) {
      trackEvent({
        event_name: "subscription_start",
        user_id: user.id,
        properties: { source: "stripe_success" },
      });
    }

    const timer = setTimeout(() => {
      setIsRedirecting(true);
      checkSubscription().then(() => {
        navigate("/", { replace: true });
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkSubscription, toast, navigate, user?.id, tx]);

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={() => {}} />

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl heavenly-text">
                {tx("Pagamento Realizado com Sucesso!", "Payment Completed Successfully!")}
              </CardTitle>
              <CardDescription className="text-lg">
                {tx("Bem-vindo(a) à sua nova jornada espiritual premium", "Welcome to your new premium spiritual journey")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-muted-foreground">
                <p>
                  {tx("Sua assinatura foi ativada e você já pode aproveitar todos os recursos premium. Estamos atualizando seu perfil - isso pode levar alguns instantes.", "Your subscription has been activated and you can now enjoy all premium features. We are updating your profile - this may take a few moments.")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isRedirecting ? (
                  <Button disabled className="divine-button">
                    {tx("Redirecionando...", "Redirecting...")}
                  </Button>
                ) : (
                  <>
                    <Link to="/">
                      <Button className="divine-button">
                        {tx("Ir para Início", "Go to Home")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/perfil">
                      <Button variant="outline" className="border-primary/20">
                        {tx("Ver Meu Perfil", "View My Profile")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {isRedirecting
                    ? tx("Redirecionando você para a página inicial em instantes...", "Redirecting you to the home page in a moment...")
                    : tx("Você receberá um e-mail de confirmação em breve. Redirecionamento automático em 3 segundos...", "You will receive a confirmation email shortly. Automatic redirect in 3 seconds...")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Success;
