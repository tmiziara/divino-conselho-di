import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShoppingCart, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "@/components/AuthDialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

const creditPackages = [
  { credits: 5, price: "R$ 5,00" },
  { credits: 10, price: "R$ 10,00" },
  { credits: 25, price: "R$ 22,50" },
];

export default function BuyCredits() {
  const [loading, setLoading] = React.useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const handleAuthClick = () => setShowAuth(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const handleBuy = async (credits: number) => {
    setLoading(credits);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch("https://ssylplbgacuwkqkkhric.supabase.co/functions/v1/create-credits-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ credits }),
      });
      const result = await response.json();
      if (result.url) {
        window.open(result.url, "_blank");
        toast({
          title: tx("Checkout criado", "Checkout created"),
          description: tx("Redirecionando para o pagamento...", "Redirecting to payment..."),
        });
      } else {
        toast({
          title: tx("Erro", "Error"),
          description: result.error || tx("Erro ao criar checkout", "Error creating checkout"),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Erro ao criar checkout. Tente novamente.", "Error creating checkout. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/chat")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {tx("Voltar ao Chat", "Back to Chat")}
          </Button>
        </div>
        <h2 className="text-2xl font-bold heavenly-text text-center mb-6">{tx("Pacotes de Créditos", "Credit Packages")}</h2>
        <p className="text-center text-muted-foreground mb-6">
          {tx("Compre créditos para usar no chat espiritual. Cada mensagem custa 1 crédito.", "Buy credits to use in spiritual chat. Each message costs 1 credit.")}
        </p>
        <div className="flex flex-col gap-6 items-center">
          {creditPackages.map((pkg) => (
            <div key={pkg.credits} className="border rounded-lg p-6 w-full max-w-xs flex flex-col items-center bg-card text-card-foreground dark:bg-zinc-900 dark:text-white shadow-md">
              <Coins className="w-8 h-8 text-primary mb-2" />
              <span className="text-lg font-semibold heavenly-text mb-1">{pkg.credits} {tx("créditos", "credits")}</span>
              <span className="text-primary text-2xl font-bold mb-4">{pkg.price}</span>
              <Button
                className="w-full flex items-center justify-center gap-2 divine-button"
                onClick={() => handleBuy(pkg.credits)}
                disabled={loading === pkg.credits}
              >
                <ShoppingCart className="w-4 h-4" />
                {loading === pkg.credits ? tx("Aguarde...", "Please wait...") : tx("Comprar", "Buy")}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
}
