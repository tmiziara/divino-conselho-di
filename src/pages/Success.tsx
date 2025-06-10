import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const Success = () => {
  const { checkSubscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Show success message and check subscription
    toast({
      title: "Pagamento Confirmado!",
      description: "Sua assinatura foi ativada com sucesso.",
    });

    // Check subscription and redirect to home after 3 seconds
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      checkSubscription().then(() => {
        navigate('/', { replace: true });
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkSubscription, toast, navigate]);

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={() => {}} />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="spiritual-card">
            <CardHeader>
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl heavenly-text">
                Pagamento Realizado com Sucesso!
              </CardTitle>
              <CardDescription className="text-lg">
                Bem-vindo(a) à sua nova jornada espiritual premium
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-muted-foreground">
                <p>
                  Sua assinatura foi ativada e você já pode aproveitar todos os recursos premium.
                  Estamos atualizando seu perfil - isso pode levar alguns instantes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isRedirecting ? (
                  <Button disabled className="divine-button">
                    Redirecionando...
                  </Button>
                ) : (
                  <>
                    <Link to="/">
                      <Button className="divine-button">
                        Ir para Início
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/perfil">
                      <Button variant="outline" className="border-primary/20">
                        Ver Meu Perfil
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {isRedirecting ? (
                    "Redirecionando você para a página inicial em instantes..."
                  ) : (
                    "Você receberá um email de confirmação em breve. Redirecionamento automático em 3 segundos..."
                  )}
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