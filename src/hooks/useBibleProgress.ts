import { useAuth } from "./useAuth";

interface ReadingPosition {
  book: string;
  chapter: number;
  verse: number;
  version: string;
}

export const useBibleProgress = () => {
  const { user } = useAuth();

  const saveProgress = (book: string, chapter: number, verse: number = 1, version: string = 'nvi') => {
    const position: ReadingPosition = { book, chapter, verse, version };
    
    // Save to localStorage for all users
    localStorage.setItem('bible_reading_position', JSON.stringify(position));
    
    // If user is logged in, we could also save to database in the future
    if (user) {
      // TODO: Save to bible_progress table in Supabase
      // This would allow syncing across devices
    }
  };

  const getLastPosition = (): Partial<ReadingPosition> => {
    try {
      const stored = localStorage.getItem('bible_reading_position');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading stored position:', error);
    }
    return {};
  };

  const clearProgress = () => {
    localStorage.removeItem('bible_reading_position');
  };

  return {
    saveProgress,
    getLastPosition,
    clearProgress
  };
};