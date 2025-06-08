import { useState, useEffect } from "react";
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

  // Função para carregar dados locais
  const loadLocalData = async (path: string) => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${path}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao carregar arquivo ${path}:`, error);
      throw error;
    }
  };

  // Função para carregar todos os livros disponíveis
  const loadAvailableBooks = async () => {
    setBooksLoading(true);
    try {
      const data = await loadLocalData('/data/books.json');
      if (data && Array.isArray(data)) {
        setAvailableBooks(data);
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

  // Função para buscar capítulo dos dados locais
  const fetchChapter = async (bookAbbrev: string, chapter: number) => {
    if (!bookAbbrev) return;

    setLoading(true);
    try {
      const data = await loadLocalData(`/data/${bookAbbrev}/${chapter}.json`);
      
      if (data) {
        setChapterData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar capítulo:', error);
      toast({
        title: "Capítulo não encontrado",
        description: `O capítulo ${chapter} do livro ${bookAbbrev} ainda não está disponível.`,
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