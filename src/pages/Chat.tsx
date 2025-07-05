import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart, ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { AdMob, AdMobRewardItem } from '@capacitor-community/admob';
import { Device } from '@capacitor/device';

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

  // Detectar plataforma uma vez
  useEffect(() => {
    const detectPlatform = async () => {
      try {
        const info = await Device.getInfo();
        setPlatform(info.platform);
      } catch (error) {
        console.log('Erro ao detectar plataforma:', error);
        setPlatform('android'); // fallback
      }
    };
    detectPlatform();
  }, []);



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
    const currentMessage = newMessage;
    setNewMessage("");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spiritual-chat-with-credits', {
        body: {
          user_id: user.id,
          message: currentMessage
        }
      });
      if (error) throw error;
      setCurrentResponse(data?.response || "Mensagem enviada com sucesso.");
      if (typeof data?.credits === 'number') setCredits(data.credits);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro na conversa",
        description: "Não foi possível receber uma resposta. Tente novamente.",
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
      // Adicionar listener para recompensa ANTES de preparar o anúncio
      console.log('[AdMob] Adicionando listeners...');
      
      // Listener para quando o anúncio é carregado
      const loadedListener = await (AdMob as any).addListener(
        'onRewardedVideoAdLoaded',
        () => {
          console.log('[AdMob] Anúncio carregado com sucesso!');
        }
      );

      // Listener para recompensa (evento 'rewarded')
      const rewardListener = await (AdMob as any).addListener(
        'rewarded',
        async (reward: AdMobRewardItem) => {
          console.log('[AdMob] rewarded event fired!');
          console.log('[AdMob] reward:', reward);
          console.log('[AdMob] user.id:', user.id);
          console.log('[AdMob] credits antes:', credits);

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

          // Remover listeners após uso
          rewardListener.remove();
          loadedListener.remove();
        }
      );

      // Listener para recompensa (evento 'onRewardedVideoAdReward' - nome alternativo)
      const rewardListener2 = await (AdMob as any).addListener(
        'onRewardedVideoAdReward',
        async (reward: AdMobRewardItem) => {
          console.log('[AdMob] onRewardedVideoAdReward event fired!');
          console.log('[AdMob] reward:', reward);
          console.log('[AdMob] user.id:', user.id);
          console.log('[AdMob] credits antes:', credits);

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

          // Remover listeners após uso
          rewardListener.remove();
          rewardListener2.remove();
          loadedListener.remove();
        }
      );
      console.log('[AdMob] Listeners adicionados com sucesso');

      // Agora preparar o anúncio
      console.log('[AdMob] Preparando anúncio...');
      await AdMob.prepareRewardVideoAd({
        adId: (platform === 'ios')
          ? 'ca-app-pub-3940256099942544/1712485313'
          : 'ca-app-pub-3940256099942544/5224354917',
        isTesting: true,
      });
      console.log('[AdMob] Anúncio preparado');

      // Mostrar o anúncio
      console.log('[AdMob] Exibindo anúncio...');
      await AdMob.showRewardVideoAd();
      console.log('[AdMob] Comando para exibir anúncio enviado');
    } catch (err) {
      console.error('[AdMob] Erro ao preparar/exibir anúncio:', err);
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
            {credits === 0 && (
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
          <Card className="spiritual-card min-h-[600px] flex flex-col bg-card dark:bg-zinc-900">
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-left text-lg md:text-xl">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                Conversa Espiritual
              </CardTitle>
              <Badge className="absolute top-0 right-0 mt-2 mr-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
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
                    placeholder="Compartilhe o que está em seu coração..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-left h-14 text-base resize-none"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || isLoading}
                    className="divine-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
