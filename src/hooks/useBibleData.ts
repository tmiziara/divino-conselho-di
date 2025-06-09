import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mapeamento dos códigos dos livros para nomes completos
const NOMES_LIVROS: Record<string, string> = {
  "gn": "Gênesis",
  "ex": "Êxodo",
  "lv": "Levítico",
  "nm": "Números",
  "dt": "Deuteronômio",
  "js": "Josué",
  "jz": "Juízes",
  "rt": "Rute",
  "1sm": "1 Samuel",
  "2sm": "2 Samuel",
  "1rs": "1 Reis",
  "2rs": "2 Reis",
  "1cr": "1 Crônicas",
  "2cr": "2 Crônicas",
  "ed": "Esdras",
  "ne": "Neemias",
  "et": "Ester",
  "job": "Jó",
  "sl": "Salmos",
  "pv": "Provérbios",
  "ec": "Eclesiastes",
  "ct": "Cânticos",
  "is": "Isaías",
  "jr": "Jeremias",
  "lm": "Lamentações",
  "ez": "Ezequiel",
  "dn": "Daniel",
  "os": "Oseias",
  "jl": "Joel",
  "am": "Amós",
  "ob": "Obadias",
  "jn": "Jonas",
  "mq": "Miquéias",
  "na": "Naum",
  "hc": "Habacuque",
  "sf": "Sofonias",
  "ag": "Ageu",
  "zc": "Zacarias",
  "ml": "Malaquias",
  "mt": "Mateus",
  "mc": "Marcos",
  "lc": "Lucas",
  "jo": "João",
  "at": "Atos",
  "rm": "Romanos",
  "1co": "1 Coríntios",
  "2co": "2 Coríntios",
  "gl": "Gálatas",
  "ef": "Efésios",
  "fp": "Filipenses",
  "cl": "Colossenses",
  "1ts": "1 Tessalonicenses",
  "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo",
  "2tm": "2 Timóteo",
  "tt": "Tito",
  "fm": "Filemom",
  "hb": "Hebreus",
  "tg": "Tiago",
  "1pe": "1 Pedro",
  "2pe": "2 Pedro",
  "1jo": "1 João",
  "2jo": "2 João",
  "3jo": "3 João",
  "jd": "Judas",
  "ap": "Apocalipse"
};

// Ordem bíblica dos livros para garantir ordenação correta
const ORDEM_BIBLICA = [
  "gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm", "1rs", "2rs", 
  "1cr", "2cr", "ed", "ne", "et", "job", "sl", "pv", "ec", "ct", "is", "jr", 
  "lm", "ez", "dn", "os", "jl", "am", "ob", "jn", "mq", "na", "hc", "sf", 
  "ag", "zc", "ml", "mt", "mc", "lc", "jo", "at", "rm", "1co", "2co", "gl", 
  "ef", "fp", "cl", "1ts", "2ts", "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe", 
  "2pe", "1jo", "2jo", "3jo", "jd", "ap"
];

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleBook {
  name: string;
  fullName: string;
  chapters: number;
}

export interface BibleChapter {
  book: BibleBook;
  chapter: {
    number: number;
    verses: number;
  };
  verses: BibleVerse[];
}

export const useBibleData = () => {
  const { toast } = useToast();
  const [availableBooks, setAvailableBooks] = useState<BibleBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);

  // Função para carregar todos os livros disponíveis do Supabase
  const loadAvailableBooks = async () => {
    setBooksLoading(true);
    console.log('🔍 Starting to load available books...');
    
    try {
      // Buscar todos os livros únicos com seus capítulos máximos de uma vez
      const { data, error } = await supabase
        .from('versiculos')
        .select('livro, capitulo')
        .order('livro');

      if (error) {
        console.error('❌ Error loading books:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`📊 Found ${data.length} total verses`);
        
        // Agrupar por livro e encontrar o capítulo máximo
        const bookMap = new Map();
        
        data.forEach(item => {
          const currentMax = bookMap.get(item.livro) || 0;
          bookMap.set(item.livro, Math.max(currentMax, item.capitulo));
        });
        
        console.log(`📚 Found ${bookMap.size} unique books:`, Array.from(bookMap.keys()));
        
        // Criar array de livros com suas informações
        const booksWithChapters = Array.from(bookMap.entries()).map(([bookCode, maxChapter]) => ({
          name: bookCode,
          fullName: NOMES_LIVROS[bookCode] || bookCode,
          chapters: maxChapter
        }));

        // Filtrar apenas livros que estão na ordem bíblica
        const validBooks = booksWithChapters.filter(book => 
          ORDEM_BIBLICA.includes(book.name)
        );

        // Ordenar livros na ordem bíblica
        const sortedBooks = validBooks.sort((a, b) => {
          const indexA = ORDEM_BIBLICA.indexOf(a.name);
          const indexB = ORDEM_BIBLICA.indexOf(b.name);
          return indexA - indexB;
        });
        
        console.log(`✅ Successfully loaded ${sortedBooks.length} books:`, sortedBooks.map(b => b.fullName));
        setAvailableBooks(sortedBooks);
      } else {
        console.warn('⚠️ No books found in database');
        setAvailableBooks([]);
      }
    } catch (error) {
      console.error('❌ Error loading books:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de livros.",
        variant: "destructive"
      });
      setAvailableBooks([]);
    } finally {
      setBooksLoading(false);
      console.log('🏁 Finished loading books');
    }
  };

  // Função para buscar capítulo do Supabase
  const fetchChapter = async (bookName: string, chapterNumber: number) => {
    if (!bookName) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('versiculos')
        .select('versiculo, texto')
        .eq('livro', bookName)
        .eq('capitulo', chapterNumber)
        .order('versiculo');

      if (error) throw error;

      if (data && data.length > 0) {
        const book = availableBooks.find(b => b.name === bookName);
        const verses: BibleVerse[] = data.map(verse => ({
          number: verse.versiculo,
          text: verse.texto
        }));

        setChapterData({
          book: book || { name: bookName, fullName: NOMES_LIVROS[bookName] || bookName, chapters: 1 },
          chapter: {
            number: chapterNumber,
            verses: verses.length
          },
          verses
        });
      } else {
        toast({
          title: "Capítulo não encontrado",
          description: `O capítulo ${chapterNumber} do livro ${bookName} não foi encontrado.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar capítulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o capítulo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableBooks();
  }, []);

  return {
    availableBooks,
    booksLoading,
    chapterData,
    loading,
    fetchChapter,
    setChapterData
  };
};