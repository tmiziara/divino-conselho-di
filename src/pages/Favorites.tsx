import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, BookOpen, MessageCircle, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import SocialShare from "@/components/SocialShare";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: string;
  type: string;
  title: string;
  content: string;
  reference?: string;
  created_at: string;
  book?: string;
  chapter?: number;
  verse?: number;
}

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar favoritos do banco de dados
  const loadFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setFavorites(data || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar favorito
  const deleteFavorite = async (favoriteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Favorito removido",
        description: "O item foi removido dos seus favoritos."
      });
    } catch (error) {
      console.error('Erro ao deletar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o favorito.",
        variant: "destructive"
      });
    }
  };

  // Effect para carregar favoritos quando o usuário está logado
  useEffect(() => {
    loadFavorites();
  }, [user]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "verse":
        return <BookOpen className="w-4 h-4" />;
      case "study":
        return <BookOpen className="w-4 h-4" />;
      case "psalm":
        return <Heart className="w-4 h-4" />;
      case "message":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "verse":
        return "Versículo";
      case "study":
        return "Estudo Bíblico";
      case "psalm":
        return "Salmo";
      case "message":
        return "Mensagem";
      default:
        return "Favorito";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "verse":
        return "bg-primary/10 text-primary";
      case "study":
        return "bg-blue-500/10 text-blue-500";
      case "psalm":
        return "bg-accent/10 text-accent";
      case "message":
        return "bg-secondary/10 text-secondary-foreground";
      default:
        return "bg-muted";
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
                <Heart className="w-8 h-8 mx-auto mb-2" />
                Seus Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para salvar e visualizar seus versículos e mensagens favoritas
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
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="flex justify-center items-center text-2xl sm:text-3xl md:text-4xl font-bold heavenly-text mb-4 break-words">
            <Heart className="w-8 sm:w-10 h-8 sm:h-10 mr-3 text-pink-500" />
            Seus Favoritos
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground break-words px-2">
            Versículos, salmos e mensagens que tocaram seu coração
          </p>
        </div>

        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)]">
          <ScrollArea className="h-full">
            <div className="pr-2 sm:pr-4">
              {loading ? (
                <Card className="spiritual-card">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando seus favoritos...</p>
                  </CardContent>
                </Card>
              ) : favorites.length === 0 ? (
                <Card className="spiritual-card">
                  <CardContent className="py-12 text-center">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
                    <p className="text-muted-foreground mb-6 break-words px-2">
                      Comece explorando a Bíblia e o canal de conversa para salvar conteúdos que te inspiram
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button className="divine-button">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Explorar Bíblia
                      </Button>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ir para Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-2 sm:gap-3 pb-6">
                  {favorites.map((favorite) => (
                    <Card key={favorite.id} className="spiritual-card">
                      <CardHeader className="pb-1 pt-1 sm:pt-2">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <Badge className={`${getTypeColor(favorite.type)} text-xs`}>
                            {getTypeLabel(favorite.type)}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            onClick={() => deleteFavorite(favorite.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-xl break-words">
                              {getTypeIcon(favorite.type)}
                              <span className="break-words">
                                {favorite.reference || favorite.title}
                              </span>
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 break-words">
                          {favorite.content}
                        </p>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          <span>Salvo em {new Date(favorite.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
