import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Check subscription status after successful payment
    if (sessionId) {
      checkSubscription();
    }
  }, [sessionId, checkSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Realizado!</CardTitle>
          <CardDescription>
            Sua assinatura foi ativada com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Obrigado por assinar! Agora você tem acesso a todos os recursos do seu plano.
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                Voltar ao Início
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/biblia">
                Começar a Ler
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}