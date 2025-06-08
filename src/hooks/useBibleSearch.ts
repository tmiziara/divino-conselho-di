import { useState } from "react";
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
      // Carregar lista de livros
      const booksResponse = await fetch('/data/books.json');
      const books: BibleBook[] = await booksResponse.json();
      
      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Buscar em alguns capítulos disponíveis como exemplo
      const availableChapters = [
        { book: 'gn', chapters: [1] },
        { book: 'jo', chapters: [3] }
      ];

      for (const { book: bookAbbrev, chapters } of availableChapters) {
        const book = books.find(b => b.abbrev.pt === bookAbbrev);
        if (!book) continue;

        for (const chapterNum of chapters) {
          try {
            const chapterResponse = await fetch(`/data/${bookAbbrev}/${chapterNum}.json`);
            if (!chapterResponse.ok) continue;
            
            const chapterData = await chapterResponse.json();
            
            for (const verse of chapterData.verses) {
              if (verse.text.toLowerCase().includes(queryLower)) {
                // Calcular relevância baseada na posição da palavra no texto
                const index = verse.text.toLowerCase().indexOf(queryLower);
                const relevance = index === 0 ? 1 : 1 - (index / verse.text.length);
                
                results.push({
                  book,
                  chapter: chapterNum,
                  verse,
                  relevance
                });
              }
            }
          } catch (error) {
            console.error(`Erro ao buscar no capítulo ${bookAbbrev} ${chapterNum}:`, error);
          }
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