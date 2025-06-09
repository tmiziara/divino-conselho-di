import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function Cancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription>
            Nenhuma cobrança foi realizada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada em seu cartão.
          </p>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                Voltar ao Início
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                Ver Planos Novamente
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}