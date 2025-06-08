import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BibleChapter } from "@/hooks/useBibleData";

interface BibleChapterNavigationProps {
  chapterData: BibleChapter;
  currentChapter: number;
  onNavigateChapter: (direction: 'prev' | 'next') => void;
}

export const BibleChapterNavigation = ({ 
  chapterData, 
  currentChapter, 
  onNavigateChapter 
}: BibleChapterNavigationProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <h3 className="text-xl font-bold text-primary">
        {chapterData.book.name} {chapterData.chapter.number}
      </h3>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigateChapter('prev')}
          disabled={currentChapter <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onNavigateChapter('next')}
          disabled={currentChapter >= chapterData.book.chapters}
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};