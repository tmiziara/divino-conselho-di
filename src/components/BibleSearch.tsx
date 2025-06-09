import { useState, useEffect } from "react";
import { Search, Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBibleSearch } from "@/hooks/useBibleSearch";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BOOK_NAMES = {
  "gn": "Gênesis", "ex": "Êxodo", "lv": "Levítico", "nm": "Números", "dt": "Deuteronômio",
  "js": "Josué", "jz": "Juízes", "rt": "Rute", "1sm": "1 Samuel", "2sm": "2 Samuel",
  "1rs": "1 Reis", "2rs": "2 Reis", "1cr": "1 Crônicas", "2cr": "2 Crônicas",
  "ed": "Esdras", "ne": "Neemias", "et": "Ester", "job": "Jó", "sl": "Salmos",
  "pv": "Provérbios", "ec": "Eclesiastes", "ct": "Cânticos", "is": "Isaías",
  "jr": "Jeremias", "lm": "Lamentações", "ez": "Ezequiel", "dn": "Daniel",
  "os": "Oseias", "jl": "Joel", "am": "Amós", "ob": "Obadias", "jn": "Jonas",
  "mq": "Miquéias", "na": "Naum", "hc": "Habacuque", "sf": "Sofonias",
  "ag": "Ageu", "zc": "Zacarias", "ml": "Malaquias", "mt": "Mateus",
  "mc": "Marcos", "lc": "Lucas", "jo": "João", "at": "Atos", "rm": "Romanos",
  "1co": "1 Coríntios", "2co": "2 Coríntios", "gl": "Gálatas", "ef": "Efésios",
  "fp": "Filipenses", "cl": "Colossenses", "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo", "2tm": "2 Timóteo", "tt": "Tito", "fm": "Filemom",
  "hb": "Hebreus", "tg": "Tiago", "1pe": "1 Pedro", "2pe": "2 Pedro",
  "1jo": "1 João", "2jo": "2 João", "3jo": "3 João", "jd": "Judas", "ap": "Apocalipse"
};

interface BibleSearchProps {
  searchQuery?: string;
}

const BibleSearch = ({ searchQuery = "" }: BibleSearchProps) => {
  const [query, setQuery] = useState(searchQuery);
  const { user } = useAuth();
  const { toast } = useToast();
  const { searchResults, loading, searchVerses } = useBibleSearch();
  const { favorites, addToFavorites, removeFromFavorites, loadFavorites } = useBibleFavorites();

  useEffect(() => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      searchVerses(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const handleSearch = () => {
    if (query.trim()) {
      searchVerses(query);
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  const toggleFavorite = async (verse: any) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar versículos favoritos",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favorites.some(fav => 
      fav.book === verse.livro && 
      fav.chapter === verse.capitulo && 
      fav.verse === verse.versiculo
    );

    if (isFavorite) {
      await removeFromFavorites(verse.livro, verse.capitulo, verse.versiculo);
      toast({
        title: "Removido dos favoritos",
        description: `${BOOK_NAMES[verse.livro as keyof typeof BOOK_NAMES]} ${verse.capitulo}:${verse.versiculo}`
      });
    } else {
      await addToFavorites({
        book: verse.livro,
        chapter: verse.capitulo,
        verse: verse.versiculo,
        title: `${BOOK_NAMES[verse.livro as keyof typeof BOOK_NAMES]} ${verse.capitulo}:${verse.versiculo}`,
        content: verse.texto,
        reference: `${BOOK_NAMES[verse.livro as keyof typeof BOOK_NAMES]} ${verse.capitulo}:${verse.versiculo}`
      });
      toast({
        title: "Adicionado aos favoritos",
        description: `${BOOK_NAMES[verse.livro as keyof typeof BOOK_NAMES]} ${verse.capitulo}:${verse.versiculo}`
      });
    }
  };

  const isVerseFavorite = (verse: any) => {
    return favorites.some(fav => 
      fav.book === verse.livro && 
      fav.chapter === verse.capitulo && 
      fav.verse === verse.versiculo
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Digite uma palavra ou frase para pesquisar..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Pesquisando..." : "Pesquisar"}
        </Button>
      </div>

      {/* Results Count */}
      {searchResults.length > 0 && (
        <div className="text-muted-foreground">
          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.map((verse, index) => (
          <Card key={`${verse.livro}-${verse.capitulo}-${verse.versiculo}-${index}`} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {BOOK_NAMES[verse.livro as keyof typeof BOOK_NAMES]} {verse.capitulo}:{verse.versiculo}
                  </Badge>
                </div>
                <p className="text-foreground leading-relaxed">
                  {highlightText(verse.texto, query)}
                </p>
              </div>
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(verse)}
                  className="flex-shrink-0"
                >
                  {isVerseFavorite(verse) ? (
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  ) : (
                    <HeartOff className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {!loading && searchResults.length === 0 && query.trim() && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
          <p>Tente pesquisar com outras palavras</p>
        </div>
      )}

      {/* Empty State */}
      {!query.trim() && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Pesquisar na Bíblia</h3>
          <p>Digite uma palavra ou frase para encontrar versículos relacionados</p>
        </div>
      )}
    </div>
  );
};

export default BibleSearch;