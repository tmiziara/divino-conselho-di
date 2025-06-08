import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mapeamento dos códigos dos livros para nomes completos (baseado nos códigos reais da base de dados)
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
  "jó": "Jó",
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
  "atos": "Atos",
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
  "1cr", "2cr", "ed", "ne", "et", "jó", "sl", "pv", "ec", "ct", "is", "jr", 
  "lm", "ez", "dn", "os", "jl", "am", "ob", "jn", "mq", "na", "hc", "sf", 
  "ag", "zc", "ml", "mt", "mc", "lc", "jo", "atos", "rm", "1co", "2co", "gl", 
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
    try {
      console.log('🔍 Iniciando carregamento de livros...');
      
      const { data, error } = await supabase
        .from('versiculos')
        .select('livro')
        .order('livro');

      if (error) throw error;

      if (data) {
        console.log('📚 Total de registros encontrados:', data.length);
        
        // Obter livros únicos
        const uniqueBooks = Array.from(new Set(data.map(item => item.livro)));
        console.log('📖 Livros únicos encontrados:', uniqueBooks.length, uniqueBooks);
        
        // Processar cada livro individualmente para evitar falhas em cascata
        const booksWithChapters = [];
        
        for (const bookCode of uniqueBooks) {
          try {
            console.log(`📝 Processando livro: ${bookCode}`);
            
            const { data: chaptersData, error: chaptersError } = await supabase
              .from('versiculos')
              .select('capitulo')
              .eq('livro', bookCode)
              .order('capitulo');

            if (chaptersError) {
              console.error(`❌ Erro ao carregar capítulos para ${bookCode}:`, chaptersError);
              continue; // Pular este livro e continuar com os outros
            }

            if (!chaptersData || chaptersData.length === 0) {
              console.warn(`⚠️ Nenhum capítulo encontrado para ${bookCode}`);
              continue;
            }

            const maxChapter = Math.max(...chaptersData.map(c => c.capitulo));
            console.log(`✅ ${bookCode}: ${maxChapter} capítulos`);
            
            booksWithChapters.push({
              name: bookCode,
              fullName: NOMES_LIVROS[bookCode] || bookCode,
              chapters: maxChapter
            });
          } catch (bookError) {
            console.error(`❌ Erro ao processar livro ${bookCode}:`, bookError);
            // Continuar com o próximo livro
          }
        }

        // Ordenar livros na ordem bíblica
        const sortedBooks = booksWithChapters.sort((a, b) => {
          const indexA = ORDEM_BIBLICA.indexOf(a.name);
          const indexB = ORDEM_BIBLICA.indexOf(b.name);
          return indexA - indexB;
        });

        console.log('📚 Total de livros processados com sucesso:', sortedBooks.length);
        console.log('📋 Livros finais:', sortedBooks.map(b => `${b.name} (${b.fullName})`));
        
        setAvailableBooks(sortedBooks);
      }
    } catch (error) {
      console.error('❌ Erro crítico ao carregar livros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de livros.",
        variant: "destructive"
      });
    } finally {
      setBooksLoading(false);
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