import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BibleVerse } from "@/hooks/useBibleData";

interface BibleVerseDisplayProps {
  verses: BibleVerse[];
  selectedVerses: Set<number>;
  useScrollView: boolean;
  currentChapter: number;
  maxChapters: number;
  onToggleVerseSelection: (verseNumber: number) => void;
  onNavigateChapter: (direction: 'prev' | 'next') => void;
}

export const BibleVerseDisplay = ({
  verses,
  selectedVerses,
  useScrollView,
  currentChapter,
  maxChapters,
  onToggleVerseSelection,
  onNavigateChapter
}: BibleVerseDisplayProps) => {
  const renderVerse = (verse: BibleVerse) => (
    <p 
      key={verse.number}
      className={`cursor-pointer p-3 rounded-lg transition-colors ${
        selectedVerses.has(verse.number) 
          ? 'bg-primary/20 border border-primary/30' 
          : 'hover:bg-muted/50'
      }`}
      onClick={() => onToggleVerseSelection(verse.number)}
    >
      <span className="text-sm font-semibold text-primary mr-3">
        {verse.number}
      </span>
      <span className="text-foreground leading-relaxed">
        {verse.text}
      </span>
    </p>
  );

  if (useScrollView) {
    return (
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {verses.map(renderVerse)}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div>
      <div className="space-y-3 text-foreground leading-relaxed mb-6">
        {verses.map(renderVerse)}
      </div>
      
      {/* Paginação */}
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onNavigateChapter('prev')}
              className={currentChapter <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>
              {currentChapter}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              onClick={() => onNavigateChapter('next')}
              className={currentChapter >= maxChapters ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};