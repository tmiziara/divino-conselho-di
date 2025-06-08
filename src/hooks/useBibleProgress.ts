import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BibleChapter } from "./useBibleData";

export const useBibleProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState("");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());

  // Função para carregar progresso de leitura
  const loadReadingProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bible_progress')
        .select('book, chapter')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSelectedBook(data.book);
        setCurrentChapter(data.chapter);
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  // Função para salvar progresso de leitura
  const saveReadingProgress = async (book: string, chapter: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bible_progress')
        .upsert({
          user_id: user.id,
          book,
          chapter,
          verse: 1
        }, {
          onConflict: 'user_id,book'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  // Função para favoritar versículos
  const addToFavorites = async (chapterData: BibleChapter | null) => {
    if (!user || selectedVerses.size === 0 || !chapterData) return;

    try {
      const versesToAdd = Array.from(selectedVerses).map(verseNum => {
        const verse = chapterData.verses.find(v => v.number === verseNum);
        return {
          user_id: user.id,
          type: 'verse',
          title: `${chapterData.book.name} ${chapterData.chapter.number}:${verseNum}`,
          content: verse?.text || "",
          reference: `${chapterData.book.name} ${chapterData.chapter.number}:${verseNum}`,
          book: chapterData.book.name,
          chapter: chapterData.chapter.number,
          verse: verseNum
        };
      });

      const { error } = await supabase.from('favorites').insert(versesToAdd);
      
      if (error) throw error;
      
      toast({
        title: "Versículos favoritados!",
        description: `${versesToAdd.length} versículo(s) adicionado(s) aos favoritos.`
      });
      setSelectedVerses(new Set());
    } catch (error) {
      console.error('Erro ao favoritar versículos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos.",
        variant: "destructive"
      });
    }
  };

  // Função para alternar seleção de versículo
  const toggleVerseSelection = (verseNumber: number) => {
    const newSelection = new Set(selectedVerses);
    if (newSelection.has(verseNumber)) {
      newSelection.delete(verseNumber);
    } else {
      newSelection.add(verseNumber);
    }
    setSelectedVerses(newSelection);
  };

  useEffect(() => {
    if (user) {
      loadReadingProgress();
    }
  }, [user]);

  return {
    selectedBook,
    setSelectedBook,
    currentChapter,
    setCurrentChapter,
    selectedVerses,
    setSelectedVerses,
    saveReadingProgress,
    addToFavorites,
    toggleVerseSelection
  };
};