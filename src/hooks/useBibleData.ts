// useBibleData.ts

import { useState, useEffect } from "react";

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

  const loadBook = async (bookAbbrev: string, version: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/data/bible/${version}/${bookAbbrev}.json`);
      if (!res.ok) throw new Error(`Livro não encontrado: ${bookAbbrev}`);
      const data = await res.json();
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
