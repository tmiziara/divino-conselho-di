import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>(
    "Olá! Que a paz do Senhor esteja contigo. Como posso te ajudar em sua jornada espiritual hoje?"
  );
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const currentMessage = newMessage;
    setNewMessage("");
    setIsLoading(true);

    try {
      // Call the spiritual chat edge function
      const { data, error } = await supabase.functions.invoke('spiritual-chat', {
        body: {
          message: currentMessage,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      setCurrentResponse(data.response);
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

  if (!user) {
    return (
      <div className="min-h-screen celestial-bg">
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
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center md:text-center mb-8">
          <h1 className="flex justify-center items-center text-2xl md:text-4xl font-bold heavenly-text mb-4">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 mr-3 text-primary" />
            Conversa Espiritual
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Um espaço sagrado para compartilhar sua fé e receber orientação
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="spiritual-card min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-left text-lg md:text-xl">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                Conversa Espiritual
              </CardTitle>
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
              
              <div className="p-6 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Compartilhe o que está em seu coração..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-left"
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
