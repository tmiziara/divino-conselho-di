import { useEffect, useState } from "react";
import { Heart, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const BibleFavorites = () => {
  const { favorites, loading, loadFavorites, removeFromFavorites } = useBibleFavorites();
  const { toast } = useToast();
  const [shareLoading, setShareLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleShare = async (title: string, text: string) => {
    try {
      const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.isNativePlatform && (window as any).Capacitor.isNativePlatform();
      if (isCapacitor && (window as any).Capacitor && (window as any).Capacitor.Plugins && (window as any).Capacitor.Plugins.Share) {
        await (window as any).Capacitor.Plugins.Share.share({
          title,
          text,
          dialogTitle: 'Compartilhar com...'
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      toast({ title: 'Copiado!', description: 'Texto copiado para área de transferência.' });
    } catch (err) {
      toast({ title: 'Erro ao compartilhar', description: 'Não foi possível compartilhar.' });
    }
  };

  const handleRemoveFavorite = async (book: string, chapter: number, verse: number, title: string) => {
    await removeFromFavorites(book, chapter, verse);
    toast({
      title: "Removido dos favoritos",
      description: title
    });
    setDialogOpen(null);
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
        {favorites.map((favorite) => {
          console.log('Renderizando favorito:', favorite.id, favorite.reference);
          return (
            <Card key={favorite.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="w-full flex justify-end gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg shadow"
                      onClick={() => handleShare(
                        favorite.reference || 'Favorito',
                        `${favorite.content}\n\nEnviado do app Conexão com Deus!`
                      )}
                      aria-label="Compartilhar favorito"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {favorite.reference}
                    </Badge>
                    <AlertDialog open={dialogOpen === favorite.id} onOpenChange={open => setDialogOpen(open ? favorite.id : null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover favorito?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este versículo dos favoritos?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveFavorite(
                            favorite.book || '', 
                            favorite.chapter || 0, 
                            favorite.verse || 0, 
                            favorite.title
                          )}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {favorite.content}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    Adicionado em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BibleFavorites;
