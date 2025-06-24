
import { useEffect } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useToast } from "@/hooks/use-toast";
import SocialShare from "@/components/SocialShare";

const BibleFavorites = () => {
  const { favorites, loading, loadFavorites, removeFromFavorites } = useBibleFavorites();
  const { toast } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (book: string, chapter: number, verse: number, title: string) => {
    await removeFromFavorites(book, chapter, verse);
    toast({
      title: "Removido dos favoritos",
      description: title
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Carregando favoritos...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Nenhum versículo favorito</h3>
        <p>Marque versículos como favoritos durante a leitura para vê-los aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground">
        {favorites.length} versículo{favorites.length !== 1 ? 's' : ''} favorito{favorites.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-4">
        {favorites.map((favorite) => (
          <Card key={favorite.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {favorite.reference}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Adicionado em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">
                  {favorite.content}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <SocialShare 
                  title={favorite.title}
                  content={favorite.content}
                  reference={favorite.reference || undefined}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFavorite(
                    favorite.book || '', 
                    favorite.chapter || 0, 
                    favorite.verse || 0, 
                    favorite.title
                  )}
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BibleFavorites;
