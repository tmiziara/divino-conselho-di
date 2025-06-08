import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleBook {
  name: string;
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
      const { data, error } = await supabase
        .from('versiculos')
        .select('livro')
        .order('livro');

      if (error) throw error;

      if (data) {
        // Obter livros únicos e contar capítulos
        const uniqueBooks = Array.from(new Set(data.map(item => item.livro)));
        const booksWithChapters = await Promise.all(
          uniqueBooks.map(async (bookName) => {
            const { data: chaptersData, error: chaptersError } = await supabase
              .from('versiculos')
              .select('capitulo')
              .eq('livro', bookName)
              .order('capitulo');

            if (chaptersError) throw chaptersError;

            const maxChapter = Math.max(...chaptersData.map(c => c.capitulo));
            
            return {
              name: bookName,
              chapters: maxChapter
            };
          })
        );

        setAvailableBooks(booksWithChapters);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
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
          book: book || { name: bookName, chapters: 1 },
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