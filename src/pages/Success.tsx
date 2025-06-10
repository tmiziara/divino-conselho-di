import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const Success = () => {
  const { checkSubscription } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    // Check subscription status after successful payment
    const timer = setTimeout(() => {
      checkSubscription();
      toast({
        title: "Pagamento Confirmado!",
        description: "Sua assinatura foi ativada com sucesso.",
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkSubscription, toast]);

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
                <Link to="/perfil">
                  <Button className="divine-button">
                    Ver Meu Perfil
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/biblia">
                  <Button variant="outline" className="border-primary/20">
                    Explorar Bíblia
                  </Button>
                </Link>
              </div>
              
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Você receberá um email de confirmação em breve. 
                  Se tiver alguma dúvida, não hesite em nos contatar.
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