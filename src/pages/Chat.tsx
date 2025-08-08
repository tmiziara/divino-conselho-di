import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart, ShoppingCart, AlertCircle, Coins, RefreshCw } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAdManager } from "@/hooks/useAdManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { spiritualChatService } from "@/services/spiritualChatService";

// Função para gerenciar contexto local
const getLocalContext = (userId: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `chat_context_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
};

const saveLocalContext = (userId: string, context: any[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `chat_context_${userId}`;
    // Manter apenas as últimas 10 mensagens para contexto
    const limitedContext = context.slice(-10);
    localStorage.setItem(key, JSON.stringify(limitedContext));
  }
};

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
      console.log('Iniciando envio de mensagem...');
      
      // Obter contexto local
      const conversationHistory = getLocalContext(user.id);
      console.log('Contexto local:', conversationHistory);
      
      // Enviar mensagem usando o serviço local
      console.log('Chamando spiritualChatService...');
      const response = await spiritualChatService.sendMessage(currentMessage, conversationHistory);
      console.log('Resposta do serviço:', response);
      
      if (response.error) {
        console.error('Erro na resposta:', response.error);
        toast({
          title: "Erro",
          description: response.error,
          variant: "destructive"
        });
        return;
      }

      // Atualizar resposta
      if (response.response) {
        setCurrentResponse(response.response);
        
        // Salvar contexto local (mensagem do usuário + resposta da IA)
        const newContext = [
          ...conversationHistory,
          { role: 'user', content: currentMessage },
          { role: 'assistant', content: response.response }
        ];
        saveLocalContext(user.id, newContext);
      }

      // Atualizar créditos
      if (typeof response.credits === 'number') {
        setCredits(response.credits);
        toast({
          title: "Mensagem enviada",
          description: `Resposta recebida! Créditos restantes: ${response.credits}`,
        });
      }
      
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro na conversa",
        description: "Não foi possível receber uma resposta. Tente novamente. Seu crédito não foi consumido.",
        variant: "destructive"
      });
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
    navigate('/comprar-creditos');
  };

  const handleWatchAd = async () => {
    try {
      console.log('[Chat] Iniciando handleWatchAd');
      
      let creditsAdded = false;
      
      await showRewardedAd(async () => {
        // Este callback é executado quando o usuário assiste o anúncio completo
        console.log('[Chat] Anúncio assistido, adicionando créditos...');
        try {
          const result = await spiritualChatService.watchAdForCredits();
          console.log('[Chat] Resultado do watchAdForCredits:', result);
          if (result.success) {
            creditsAdded = true;
            toast({
              title: "Créditos ganhos!",
              description: "Você ganhou 3 créditos por assistir o anúncio.",
            });
            // Atualizar créditos
            setCredits(result.credits);
            console.log('[Chat] Créditos atualizados:', result.credits);
          } else {
            console.error('[Chat] Erro ao adicionar créditos:', result.error);
            toast({
              title: "Erro",
              description: result.error || "Erro ao adicionar créditos.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('[Chat] Erro ao adicionar créditos:', error);
          toast({
            title: "Erro",
            description: "Erro ao processar créditos. Tente novamente.",
            variant: "destructive"
          });
        }
      });
      
      // Fallback: se após 5 segundos os créditos não foram adicionados, adicionar manualmente
      setTimeout(async () => {
        if (!creditsAdded) {
          console.log('[Chat] Fallback: adicionando créditos manualmente');
          try {
            const result = await spiritualChatService.watchAdForCredits();
            if (result.success) {
              toast({
                title: "Créditos ganhos!",
                description: "Você ganhou 3 créditos por assistir o anúncio.",
              });
              setCredits(result.credits);
              console.log('[Chat] Créditos adicionados via fallback:', result.credits);
            }
          } catch (error) {
            console.error('[Chat] Erro no fallback:', error);
          }
        }
      }, 5000);
      
    } catch (error) {
      console.error('[Chat] Erro ao assistir anúncio:', error);
      toast({
        title: "Erro no anúncio",
        description: "Não foi possível carregar o anúncio. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const reloadCredits = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', user.id)
      .single();
    if (!error && data) setCredits(data.credits);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Conversa Espiritual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Faça login para acessar a conversa espiritual e receber orientações baseadas na Bíblia.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              Conversa Espiritual
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Créditos: {credits !== null ? credits : '...'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={reloadCredits}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Área de resposta */}
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Pastor Virtual</p>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 leading-relaxed">
                      {currentResponse}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Área de entrada */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !newMessage.trim()}
                className="px-4"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWatchAd}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                Assistir Anúncio
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBuyCredits}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Comprar Créditos
              </Button>
            </div>

            {/* Alertas */}
            {credits !== null && credits < 3 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você tem poucos créditos. Assista um anúncio ou compre mais créditos para continuar conversando.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Chat;
