// useBibleData.ts

import { useState, useEffect, useCallback } from "react";

interface Verse {
  id?: number;
  livro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  versao?: string | null;
}

interface BookData {
  abbrev: string;
  name: string;
  chapters: string[][]; // [ [verso1, verso2, ...], ... ]
}

export const useBibleData = (bibleVersion: string = 'nvi') => {
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string>(bibleVersion);

  useEffect(() => {
    // Se a versão mudou, limpar cache e atualizar versão atual
    if (currentVersion !== bibleVersion) {
      setBookData(null);
      setChapters([]);
      setVerses([]);
      setCurrentVersion(bibleVersion);
    }
  }, [bibleVersion, currentVersion]);

  // Melhorar cache com localStorage
  const getCachedBook = useCallback((bookAbbrev: string, version: string) => {
    const cacheKey = `bible_${version}_${bookAbbrev}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  }, []);

  const setCachedBook = useCallback((bookAbbrev: string, version: string, data: any) => {
    const cacheKey = `bible_${version}_${bookAbbrev}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      // Se localStorage estiver cheio, limpar cache antigo
      const keys = Object.keys(localStorage).filter(key => key.startsWith('bible_'));
      if (keys.length > 50) {
        keys.slice(0, 10).forEach(key => localStorage.removeItem(key));
      }
    }
  }, []);

  const loadBook = async (bookAbbrev: string, version: string) => {
    setLoading(true);
    try {
      // Tentar cache primeiro
      const cached = getCachedBook(bookAbbrev, version);
      if (cached) {
        setBookData(cached);
        setChapters(cached.chapters.map((_, idx: number) => idx + 1));
        setLoading(false);
        return cached;
      }

      // Se não estiver em cache, carregar da rede
      const res = await fetch(`/data/bible/${version}/${bookAbbrev}.json`);
      if (!res.ok) throw new Error(`Livro não encontrado: ${bookAbbrev}`);
      const data = await res.json();
      
      // Salvar no cache
      setCachedBook(bookAbbrev, version, data);
      
      setBookData(data);
      setChapters(data.chapters.map((_, idx: number) => idx + 1));
      return data;
    } catch (error) {
      setBookData(null);
      setChapters([]);
      setVerses([]);
      console.error('[useBibleData] Erro ao carregar livro:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (book: string, version: string) => {
    await loadBook(book, version);
  };

  const loadVerses = async (book: string, chapter: number, version: string) => {
    setLoading(true);
    try {
      let data = bookData;
      // Recarregar se: livro mudou OU versão mudou OU não há dados
      if (!data || data.abbrev !== book || currentVersion !== version) {
        data = await loadBook(book, version);
        if (!data) throw new Error("Livro não carregado.");
      }

      const chapterVerses = data.chapters[chapter - 1] || [];
      const versesArr: Verse[] = chapterVerses.map((texto: string, idx: number) => ({
        livro: data!.abbrev,
        capitulo: chapter,
        versiculo: idx + 1,
        texto,
        versao: version.toUpperCase(),
      }));
      setVerses(versesArr);
    } catch (error) {
      setVerses([]);
      console.error('[useBibleData] Erro ao carregar versículos:', error);
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
