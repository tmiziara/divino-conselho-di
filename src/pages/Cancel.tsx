import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function Cancel() {
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">{tx("Pagamento Cancelado", "Payment Canceled")}</CardTitle>
          <CardDescription>
            {tx("Nenhuma cobrança foi realizada", "No charge was made")}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {tx("Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada em seu cartão.", "You canceled the payment flow. No charge was made to your card.")}
          </p>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/">
                {tx("Voltar ao Início", "Back to Home")}
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/">
                {tx("Ver Planos Novamente", "View Plans Again")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
