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
  created_at: string;
}

interface AddFavoriteData {
  book: string;
  chapter: number;
  verse: number;
  title: string;
  content: string;
  reference: string;
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
          verse: favoriteData.verse
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

  const removeFromFavorites = async (book: string, chapter: number, verse: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("book", book)
        .eq("chapter", chapter)
        .eq("verse", verse);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => 
        !(fav.book === book && fav.chapter === chapter && fav.verse === verse)
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

  return {
    favorites,
    loading,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    removeFavoriteByTitle
  };
};