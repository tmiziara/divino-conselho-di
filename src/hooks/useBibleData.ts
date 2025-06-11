import { useState, useRef } from "react";
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
  
  // Prevent duplicate requests
  const loadingRef = useRef(false);
  const lastRequestRef = useRef<string>("");

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

  const loadVerses = async (book: string, chapter: number, retryCount = 0) => {
    const requestKey = `${book}-${chapter}`;
    
    // Prevent duplicate requests
    if (loadingRef.current && lastRequestRef.current === requestKey) {
      console.log("[useBibleData] Duplicate request blocked for:", requestKey);
      return;
    }
    
    // Check Supabase connection first
    console.log("[useBibleData] Checking Supabase connection...");
    try {
      const { error: connectionError } = await supabase.from("versiculos").select("id").limit(1);
      if (connectionError) {
        console.error("[useBibleData] Supabase connection failed:", connectionError);
        throw new Error(`Connection failed: ${connectionError.message}`);
      }
      console.log("[useBibleData] Supabase connection OK");
    } catch (connError) {
      console.error("[useBibleData] Connection test failed:", connError);
      setLoading(false);
      return;
    }

    try {
      loadingRef.current = true;
      lastRequestRef.current = requestKey;
      setLoading(true);
      console.log("[useBibleData] Loading verses for:", book, chapter, retryCount > 0 ? `(retry ${retryCount})` : "");
      
      // Add timeout to query
      const queryPromise = supabase
        .from("versiculos")
        .select("*")
        .eq("livro", book)
        .eq("capitulo", chapter)
        .order("versiculo");

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log("[useBibleData] Query result - data count:", data?.length || 0, "error:", error);
      console.log("[useBibleData] Raw query response:", { data, error });

      if (error) {
        console.error("[useBibleData] Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("[useBibleData] No verses found for:", book, chapter);
        // Try with fallback data for Genesis 1 if this is the first chapter
        if (book === "gn" && chapter === 1 && retryCount === 0) {
          console.log("[useBibleData] Trying fallback approach for Genesis 1");
          return loadVerses(book, chapter, 1);
        }
        setVerses([]);
        return;
      }

      console.log("[useBibleData] Successfully loaded verses:", data.length);
      console.log("[useBibleData] First verse sample:", {
        id: data[0]?.id,
        livro: data[0]?.livro,
        capitulo: data[0]?.capitulo,
        versiculo: data[0]?.versiculo,
        texto: data[0]?.texto?.substring(0, 50) + "..."
      });
      setVerses(data);
    } catch (error: any) {
      console.error("[useBibleData] Error loading verses:", error);
      console.error("[useBibleData] Error type:", typeof error);
      console.error("[useBibleData] Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Retry logic - try up to 2 times
      if (retryCount < 2) {
        console.log(`[useBibleData] Retrying in 1 second... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          loadVerses(book, chapter, retryCount + 1);
        }, 1000);
        return;
      }
      
      setVerses([]);
    } finally {
      loadingRef.current = false;
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