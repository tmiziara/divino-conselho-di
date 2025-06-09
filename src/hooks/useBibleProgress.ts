import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "bible_reading_progress";

interface ReadingProgress {
  book: string;
  chapter: number;
}

export const useBibleProgress = () => {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState("");
  const [currentChapter, setCurrentChapter] = useState(1);

  // Carregar progresso salvo
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress: ReadingProgress = JSON.parse(saved);
        setSelectedBook(progress.book);
        setCurrentChapter(progress.chapter);
      } else {
        // Padrão: começar com Gênesis
        setSelectedBook("gn");
        setCurrentChapter(1);
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
      setSelectedBook("gn");
      setCurrentChapter(1);
    }
  };

  // Salvar progresso
  const saveProgress = (book: string, chapter: number) => {
    try {
      const progress: ReadingProgress = { book, chapter };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  };

  // Atualizar livro e salvar progresso
  const updateBook = (book: string) => {
    setSelectedBook(book);
    setCurrentChapter(1);
    saveProgress(book, 1);
  };

  // Atualizar capítulo e salvar progresso
  const updateChapter = (chapter: number) => {
    setCurrentChapter(chapter);
    if (selectedBook) {
      saveProgress(selectedBook, chapter);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return {
    selectedBook,
    currentChapter,
    updateBook,
    updateChapter,
    setSelectedBook: updateBook,
    setCurrentChapter: updateChapter
  };
};