import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart, ShoppingCart, AlertCircle, Coins, RefreshCw, User, Sun, Moon, Infinity } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAdManager } from "@/hooks/useAdManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { spiritualChatService } from "@/services/spiritualChatService";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/hooks/useLanguage";

// Interface para mensagens
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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

// Função para carregar histórico de mensagens
const loadChatHistory = (userId: string): ChatMessage[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `chat_history_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Converter timestamps de volta para Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  }
  return [];
};

// Função para salvar histórico de mensagens
const saveChatHistory = (userId: string, messages: ChatMessage[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = `chat_history_${userId}`;
    // Manter apenas as últimas 50 mensagens para não sobrecarregar o localStorage
    const limitedMessages = messages.slice(-50);
    localStorage.setItem(key, JSON.stringify(limitedMessages));
  }
};

// Phase 5: sync a lightweight chat summary for cross-device continuity.
const syncChatSummary = async (userId: string, messages: ChatMessage[]) => {
  try {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    await supabase
      .from('chat_history_summaries')
      .upsert(
        {
          user_id: userId,
          total_messages: messages.length,
          last_message_at: lastMessage.timestamp.toISOString(),
          last_message_preview: lastMessage.content.slice(0, 160),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  } catch (error) {
    // Best-effort only; summary should not block chat.
  }
};

const Chat = () => {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { showRewardedAd } = useAdManager();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isEnglish } = useLanguage();
  const tx = useCallback((pt: string, en: string) => (isEnglish ? en : pt), [isEnglish]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [adTimer, setAdTimer] = useState<{ canWatch: boolean; remainingMinutes: number; remainingSeconds: number } | null>(null);
  const [adTimerInterval, setAdTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const summarySyncTimeoutRef = useRef<number | null>(null);

  // VERIFICAR SE É USUÁRIO PREMIUM
  const isPremium = subscription?.subscribed && subscription?.subscription_tier === 'premium';
  
  // DEBUG: Log do status premium

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup do timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (adTimerInterval) {
        clearInterval(adTimerInterval);
      }
    };
  }, [adTimerInterval]);

  useEffect(() => {
    return () => {
      if (summarySyncTimeoutRef.current !== null) {
        window.clearTimeout(summarySyncTimeoutRef.current);
      }
    };
  }, [user]);

  // Função para iniciar o timer do anúncio
  const startAdTimer = useCallback(() => {
    if (!user) return;

    try {
      const timerInfo = spiritualChatService.getAdTimerInfo(user.id);
      setAdTimer(timerInfo);

      // Se não puder assistir, iniciar contador regressivo
      if (!timerInfo.canWatch) {
        const interval = setInterval(() => {
          const updatedTimerInfo = spiritualChatService.getAdTimerInfo(user.id);
          setAdTimer(updatedTimerInfo);

          // Se puder assistir, parar o timer
          if (updatedTimerInfo.canWatch) {
            clearInterval(interval);
            setAdTimerInterval(null);
          }
        }, 1000); // Atualizar a cada segundo

        setAdTimerInterval(interval);
      }
    } catch (error) {
    }
  }, [user]);

  // Função para formatar o tempo restante
  const formatAdTimer = () => {
    if (!adTimer || adTimer.canWatch) return null;
    
    const minutes = adTimer.remainingMinutes.toString().padStart(2, '0');
    const seconds = adTimer.remainingSeconds.toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Função para carregar histórico de mensagens
  const queueChatSummarySync = useCallback((userId: string, updatedMessages: ChatMessage[]) => {
    if (summarySyncTimeoutRef.current !== null) {
      window.clearTimeout(summarySyncTimeoutRef.current);
    }
    summarySyncTimeoutRef.current = window.setTimeout(() => {
      syncChatSummary(userId, updatedMessages);
      summarySyncTimeoutRef.current = null;
    }, 1000);
  }, []);

  const loadChatHistoryLocal = useCallback((userId: string) => {
    const history = loadChatHistory(userId);
    if (history && history.length === 0) {
      // Mensagem de boas-vindas inicial
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: tx(
          "Olá! Que a paz do Senhor esteja contigo. Como posso te ajudar em sua jornada espiritual hoje?",
          "Hello! May the Lord's peace be with you. How can I help you in your spiritual journey today?"
        ),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      saveChatHistory(userId, [welcomeMessage]);
      // Phase 5: keep a server-side summary for cross-device resume.
      queueChatSummarySync(userId, [welcomeMessage]);
    } else if (history) {
      setMessages(history);
      // Phase 5: refresh summary from local history on load.
      queueChatSummarySync(userId, history);
    }
  }, [queueChatSummarySync, tx]);

  // Função para carregar contexto local
  const loadLocalContext = (userId: string) => {
    const context = getLocalContext(userId);
    // O contexto será usado quando necessário
  };

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const scrollElement = messagesEndRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

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
    
    // Verificar créditos apenas para usuários gratuitos
    if (!isPremium && credits !== null && credits < 1) {
      toast({
        title: tx("Sem créditos", "No credits"),
        description: tx(
          "Você precisa de pelo menos 1 crédito para enviar mensagens. Compre créditos ou assista um anúncio.",
          "You need at least 1 credit to send messages. Buy credits or watch an ad."
        ),
        variant: "destructive"
      });
      return;
    }

    const currentMessage = newMessage;
    setNewMessage("");
    setIsLoading(true);
    
    // Adicionar mensagem do usuário imediatamente
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => {
      const nextMessages = [...prev, userMessage];
      messagesRef.current = nextMessages;
      return nextMessages;
    });
    
    try {
      // Obter contexto local
      const conversationHistory = getLocalContext(user.id);
      
      // Enviar mensagem usando o serviço local
      const response = await spiritualChatService.sendMessage(currentMessage, conversationHistory);
      
      if (response.error) {
        toast({
          title: tx("Erro", "Error"),
          description: response.error,
          variant: "destructive"
        });
        return;
      }

      // Adicionar resposta da IA
      if (response.response) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };
        
        const baseMessages = messagesRef.current;
        const updatedMessages = [...baseMessages, aiMessage];
        setMessages(updatedMessages);
        messagesRef.current = updatedMessages;
        
        // Salvar contexto local (mensagem do usuário + resposta da IA)
        const newContext = [
          ...conversationHistory,
          { role: 'user', content: currentMessage },
          { role: 'assistant', content: response.response }
        ];
        saveLocalContext(user.id, newContext);
        
        // Salvar histórico completo
        saveChatHistory(user.id, updatedMessages);
        // Phase 5: update summary in Supabase for cross-device continuity.
        queueChatSummarySync(user.id, updatedMessages);
      }

      // Atualizar créditos
      if (typeof response.credits === 'number') {
        setCredits(response.credits);
        toast({
          title: tx("Mensagem enviada", "Message sent"),
          description: tx(
            `Resposta recebida! Créditos restantes: ${response.credits}`,
            `Response received! Remaining credits: ${response.credits}`
          ),
        });
      }
      
    } catch (error: any) {
      toast({
        title: tx("Erro na conversa", "Conversation error"),
        description: tx(
          "Não foi possível receber uma resposta. Tente novamente. Seu crédito não foi consumido.",
          "Could not receive a response. Please try again. Your credit was not consumed."
        ),
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
      
      let creditsAdded = false;
      
      await showRewardedAd(async () => {
        // Este callback é executado quando o usuário assiste o anúncio completo
        try {
          const result = await spiritualChatService.watchAdForCredits();
          if (result.success) {
            creditsAdded = true;
            toast({
              title: tx("Créditos ganhos!", "Credits earned!"),
              description: tx("Você ganhou 3 créditos por assistir o anúncio.", "You earned 3 credits for watching the ad."),
            });
            // Atualizar créditos
            setCredits(result.credits);
            
            // APENAS AQUI: Reiniciar timer do anúncio após recompensa entregue
            startAdTimer();
          } else {
            toast({
              title: tx("Erro", "Error"),
              description: result.error || tx("Erro ao adicionar créditos.", "Error adding credits."),
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: tx("Erro", "Error"),
            description: tx("Erro ao processar créditos. Tente novamente.", "Error processing credits. Please try again."),
            variant: "destructive"
          });
        }
      });
      
      // Fallback: se após 5 segundos os créditos não foram adicionados, adicionar manualmente
      setTimeout(async () => {
        if (!creditsAdded) {
          try {
            const result = await spiritualChatService.watchAdForCredits();
            if (result.success) {
              toast({
                title: tx("Créditos ganhos!", "Credits earned!"),
                description: tx("Você ganhou 3 créditos por assistir o anúncio.", "You earned 3 credits for watching the ad."),
              });
              setCredits(result.credits);
              
              // APENAS AQUI: Reiniciar timer do anúncio após recompensa entregue
              startAdTimer();
            }
          } catch (error) {
          }
        }
      }, 5000);
      
    } catch (error) {
      toast({
        title: tx("Erro no anúncio", "Ad error"),
        description: tx("Não foi possível carregar o anúncio. Tente novamente.", "Could not load the ad. Please try again."),
        variant: "destructive"
      });
    }
  };

  const reloadCredits = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', user.id)
      .single();
    if (!error && data) setCredits(data.credits);
  }, [user]);

  // Carregar histórico ao montar o componente
  useEffect(() => {
    if (user) {
      loadChatHistoryLocal(user.id);
      loadLocalContext(user.id);
      reloadCredits();
      startAdTimer();
    }
  }, [loadChatHistoryLocal, reloadCredits, startAdTimer, user]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(isEnglish ? 'en-US' : 'pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
                {tx("Conversa Espiritual", "Spiritual Chat")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {tx(
                    "Faça login para acessar a conversa espiritual e receber orientações baseadas na Bíblia.",
                    "Sign in to access spiritual chat and receive Bible-based guidance."
                  )}
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
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto bg-card border-border">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <MessageCircle className="w-6 h-6 text-primary" />
              {tx("Conversa Espiritual", "Spiritual Chat")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-secondary text-secondary-foreground border-border">
                {tx("Créditos", "Credits")}: {isPremium ? (
                  <span className="flex items-center gap-1">
                    <Infinity className="w-3 h-3" />
                    {tx("Ilimitados", "Unlimited")}
                  </span>
                ) : (
                  credits !== null ? credits : '...'
                )}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={reloadCredits}
                disabled={isLoading}
                className="text-muted-foreground hover:bg-muted"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme} // Usar toggle do useTheme
                className="ml-2 text-muted-foreground hover:bg-muted"
                title={isDark ? tx("Mudar para modo claro", "Switch to light mode") : tx("Mudar para modo escuro", "Switch to dark mode")}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-accent" />
                ) : (
                  <Moon className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 bg-card">
            {/* Área de chat com histórico */}
            <div className="bg-muted rounded-lg border border-border h-[500px] overflow-hidden">
              <ScrollArea ref={messagesEndRef} className="h-full">
                <div className="p-4 space-y-4 bg-muted">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-card-foreground border border-border'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="w-3 h-3 text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="text-sm leading-relaxed">
                              {message.content}
                            </div>
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicador de digitação */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-3 h-3 text-primary" />
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Área de entrada */}
            <div className="flex gap-2">
              <Textarea
                placeholder={tx("Digite sua mensagem...", "Type your message...")}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 min-h-[60px] resize-none bg-background text-foreground border-border placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !newMessage.trim()}
                className="px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Ações - OCULTAR PARA USUÁRIOS PREMIUM */}
            {!isPremium && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWatchAd}
                  disabled={isLoading || (adTimer && !adTimer.canWatch)}
                  className="flex items-center gap-2 border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Coins className="w-4 h-4" />
                  {adTimer && !adTimer.canWatch ? (
                    <span className="flex items-center gap-2">
                      {tx("Aguarde", "Wait")} {formatAdTimer()}
                    </span>
                  ) : (
                    tx("Assistir Anúncio", "Watch Ad")
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBuyCredits}
                  className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {tx("Comprar Créditos", "Buy Credits")}
                </Button>
              </div>
            )}

            {/* Alertas - OCULTAR PARA USUÁRIOS PREMIUM */}
            {!isPremium && credits !== null && credits < 3 && (
              <Alert className="bg-red-50 border-red-200 dark:bg-destructive/10 dark:border-destructive/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-destructive" />
                <AlertDescription className="text-red-800 dark:text-destructive-foreground">
                  {tx(
                    "Você tem poucos créditos. Assista um anúncio ou compre mais créditos para continuar conversando.",
                    "You have few credits left. Watch an ad or buy more credits to keep chatting."
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* MENSAGEM ESPECIAL PARA USUÁRIOS PREMIUM */}
            {isPremium && (
              <Alert className="bg-green-50 border-green-200 dark:bg-emerald-900/20 dark:border-emerald-700/30">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-emerald-400" />
                <AlertDescription className="text-green-800 dark:text-emerald-200">
                  {tx(
                    "🎉 Como usuário Premium, você tem chat ilimitado! Envie quantas mensagens quiser sem se preocupar com créditos.",
                    "🎉 As a Premium user, you have unlimited chat! Send as many messages as you want without worrying about credits."
                  )}
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
