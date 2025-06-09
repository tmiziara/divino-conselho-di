import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useBibleData } from "@/hooks/useBibleData";
import { useBibleProgress } from "@/hooks/useBibleProgress";

export const SimpleBibleReader = () => {
  const { availableBooks, booksLoading, chapterData, loading, fetchChapter } = useBibleData();
  const { selectedBook, currentChapter, updateBook, updateChapter } = useBibleProgress();

  // Buscar capítulo quando livro ou capítulo mudarem
  useEffect(() => {
    if (selectedBook && currentChapter && availableBooks.length > 0) {
      fetchChapter(selectedBook, currentChapter);
    }
  }, [selectedBook, currentChapter, availableBooks, fetchChapter]);

  // Navegação entre capítulos
  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!chapterData) return;
    
    const newChapter = direction === 'prev' ? currentChapter - 1 : currentChapter + 1;
    if (newChapter >= 1 && newChapter <= chapterData.book.chapters) {
      updateChapter(newChapter);
    }
  };

  // Navegação entre livros
  const navigateBook = (direction: 'prev' | 'next') => {
    const currentIndex = availableBooks.findIndex(book => book.name === selectedBook);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < availableBooks.length) {
      updateBook(availableBooks[newIndex].name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles de seleção */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateBook('prev')}
            disabled={!selectedBook || availableBooks.findIndex(b => b.name === selectedBook) === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Select value={selectedBook} onValueChange={updateBook} disabled={booksLoading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={booksLoading ? "Carregando..." : "Selecionar livro"} />
            </SelectTrigger>
            <SelectContent>
              {availableBooks.map((book) => (
                <SelectItem key={book.name} value={book.name}>
                  {book.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateBook('next')}
            disabled={!selectedBook || availableBooks.findIndex(b => b.name === selectedBook) === availableBooks.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {chapterData && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateChapter('prev')}
              disabled={currentChapter <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Select value={currentChapter.toString()} onValueChange={(value) => updateChapter(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Capítulo" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: chapterData.book.chapters }, (_, i) => i + 1).map((chapter) => (
                  <SelectItem key={chapter} value={chapter.toString()}>
                    Capítulo {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateChapter('next')}
              disabled={currentChapter >= chapterData.book.chapters}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo da leitura */}
      <Card className="min-h-[600px]">
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
              {/* Cabeçalho do capítulo */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-primary">
                  {chapterData.book.fullName}
                </h2>
                <p className="text-lg text-muted-foreground">
                  Capítulo {chapterData.chapter.number}
                </p>
              </div>

              {/* Versículos */}
              <ScrollArea className="h-[500px]">
                <div className="space-y-4 pr-4">
                  {chapterData.verses.map((verse) => (
                    <p key={verse.number} className="text-foreground leading-relaxed">
                      <span className="text-sm font-semibold text-primary mr-3 inline-block min-w-[2rem]">
                        {verse.number}
                      </span>
                      <span className="text-base">
                        {verse.text}
                      </span>
                    </p>
                  ))}
                </div>
              </ScrollArea>

              {/* Navegação inferior */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigateChapter('prev')}
                  disabled={currentChapter <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Capítulo Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  {chapterData.verses.length} versículos
                </span>

                <Button
                  variant="outline"
                  onClick={() => navigateChapter('next')}
                  disabled={currentChapter >= chapterData.book.chapters}
                >
                  Próximo Capítulo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {availableBooks.length === 0 
                  ? "Carregando livros da Bíblia..." 
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