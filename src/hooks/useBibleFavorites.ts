import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Favorite {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  reference: string | null;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  version: string | null;
  created_at: string;
}

interface AddFavoriteData {
  book: string;
  chapter: number;
  verse: number;
  title: string;
  content: string;
  reference: string;
  version?: string;
}

export const useBibleFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .in("type", ["verse", "study"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (favoriteData: AddFavoriteData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          type: favoriteData.book === 'study' ? 'study' : 'verse',
          title: favoriteData.title,
          content: favoriteData.content,
          reference: favoriteData.reference,
          book: favoriteData.book,
          chapter: favoriteData.chapter,
          verse: favoriteData.verse,
          version: favoriteData.version || 'nvi'
        })
        .select()
        .single();

      if (error) throw error;

      setFavorites(prev => [data, ...prev]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  };

  const removeFromFavorites = async (book: string, chapter: number, verse: number, version?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);

      // Se a versão foi especificada, filtrar por ela também
      if (version) {
        query = query.eq("version", version);
      }

      const { error } = await query;

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => 
        !(fav.book === book && fav.chapter === chapter && fav.verse === verse && (!version || fav.version === version))
      ));
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  };

  const removeFavoriteByTitle = async (title: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("title", title);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.title !== title));
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  };

  const isVerseFavorite = (verse: any, version?: string) => {
    return favorites.some(fav => 
      fav.book === verse.livro && 
      fav.chapter === verse.capitulo && 
      fav.verse === verse.versiculo &&
      fav.version === (version || 'nvi')
    );
  };

  return {
    favorites,
    loading,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    removeFavoriteByTitle,
    isVerseFavorite
  };
};