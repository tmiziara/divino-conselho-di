import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChatHistory {
  id: string;
  message: string;
  created_at: string;
}

const ChatSidebar = () => {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChatHistory = async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, message, created_at')
        .eq('user_id', user.id)
        .eq('is_from_ai', false)
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setChatHistory(data);
      }
      setLoading(false);
    };

    fetchChatHistory();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  const truncateMessage = (message: string, maxLength: number = 40) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  };

  return (
    <Card className="spiritual-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          Histórico de Conversas
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>Logs mantidos por 3 dias</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted/50 h-12 rounded animate-pulse" />
              ))}
            </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                >
                  <div className="space-y-1 w-full">
                    <p className="text-sm">{truncateMessage(chat.message)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(chat.created_at)}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma conversa recente</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;