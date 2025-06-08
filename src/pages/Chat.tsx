import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import ChatSidebar from "@/components/ChatSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Olá! Que a paz do Senhor esteja contigo. Como posso te ajudar em sua jornada espiritual hoje?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro na conversa",
        description: "Não foi possível receber uma resposta. Tente novamente.",
        variant: "destructive"
      });
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Peço perdão, meu filho/filha. Estou enfrentando dificuldades técnicas no momento. Que tal voltarmos a conversar em alguns instantes? Que Deus te abençoe!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
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

  if (!user) {
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={() => {}} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                Canal de Conversa Espiritual
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para conversar sobre fé e receber orientação espiritual
              </p>
              <Button className="divine-button">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={() => {}} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold heavenly-text mb-4">
            <MessageCircle className="w-10 h-10 inline-block mr-3" />
            Canal de Conversa Espiritual
          </h1>
          <p className="text-xl text-muted-foreground">
            Um espaço sagrado para compartilhar sua fé e receber orientação
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Chat History */}
          <div className="lg:col-span-1">
            <ChatSidebar />
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="spiritual-card h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Conversa Espiritual
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <p>{message.text}</p>
                          <small className="opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground p-4 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-6 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Compartilhe o que está em seu coração..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
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
    </div>
  );
};

export default Chat;