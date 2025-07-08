// BibleReader.tsx

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
import { useSubscription } from "@/hooks/useSubscription";

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

const BIBLE_VERSIONS = [
  { value: "nvi", label: "NVI", premium: false },
  { value: "pt_aa", label: "AA", premium: true },
  { value: "pt_acf", label: "ACF", premium: true },
];

interface BibleReaderProps {
  onAuthClick?: () => void;
}

const BibleReader = ({ onAuthClick }: BibleReaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const [bibleVersion, setBibleVersion] = useState<string>("nvi");
  const { 
    chapters, verses, selectedBook, selectedChapter, 
    setSelectedBook, setSelectedChapter,
    loadChapters, loadVerses 
  } = useBibleData(bibleVersion);
  const { saveProgress, getLastPosition } = useBibleProgress();
  const { favorites, addToFavorites, removeFromFavorites, loadFavorites } = useBibleFavorites();

  const BIBLICAL_BOOKS = Object.keys(BOOK_NAMES);

  useEffect(() => {
    if (user) {
      loadFavorites();
      const lastPosition = getLastPosition();
      if (lastPosition.book) {
        setSelectedBook(lastPosition.book);
        if (lastPosition.chapter) setSelectedChapter(lastPosition.chapter);
        if (lastPosition.version) setBibleVersion(lastPosition.version);
      } else {
        setSelectedBook("gn");
      }
    } else {
      setSelectedBook("gn");
      setSelectedChapter(1);
    }
  }, [user]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook, bibleVersion);
    }
  }, [selectedBook, bibleVersion]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerses(selectedBook, selectedChapter, bibleVersion);
      saveProgress(selectedBook, selectedChapter, 1, bibleVersion);
    }
  }, [selectedBook, selectedChapter, bibleVersion]);

  const handleBookChange = (book: string) => {
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

    const isFavorite = favorites.some(fav => 
      fav.book === verse.livro && 
      fav.chapter === verse.capitulo && 
      fav.verse === verse.versiculo
    );

    if (isFavorite) {
      await removeFromFavorites(verse.livro, verse.capitulo, verse.versiculo);
      toast({ title: "Removido dos favoritos" });
    } else {
      await addToFavorites({
        book: verse.livro,
        chapter: verse.capitulo,
        verse: verse.versiculo,
        title: `${BOOK_NAMES[verse.livro]} ${verse.capitulo}:${verse.versiculo}`,
        content: verse.texto,
        reference: `${BOOK_NAMES[verse.livro]} ${verse.capitulo}:${verse.versiculo}`
      });
      toast({ title: "Adicionado aos favoritos" });
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
      {/* Alerta para não logados */}
      {!user && (
        <div className="bg-muted/50 border rounded-lg p-4 text-center">
          <h3 className="font-semibold">📖 Leitura Gratuita de Gênesis</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Faça seu cadastro para desbloquear todos os livros da Bíblia.
          </p>
          <Button variant="outline" size="sm" onClick={onAuthClick}>
            Fazer Cadastro Gratuito
          </Button>
        </div>
      )}

      {/* Versão da Bíblia */}
      <div className="flex justify-center">
        <Select value={bibleVersion} onValueChange={(v) => {
          const selected = BIBLE_VERSIONS.find(ver => ver.value === v);
          if (selected?.premium && (!subscription.subscribed || subscription.subscription_tier !== "premium")) {
            toast({ title: "Versão Premium", description: "Apenas para assinantes Premium", variant: "destructive" });
            return;
          }
          setBibleVersion(v);
        }}>
          <SelectTrigger className="w-48 bg-card dark:bg-zinc-900">
            <SelectValue placeholder="Versão da Bíblia" />
          </SelectTrigger>
          <SelectContent>
            {BIBLE_VERSIONS.map(ver => (
              <SelectItem key={ver.value} value={ver.value} disabled={ver.premium && (!subscription.subscribed || subscription.subscription_tier !== "premium")}>
                {ver.label} {ver.premium && (!subscription.subscribed || subscription.subscription_tier !== "premium") && "🔒"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Livro / Capítulo / Navegação */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Select value={selectedBook || ""} onValueChange={handleBookChange}>
          <SelectTrigger className="w-48 bg-card dark:bg-zinc-900">
            <SelectValue placeholder="Selecione o livro" />
          </SelectTrigger>
          <SelectContent>
            {BIBLICAL_BOOKS.map(book => (
              <SelectItem key={book} value={book} disabled={!user && book !== "gn"}>
                {BOOK_NAMES[book]} {!user && book !== "gn" && "🔒"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedChapter?.toString() || ""} onValueChange={handleChapterChange} disabled={!selectedBook}>
          <SelectTrigger className="w-48 bg-card dark:bg-zinc-900">
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map(ch => (
              <SelectItem key={ch} value={ch.toString()}>{ch}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button onClick={() => navigateChapter('prev')} disabled={!selectedChapter || selectedChapter <= 1} className="w-12 h-10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigateChapter('next')} disabled={!selectedChapter || selectedChapter >= chapters.length} className="w-12 h-10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Versículos */}
      <div className="space-y-4">
        {verses.map(verse => (
          <Card key={`${verse.livro}-${verse.capitulo}-${verse.versiculo}`} className="p-4">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary w-6">{verse.versiculo}</span>
              <p className="flex-1">{verse.texto}</p>
              {user && (
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(verse)}>
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
    </div>
  );
};

export default BibleReader;
