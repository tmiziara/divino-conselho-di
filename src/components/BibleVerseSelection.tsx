import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface BibleVerseSelectionProps {
  selectedVerses: Set<number>;
  onClearSelection: () => void;
  onAddToFavorites: () => void;
}

export const BibleVerseSelection = ({
  selectedVerses,
  onClearSelection,
  onAddToFavorites
}: BibleVerseSelectionProps) => {
  const { user } = useAuth();

  if (selectedVerses.size === 0 || !user) return null;

  return (
    <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedVerses.size} versículo(s) selecionado(s)
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearSelection}
          >
            Limpar seleção
          </Button>
          <Button size="sm" className="divine-button" onClick={onAddToFavorites}>
            <Heart className="w-4 h-4 mr-2" />
            Adicionar aos Favoritos
          </Button>
        </div>
      </div>
    </div>
  );
};