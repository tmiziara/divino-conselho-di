import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Calendar, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DailyVerse {
  reference: string;
  text: string;
  theme: string;
}

const BibleSidebar = () => {
  const { user } = useAuth();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [popularVerses, setPopularVerses] = useState<DailyVerse[]>([]);

  useEffect(() => {
    // Rotacionar versículos baseado no dia
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const verses = [
      {
        reference: "João 3:16",
        text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
        theme: "Amor de Deus"
      },
      {
        reference: "Filipenses 4:13",
        text: "Posso todas as coisas naquele que me fortalece.",
        theme: "Força"
      },
      {
        reference: "Salmos 23:1",
        text: "O Senhor é o meu pastor, nada me faltará.",
        theme: "Cuidado de Deus"
      },
      {
        reference: "Romanos 8:28",
        text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
        theme: "Propósito"
      },
      {
        reference: "Isaías 40:31",
        text: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.",
        theme: "Renovação"
      },
      {
        reference: "Jeremias 29:11",
        text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal.",
        theme: "Esperança"
      }
    ];

    // Versículo do dia
    setDailyVerse(verses[dayOfYear % verses.length]);
    
    // Versículos populares (excluindo o do dia)
    const popular = verses.filter((_, index) => index !== (dayOfYear % verses.length)).slice(0, 3);
    setPopularVerses(popular);
  }, []);

  const handleFavorite = async (verse: DailyVerse) => {
    if (!user) return;
    
    // TODO: Implementar salvamento de favoritos
    console.log('Salvando favorito:', verse);
  };

  return (
    <div className="space-y-4">
      {/* Versículo do Dia */}
      <Card className="spiritual-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Versículo do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyVerse && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary">{dailyVerse.reference}</p>
                <p className="text-sm leading-relaxed">{dailyVerse.text}</p>
                <p className="text-xs text-muted-foreground">Tema: {dailyVerse.theme}</p>
              </div>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFavorite(dailyVerse)}
                  className="w-full"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritar
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Versículos Populares */}
      <Card className="spiritual-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Versículos Populares
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 p-4">
              {popularVerses.map((verse, index) => (
                <div key={index} className="border-b border-border/50 pb-3 last:border-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">{verse.reference}</p>
                    <p className="text-xs leading-relaxed">{verse.text}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">{verse.theme}</p>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFavorite(verse)}
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default BibleSidebar;