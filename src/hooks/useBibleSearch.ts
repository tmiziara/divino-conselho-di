import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: number;
  livro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  versao: string | null;
}

export const useBibleSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchVerses = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("versiculos")
        .select("*")
        .ilike("texto", `%${query}%`)
        .order("livro")
        .order("capitulo")
        .order("versiculo")
        .limit(100); // Limit results for performance

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching verses:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    searchVerses
  };
};