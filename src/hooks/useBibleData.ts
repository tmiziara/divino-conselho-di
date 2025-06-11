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

  // Debug: Log verses state changes
  console.log("[useBibleData] Current state - verses count:", verses.length, "loading:", loading, "selectedBook:", selectedBook, "selectedChapter:", selectedChapter);

  const loadChapters = async (book: string) => {
    try {
      setLoading(true);
      console.log("[useBibleData] Loading chapters for book:", book);
      
      const { data, error } = await supabase
        .from("versiculos")
        .select("capitulo")
        .eq("livro", book)
        .order("capitulo");

      if (error) {
        console.error("[useBibleData] Error loading chapters:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("[useBibleData] No chapters found for book:", book);
        setChapters([]);
        return;
      }

      const uniqueChapters = Array.from(new Set(data.map(item => item.capitulo))).sort((a, b) => a - b);
      console.log("[useBibleData] Loaded chapters:", uniqueChapters.length);
      setChapters(uniqueChapters);
    } catch (error) {
      console.error("[useBibleData] Error loading chapters:", error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVerses = async (book: string, chapter: number) => {
    try {
      setLoading(true);
      console.log("[useBibleData] Loading verses for:", book, chapter);
      
      const { data, error } = await supabase
        .from("versiculos")
        .select("*")
        .eq("livro", book)
        .eq("capitulo", chapter)
        .order("versiculo");

      console.log("[useBibleData] Query result - data:", data, "error:", error);

      if (error) {
        console.error("[useBibleData] Error loading verses:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("[useBibleData] No verses found for:", book, chapter);
        setVerses([]);
        return;
      }

      console.log("[useBibleData] Successfully loaded verses:", data.length);
      console.log("[useBibleData] First verse:", data[0]);
      setVerses(data);
    } catch (error) {
      console.error("[useBibleData] Error loading verses:", error);
      setVerses([]);
    } finally {
      setLoading(false);
      console.log("[useBibleData] Loading finished for:", book, chapter);
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