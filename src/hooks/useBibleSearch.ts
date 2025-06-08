import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BibleVerse, BibleBook } from "./useBibleData";

export interface SearchResult {
  book: BibleBook;
  chapter: number;
  verse: BibleVerse;
  relevance: number;
}

export const useBibleSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const searchVerses = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return [];

    setSearching(true);
    try {
      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Buscar no Supabase
      const { data, error } = await supabase
        .from('versiculos')
        .select('livro, capitulo, versiculo, texto')
        .ilike('texto', `%${query}%`)
        .limit(50);

      if (error) throw error;

      if (data) {
        for (const item of data) {
          // Calcular relevância baseada na posição da palavra no texto
          const index = item.texto.toLowerCase().indexOf(queryLower);
          const relevance = index === 0 ? 1 : 1 - (index / item.texto.length);
          
          results.push({
            book: { name: item.livro, fullName: item.livro, chapters: 1 },
            chapter: item.capitulo,
            verse: { number: item.versiculo, text: item.texto },
            relevance
          });
        }
      }

      // Ordenar por relevância
      results.sort((a, b) => b.relevance - a.relevance);
      
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    searching,
    searchVerses,
    clearSearch
  };
};