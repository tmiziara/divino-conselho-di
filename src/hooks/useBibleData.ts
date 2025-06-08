import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleBook {
  abbrev: {
    pt: string;
    en: string;
  };
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: string;
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

  // Função para fazer requisições autenticadas à API
  const makeAuthenticatedRequest = async (url: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('bible-proxy', {
      body: { url },
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
    });

    if (response.error) {
      throw new Error(`Erro na requisição: ${response.error.message}`);
    }

    return response.data;
  };

  // Função para carregar todos os livros disponíveis
  const loadAvailableBooks = async () => {
    setBooksLoading(true);
    try {
      const data = await makeAuthenticatedRequest('https://www.bibliaapi.com/api/books/acf');
      if (data && Array.isArray(data)) {
        // Filtrar apenas livros em português
        const portugueseBooks = data.filter((book: any) => 
          book.abbrev && book.abbrev.pt && book.name
        );
        setAvailableBooks(portugueseBooks);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de livros. Verifique sua conexão e token de API.",
        variant: "destructive"
      });
    } finally {
      setBooksLoading(false);
    }
  };

  // Função para buscar capítulo da nova API
  const fetchChapter = async (bookAbbrev: string, chapter: number) => {
    if (!bookAbbrev) return;

    setLoading(true);
    try {
      const url = `https://www.bibliaapi.com/api/verses/acf/${bookAbbrev}/${chapter}`;
      const data = await makeAuthenticatedRequest(url);

      if (data && data.verses) {
        const book = availableBooks.find(b => b.abbrev.pt === bookAbbrev);
        
        if (!book) {
          throw new Error('Livro não encontrado');
        }

        const transformedData: BibleChapter = {
          book: book,
          chapter: {
            number: chapter,
            verses: data.verses.length
          },
          verses: data.verses.map((verse: any) => ({
            number: verse.number,
            text: verse.text
          }))
        };

        setChapterData(transformedData);
      }
    } catch (error) {
      console.error('Erro ao buscar capítulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o capítulo. Verifique sua conexão e token de API.",
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