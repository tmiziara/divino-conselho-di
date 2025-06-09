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
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Biblical book order - matches database abbreviations exactly
  const BIBLICAL_ORDER = [
    "gn", "ex", "lv", "nm", "dt", "js", "jz", "rt", "1sm", "2sm",
    "1rs", "2rs", "1cr", "2cr", "ed", "ne", "et", "jó", "sl", "pv",
    "ec", "ct", "is", "jr", "lm", "ez", "dn", "os", "jl", "am",
    "ob", "jn", "mq", "na", "hc", "sf", "ag", "zc", "ml", "mt",
    "mc", "lc", "jo", "atos", "rm", "1co", "2co", "gl", "ef", "fp",
    "cl", "1ts", "2ts", "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe",
    "2pe", "1jo", "2jo", "3jo", "jd", "ap"
  ];

  const loadBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("versiculos")
        .select("livro")
        .order("livro");

      if (error) throw error;

      const uniqueBooks = Array.from(new Set(data.map(item => item.livro)));
      const orderedBooks = BIBLICAL_ORDER.filter(book => uniqueBooks.includes(book));
      
      setBooks(orderedBooks);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
    }
  };

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
    books,
    chapters,
    verses,
    selectedBook,
    selectedChapter,
    loading,
    setSelectedBook,
    setSelectedChapter,
    loadBooks,
    loadChapters,
    loadVerses
  };
};