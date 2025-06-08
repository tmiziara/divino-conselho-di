import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen } from "lucide-react";
import { BibleChapterNavigation } from "./BibleChapterNavigation";
import { BibleVerseDisplay } from "./BibleVerseDisplay";
import { BibleVerseSelection } from "./BibleVerseSelection";
import { useBibleData } from "@/hooks/useBibleData";
import { useBibleProgress } from "@/hooks/useBibleProgress";

export const BibleReader = () => {
  const { availableBooks, booksLoading, chapterData, loading, fetchChapter } = useBibleData();
  const {
    selectedBook,
    setSelectedBook,
    currentChapter,
    setCurrentChapter,
    selectedVerses,
    setSelectedVerses,
    saveReadingProgress,
    addToFavorites,
    toggleVerseSelection
  } = useBibleProgress();
  
  const [useScrollView, setUseScrollView] = useState(true);

  // Effect para buscar capítulo quando livro ou capítulo mudarem
  useEffect(() => {
    if (selectedBook && currentChapter && availableBooks.length > 0) {
      const book = availableBooks.find(b => b.name === selectedBook);
      if (book) {
        fetchChapter(selectedBook, currentChapter);
        saveReadingProgress(selectedBook, currentChapter);
      }
    }
  }, [selectedBook, currentChapter, availableBooks]);

  // Função para navegar entre capítulos
  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!chapterData) return;
    
    const newChapter = direction === 'prev' ? currentChapter - 1 : currentChapter + 1;
    if (newChapter >= 1 && newChapter <= chapterData.book.chapters) {
      setCurrentChapter(newChapter);
    }
  };

  const handleAddToFavorites = () => {
    addToFavorites(chapterData);
  };

  const handleClearSelection = () => {
    setSelectedVerses(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={selectedBook} onValueChange={setSelectedBook} disabled={booksLoading}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={booksLoading ? "Carregando livros..." : "Selecionar livro"} />
          </SelectTrigger>
          <SelectContent>
            {availableBooks.map((book) => (
              <SelectItem key={book.name} value={book.name}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {chapterData && (
          <Select value={currentChapter.toString()} onValueChange={(value) => setCurrentChapter(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Capítulo" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: chapterData.book.chapters }, (_, i) => i + 1).map((chapter) => (
                <SelectItem key={chapter} value={chapter.toString()}>
                  {chapter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {chapterData && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="scroll-mode" 
              checked={useScrollView} 
              onCheckedChange={setUseScrollView}
            />
            <Label htmlFor="scroll-mode" className="text-sm">
              {useScrollView ? "Rolagem contínua" : "Paginação"}
            </Label>
          </div>
        )}
      </div>

      <Card className="min-h-[500px]">
        <CardContent className="p-6">
          {booksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span className="text-muted-foreground">Carregando livros da Bíblia...</span>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Carregando capítulo...</span>
            </div>
          ) : chapterData ? (
            <div className="space-y-4">
              <BibleChapterNavigation
                chapterData={chapterData}
                currentChapter={currentChapter}
                onNavigateChapter={navigateChapter}
              />

              <BibleVerseDisplay
                verses={chapterData.verses}
                selectedVerses={selectedVerses}
                useScrollView={useScrollView}
                currentChapter={currentChapter}
                maxChapters={chapterData.book.chapters}
                onToggleVerseSelection={toggleVerseSelection}
                onNavigateChapter={navigateChapter}
              />
              
              <BibleVerseSelection
                selectedVerses={selectedVerses}
                onClearSelection={handleClearSelection}
                onAddToFavorites={handleAddToFavorites}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {availableBooks.length === 0 
                  ? "Carregando livros da Bíblia do Supabase..." 
                  : "Selecione um livro para começar a leitura"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};