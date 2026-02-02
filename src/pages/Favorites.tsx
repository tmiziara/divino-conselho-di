import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, BookOpen, MessageCircle, Trash2, Share2, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

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
  version?: string;
}

const Favorites = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar favoritos do banco de dados
  const loadFavorites = useCallback(async () => {
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

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
  }, [loadFavorites]);

  // Verificar se atingiu o limite
  const hasReachedLimit = () => {
    if (subscriptionLoading) return false;
    if (!subscription.subscribed || subscription.subscription_tier === 'free') {
      return favorites.length >= 10;
    }
    return false;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "verse":
      case "study":
        return <BookOpen className="w-5 h-5 min-w-[20px]" />;
      case "psalm":
        return <Heart className="w-5 h-5 min-w-[20px]" />;
      case "message":
        return <MessageCircle className="w-5 h-5 min-w-[20px]" />;
      default:
        return <Heart className="w-5 h-5 min-w-[20px]" />;
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

  const getVersionLabel = (version?: string) => {
    switch (version) {
      case "nvi":
        return "NVI";
      case "pt_aa":
        return "AA";
      case "pt_acf":
        return "ACF";
      default:
        return version?.toUpperCase() || "NVI";
    }
  };

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  const shareContent = async (title: string, text: string) => {
    try {
      const shareText = `${title}\n\n${text}`;
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNativePlatform && (window as any).Capacitor.isNativePlatform();
      if (isCapacitor && (window as any).Capacitor && (window as any).Capacitor.Plugins && (window as any).Capacitor.Plugins.Share) {
        await (window as any).Capacitor.Plugins.Share.share({
          title,
          text: shareText,
          dialogTitle: 'Compartilhar com...'
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title, text: shareText });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      toast({ title: 'Copiado!', description: 'Texto copiado para área de transferência.' });
    } catch (err) {
      toast({ title: 'Erro ao compartilhar', description: 'Não foi possível compartilhar.' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b101a]">
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
    <div className="min-h-screen bg-white dark:bg-[#0b101a]">
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
          {/* Header com contador */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-2 heavenly-text">
              <Heart className="w-8 h-8 inline mr-2" />
              Seus Favoritos
            </h1>
            <div className="text-center text-muted-foreground">
              {subscriptionLoading ? (
                <p>Carregando plano...</p>
              ) : subscription.subscribed && subscription.subscription_tier === 'premium' ? (
                <p>✨ Plano Premium - Favoritos ilimitados</p>
              ) : (
                <p>
                   Plano Gratuito - {favorites.length}/10 favoritos
                  {hasReachedLimit() && (
                    <span className="text-red-500 font-semibold ml-2">
                      (Limite atingido!)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Aviso de limite atingido */}
          {hasReachedLimit() && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-amber-800 font-medium">
                🚫 Você atingiu o limite de 10 favoritos no plano gratuito!
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Faça upgrade para o plano Premium e salve quantos favoritos quiser.
              </p>
              <Button 
                className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                // Phase 3: contextual paywall for favorites limit
                onClick={() => navigate('/assinatura?plan=premium')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          )}

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
                  {favorites.map((fav) => {
                    // Função para decidir o título exibido
                    const getDisplayTitle = (fav: Favorite) => {
                      if (fav.type === "study") {
                        if (fav.title.startsWith("study-verse-") && fav.reference) {
                          return fav.reference;
                        }
                        if (fav.title.startsWith("study-prayer-") && fav.reference) {
                          return fav.reference;
                        }
                      }
                      // Para versículos, adicionar a versão ao título
                      if (fav.type === "verse" && fav.version) {
                        return `${fav.title} (${getVersionLabel(fav.version)})`;
                      }
                      return fav.title;
                    };

                    // Função para obter a referência completa com versão
                    const getFullReference = (fav: Favorite) => {
                      if (fav.type === "verse" && fav.version) {
                        return `${fav.title} - ${getVersionLabel(fav.version)}`;
                      }
                      return fav.title;
                    };
                    return (
                      <Card key={fav.id} className="p-4 bg-card dark:bg-zinc-900">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <Badge className={getTypeColor(fav.type)}>
                            {getTypeLabel(fav.type)}
                          </Badge>
                          {fav.type === "verse" && fav.version && (
                            <Badge variant="outline" className="text-xs">
                              {getVersionLabel(fav.version)}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            onClick={() => shareContent(
                              getFullReference(fav),
                              `${fav.content}\n\nEnviado do app Conexão com Deus!`
                            )}
                            aria-label="Compartilhar favorito"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => deleteFavorite(fav.id)}
                            aria-label="Excluir favorito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(fav.type)}
                              <span className="font-semibold">{getDisplayTitle(fav)}</span>
                            </div>
                            <p className="text-foreground leading-relaxed">
                              {fav.content}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Salvo em {new Date(fav.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Favorites;
