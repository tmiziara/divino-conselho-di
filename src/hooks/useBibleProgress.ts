import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ReadingPosition {
  book: string;
  chapter: number;
  verse: number;
  version: string;
  updated_at?: string;
}

export const useBibleProgress = () => {
  const { user } = useAuth();
  const [lastPosition, setLastPosition] = useState<Partial<ReadingPosition>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadLocalPosition = () => {
    try {
      const stored = localStorage.getItem('bible_reading_position');
      if (stored) {
        return JSON.parse(stored) as ReadingPosition;
      }
    } catch (error) {
      // Ignore parsing errors to keep reader stable.
    }
    return {};
  };

  useEffect(() => {
    // Phase 5: initialize local progress state (used by resume across devices).
    setLastPosition(loadLocalPosition());
    setHasLoaded(true);
  }, [user?.id]);

  useEffect(() => {
    // Phase 5: listen for sync updates from other tabs/devices.
    const handleUpdate = (event: CustomEvent) => {
      setLastPosition(event.detail);
    };
    window.addEventListener('bibleProgressUpdated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('bibleProgressUpdated', handleUpdate as EventListener);
    };
  }, []);

  const saveProgress = (book: string, chapter: number, verse: number = 1, version: string = 'nvi') => {
    const position: ReadingPosition = { book, chapter, verse, version, updated_at: new Date().toISOString() };
    
    // Save to localStorage for all users
    localStorage.setItem('bible_reading_position', JSON.stringify(position));
    setLastPosition(position);
    window.dispatchEvent(new CustomEvent('bibleProgressUpdated', { detail: position }));
    
    // If user is logged in, we could also save to database in the future
    if (user) {
      // Phase 5: Save to Supabase to enable cross-device resume.
      supabase
        .from('bible_progress')
        .upsert(
          {
            user_id: user.id,
            book,
            chapter,
            verse,
            version,
            updated_at: position.updated_at,
          },
          { onConflict: 'user_id' }
        )
        .then()
        .catch(() => {
          // Ignore sync errors and keep local progress.
        });
    }
  };

  const getLastPosition = (): Partial<ReadingPosition> => {
    return lastPosition;
  };

  const clearProgress = () => {
    localStorage.removeItem('bible_reading_position');
    setLastPosition({});
  };

  return {
    saveProgress,
    getLastPosition,
    clearProgress,
    lastPosition,
    hasLoaded
  };
};
