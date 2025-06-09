import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Verse {
  id: number;
  livro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  versao: string | null;
}

export const useBibleData = () => {
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadChapters = async (book: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("versiculos")
        .select("capitulo")
        .eq("livro", book)
        .order("capitulo");

      if (error) throw error;

      const uniqueChapters = Array.from(new Set(data.map(item => item.capitulo))).sort((a, b) => a - b);
      setChapters(uniqueChapters);
    } catch (error) {
      console.error("Error loading chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerses = async (book: string, chapter: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("versiculos")
        .select("*")
        .eq("livro", book)
        .eq("capitulo", chapter)
        .order("versiculo");

      if (error) throw error;

      setVerses(data || []);
    } catch (error) {
      console.error("Error loading verses:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    chapters,
    verses,
    selectedBook,
    selectedChapter,
    loading,
    setSelectedBook,
    setSelectedChapter,
    loadChapters,
    loadVerses
  };
};