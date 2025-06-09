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

const BibleReader = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    books, 
    chapters, 
    verses, 
    selectedBook, 
    selectedChapter, 
    setSelectedBook, 
    setSelectedChapter,
    loadBooks,
    loadChapters,
    loadVerses
  } = useBibleData();
  
  const { saveProgress, getLastPosition } = useBibleProgress();
  const { favorites, addToFavorites, removeFromFavorites, loadFavorites } = useBibleFavorites();

  useEffect(() => {
    loadBooks();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    // Load last reading position
    const lastPosition = getLastPosition();
    if (lastPosition.book && books.length > 0) {
      setSelectedBook(lastPosition.book);
      if (lastPosition.chapter) {
        setSelectedChapter(lastPosition.chapter);
      }
    } else if (books.length > 0) {
      setSelectedBook(books[0]);
    }
  }, [books]);

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
      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedBook || ""} onValueChange={handleBookChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Selecione o livro" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book} value={book}>
                {BOOK_NAMES[book as keyof typeof BOOK_NAMES] || book}
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
            <div className="flex gap-4 items-start">
              <span className="text-primary font-bold text-lg flex-shrink-0">
                {verse.versiculo}
              </span>
              <p className="text-foreground leading-relaxed flex-1">
                {verse.texto}
              </p>
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

      {verses.length === 0 && selectedBook && selectedChapter && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Carregando versículos...</p>
        </div>
      )}
    </div>
  );
};

export default BibleReader;