import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useBibleData } from "@/hooks/useBibleData";
import { useBibleProgress } from "@/hooks/useBibleProgress";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const BOOK_NAMES = {
  "gn": "Gênesis", "ex": "Êxodo", "lv": "Levítico", "nm": "Números", "dt": "Deuteronômio",
  "js": "Josué", "jz": "Juízes", "rt": "Rute", "1sm": "1 Samuel", "2sm": "2 Samuel",
  "1rs": "1 Reis", "2rs": "2 Reis", "1cr": "1 Crônicas", "2cr": "2 Crônicas",
  "ed": "Esdras", "ne": "Neemias", "et": "Ester", "jó": "Jó", "sl": "Salmos",
  "pv": "Provérbios", "ec": "Eclesiastes", "ct": "Cânticos", "is": "Isaías",
  "jr": "Jeremias", "lm": "Lamentações", "ez": "Ezequiel", "dn": "Daniel",
  "os": "Oseias", "jl": "Joel", "am": "Amós", "ob": "Obadias", "jn": "Jonas",
  "mq": "Miquéias", "na": "Naum", "hc": "Habacuque", "sf": "Sofonias",
  "ag": "Ageu", "zc": "Zacarias", "ml": "Malaquias", "mt": "Mateus",
  "mc": "Marcos", "lc": "Lucas", "jo": "João", "atos": "Atos", "rm": "Romanos",
  "1co": "1 Coríntios", "2co": "2 Coríntios", "gl": "Gálatas", "ef": "Efésios",
  "fp": "Filipenses", "cl": "Colossenses", "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo", "2tm": "2 Timóteo", "tt": "Tito", "fm": "Filemom",
  "hb": "Hebreus", "tg": "Tiago", "1pe": "1 Pedro", "2pe": "2 Pedro",
  "1jo": "1 João", "2jo": "2 João", "3jo": "3 João", "jd": "Judas", "ap": "Apocalipse"
};

const BibleReader = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    chapters, 
    verses, 
    selectedBook, 
    selectedChapter, 
    setSelectedBook, 
    setSelectedChapter,
    loadChapters,
    loadVerses
  } = useBibleData();

  // All 66 biblical books in order
  const BIBLICAL_BOOKS = [
    "gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm",
    "1rs", "2rs", "1cr", "2cr", "ed", "ne", "et", "jó", "sl", "pv",
    "ec", "ct", "is", "jr", "lm", "ez", "dn", "os", "jl", "am",
    "ob", "jn", "mq", "na", "hc", "sf", "ag", "zc", "ml", "mt",
    "mc", "lc", "jo", "atos", "rm", "1co", "2co", "gl", "ef", "fp",
    "cl", "1ts", "2ts", "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe",
    "2pe", "1jo", "2jo", "3jo", "jd", "ap"
  ];
  
  const { saveProgress, getLastPosition } = useBibleProgress();
  const { favorites, addToFavorites, removeFromFavorites, loadFavorites } = useBibleFavorites();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
    
    // Load last reading position
    const lastPosition = getLastPosition();
    if (lastPosition.book) {
      setSelectedBook(lastPosition.book);
      if (lastPosition.chapter) {
        setSelectedChapter(lastPosition.chapter);
      }
    } else {
      setSelectedBook(BIBLICAL_BOOKS[0]); // Default to Genesis
    }
  }, [user]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerses(selectedBook, selectedChapter);
      saveProgress(selectedBook, selectedChapter, 1);
    }
  }, [selectedBook, selectedChapter]);

  const handleBookChange = (book: string) => {
    // If user is not logged in and tries to select a book other than Genesis
    if (!user && book !== "gn") {
      toast({
        title: "Cadastro necessário",
        description: "Faça seu cadastro gratuito para ler todos os livros da Bíblia",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedBook(book);
    setSelectedChapter(1);
  };

  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(parseInt(chapter));
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook || !selectedChapter) return;

    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (direction === 'next' && selectedChapter < chapters.length) {
      setSelectedChapter(selectedChapter + 1);
    }
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

    const verseKey = `${verse.livro}-${verse.capitulo}-${verse.versiculo}`;
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
      {/* Free Access Notice for non-logged users */}
      {!user && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">
              📖 Leitura Gratuita de Gênesis
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Você pode ler o livro de Gênesis gratuitamente. Para acessar todos os 66 livros da Bíblia, 
              faça seu <span className="font-medium text-foreground">cadastro gratuito</span>.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
              className="text-primary hover:text-primary-foreground"
            >
              Fazer Cadastro Gratuito
            </Button>
          </div>
        </div>
      )}
      
      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedBook || ""} onValueChange={handleBookChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Selecione o livro" />
          </SelectTrigger>
          <SelectContent>
            {BIBLICAL_BOOKS.map((book) => (
              <SelectItem key={book} value={book} disabled={!user && book !== "gn"}>
                <div className="flex items-center justify-between w-full">
                  <span className={!user && book !== "gn" ? "text-muted-foreground" : ""}>
                    {BOOK_NAMES[book as keyof typeof BOOK_NAMES] || book}
                  </span>
                  {!user && book !== "gn" && (
                    <span className="text-xs text-muted-foreground ml-2">🔒</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedChapter?.toString() || ""} 
          onValueChange={handleChapterChange}
          disabled={!selectedBook}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((chapter) => (
              <SelectItem key={chapter} value={chapter.toString()}>
                {chapter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigateChapter('prev')}
            disabled={!selectedChapter || selectedChapter <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateChapter('next')}
            disabled={!selectedChapter || selectedChapter >= chapters.length}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chapter Title */}
      {selectedBook && selectedChapter && (
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {BOOK_NAMES[selectedBook as keyof typeof BOOK_NAMES]} {selectedChapter}
          </h2>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-4">
        {verses.map((verse) => (
          <Card key={`${verse.livro}-${verse.capitulo}-${verse.versiculo}`} className="p-4">
            <div className="flex gap-2 items-start">
              <span className="text-primary font-bold text-lg flex-shrink-0 w-8">
                {verse.versiculo}
              </span>
              <p className="text-foreground leading-relaxed flex-1 pr-2">
                {verse.texto}
              </p>
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(verse)}
                  className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8 p-0 ml-auto"
                >
                  {isVerseFavorite(verse) ? (
                    <Heart className="w-3 h-3 md:w-4 md:h-4 fill-red-500 text-red-500" />
                  ) : (
                    <HeartOff className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {verses.length === 0 && selectedBook && selectedChapter && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Carregando versículos...</p>
        </div>
      )}
    </div>
  );
};

export default BibleReader;