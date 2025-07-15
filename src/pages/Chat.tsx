import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart, ShoppingCart, AlertCircle, Coins } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAdManager } from "@/hooks/useAdManager";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>(
    "Olá! Que a paz do Senhor esteja contigo. Como posso te ajudar em sua jornada espiritual hoje?"
  );
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [platform, setPlatform] = useState<string>('android');
  const navigate = useNavigate();
  const { showRewardedAd } = useAdManager({ versesPerAd: 5, studiesPerAd: 1 });

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      if (!error && data) setCredits(data.credits);
    };
    fetchCredits();
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    // Verificar se o usuário tem créditos
    if (credits !== null && credits < 1) {
      toast({
        title: "Sem créditos",
        description: "Você precisa de pelo menos 1 crédito para enviar mensagens. Compre créditos ou assista um anúncio.",
        variant: "destructive"
      });
      return;
    }

    const currentMessage = newMessage;
    setNewMessage("");
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const response = await fetch('https://ssylplbgacuwkqkkhric.supabase.co/functions/v1/spiritual-chat-with-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: currentMessage,
          user_id: user.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Verificar se é erro de créditos insuficientes
        if (data.error?.includes('Créditos insuficientes') || response.status === 402) {
          toast({
            title: "Sem créditos",
            description: "Você precisa de pelo menos 1 crédito para enviar mensagens. Compre créditos ou assista um anúncio.",
            variant: "destructive"
          });
          return;
        }
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }
      
      setCurrentResponse(data?.response || "Mensagem enviada com sucesso.");
      
      // Atualizar créditos com o valor retornado pela função
      if (typeof data?.credits === 'number') {
        setCredits(data.credits);
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro na conversa",
        description: error.message || "Não foi possível receber uma resposta. Tente novamente.",
        variant: "destructive"
      });
      setCurrentResponse("Peço perdão, meu filho/filha. Estou enfrentando dificuldades técnicas no momento. Que tal voltarmos a conversar em alguns instantes? Que Deus te abençoe!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  const handleBuyCredits = async () => {
    setLoadingCheckout(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const response = await fetch('https://ssylplbgacuwkqkkhric.supabase.co/functions/v1/create-credits-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      });
      const result = await response.json();
      if (result.url) {
        window.open(result.url, '_blank');
      } else {
        toast({ title: 'Erro', description: result.error || 'Erro ao criar checkout', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao criar checkout', variant: 'destructive' });
    } finally {
      setLoadingCheckout(false);
    }
  };

  // Função para assistir anúncio e ganhar créditos
  const handleWatchAd = async () => {
    try {
      await showRewardedAd(async () => {
        // Callback executado quando o usuário recebe a recompensa
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ credits: (credits ?? 0) + 3 })
            .eq('user_id', user.id);

          if (error) {
            console.error('[AdMob] Erro ao atualizar créditos:', error);
            toast({
              title: 'Erro ao salvar créditos',
              description: error.message || 'Tente novamente mais tarde.',
              variant: 'destructive',
            });
          } else {
            console.log('[AdMob] Créditos atualizados com sucesso!');
            setCredits((c) => (c ?? 0) + 3);
            toast({
              title: 'Parabéns!',
              description: 'Você ganhou 3 créditos!',
            });
          }
        } catch (error) {
          console.error('[AdMob] Erro inesperado:', error);
          toast({
            title: 'Erro inesperado',
            description: 'Tente novamente mais tarde.',
            variant: 'destructive',
          });
        }
      });
    } catch (err) {
      console.error('[AdMob] Erro ao exibir anúncio:', err);
      toast({
        title: 'Erro ao exibir anúncio',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                Conversa Espiritual
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para conversar sobre fé e receber orientação espiritual
              </p>
              <Button className="divine-button" onClick={handleAuthClick}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left mb-8">
          <div>
            <h1 className="flex justify-center md:justify-start items-center text-2xl md:text-4xl font-bold heavenly-text mb-2 md:mb-0">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 mr-3 text-primary" />
              Conversa Espiritual
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Um espaço sagrado para compartilhar sua fé e receber orientação
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-2 justify-center md:justify-end">
            <Button
              className="divine-button text-lg px-8 py-3 w-60 h-14 flex items-center justify-center"
              onClick={() => navigate("/comprar-creditos")}
            >
              <ShoppingCart className="w-5 h-5" /> Comprar Créditos
            </Button>
            {credits !== null && credits < 1 && (
              <Button
                className="divine-button text-lg px-8 py-3 w-60 h-14 flex items-center justify-center"
                onClick={handleWatchAd}
              >
                Ver anúncio e ganhar +3
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Alerta para usuários sem créditos */}
          {credits !== null && credits < 1 && (
            <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                Você precisa de pelo menos 1 crédito para enviar mensagens. Compre créditos ou assista um anúncio para ganhar +3 créditos.
              </AlertDescription>
            </Alert>
          )}

          <Card className="spiritual-card min-h-[600px] flex flex-col bg-card dark:bg-zinc-900">
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-left text-lg md:text-xl">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                Conversa Espiritual
              </CardTitle>
              <Badge className="absolute top-0 right-0 mt-2 mr-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                <Coins className="w-3 h-3 mr-1" />
                Créditos: {credits !== null ? credits : '...'}
              </Badge>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 bg-muted/20 min-h-[400px] relative">
                <ScrollArea className="h-full w-full absolute inset-0">
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground p-4 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 text-foreground p-6 rounded-lg text-left leading-relaxed">
                        <p className="whitespace-pre-wrap">{currentResponse}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="p-6 border-t border-border bg-card dark:bg-[#21232b]">
                <div className="flex gap-2 w-full items-center">
                  <Textarea
                    placeholder={credits !== null && credits < 1 ? "Você precisa de pelo menos 1 crédito para enviar mensagens..." : "Compartilhe o que está em seu coração... (1 crédito por mensagem)"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-left h-14 text-base resize-none"
                    disabled={credits !== null && credits < 1}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || isLoading || (credits !== null && credits < 1)}
                    className="divine-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Informação sobre custo */}
                {credits !== null && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Cada mensagem custa 1 crédito
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
