import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Heart, BookOpen, Brain, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import BibleSidebar from "@/components/BibleSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BibleVerse {
  number: number;
  text: string;
}

interface BibleBook {
  abbrev: {
    pt: string;
    en: string;
  };
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: string;
}

interface BibleChapter {
  book: BibleBook;
  chapter: {
    number: number;
    verses: number;
  };
  verses: BibleVerse[];
}

const Bible = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [useScrollView, setUseScrollView] = useState(true);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const [availableBooks, setAvailableBooks] = useState<BibleBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);

  // Função para fazer requisições autenticadas à API
  const makeAuthenticatedRequest = async (url: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('bible-proxy', {
      body: { url },
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
    });

    if (response.error) {
      throw new Error(`Erro na requisição: ${response.error.message}`);
    }

    return response.data;
  };

  // Função para carregar todos os livros disponíveis
  const loadAvailableBooks = async () => {
    setBooksLoading(true);
    try {
      const data = await makeAuthenticatedRequest('https://bibliaapi.com/api/books');
      if (data && Array.isArray(data)) {
        // Filtrar apenas livros em português
        const portugueseBooks = data.filter((book: any) => 
          book.abbrev && book.abbrev.pt && book.name
        );
        setAvailableBooks(portugueseBooks);
      }
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de livros. Verifique sua conexão e token de API.",
        variant: "destructive"
      });
    } finally {
      setBooksLoading(false);
    }
  };

  // Função para buscar capítulo da nova API
  const fetchChapter = async (bookAbbrev: string, chapter: number) => {
    if (!bookAbbrev) return;

    setLoading(true);
    try {
      const url = `https://bibliaapi.com/api/verses/nvi/${bookAbbrev}/${chapter}`;
      const data = await makeAuthenticatedRequest(url);

      if (data && data.verses) {
        const book = availableBooks.find(b => b.abbrev.pt === bookAbbrev);
        
        if (!book) {
          throw new Error('Livro não encontrado');
        }

        const transformedData: BibleChapter = {
          book: book,
          chapter: {
            number: chapter,
            verses: data.verses.length
          },
          verses: data.verses.map((verse: any) => ({
            number: verse.number,
            text: verse.text
          }))
        };

        setChapterData(transformedData);

        // Salvar progresso se usuário logado
        if (user) {
          await saveReadingProgress(book.name, chapter);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar capítulo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o capítulo. Verifique sua conexão e token de API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
  const addToFavorites = async () => {
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

  // Effect para carregar livros e progresso ao montar o componente
  useEffect(() => {
    loadAvailableBooks();
    if (user) {
      loadReadingProgress();
    }
  }, [user]);

  // Effect para buscar capítulo quando livro ou capítulo mudarem
  useEffect(() => {
    if (selectedBook && currentChapter && availableBooks.length > 0) {
      const book = availableBooks.find(b => b.name === selectedBook);
      if (book) {
        fetchChapter(book.abbrev.pt, currentChapter);
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

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={() => {}} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold heavenly-text mb-4">
            <BookOpen className="w-10 h-10 inline-block mr-3" />
            Sagradas Escrituras
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore a Palavra de Deus e encontre orientação para sua vida
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Popular Verses */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <BibleSidebar />
          </div>

          {/* Main Bible Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="spiritual-card">
              <CardHeader>
                <CardTitle>Sagradas Escrituras</CardTitle>
                <CardDescription>
                  Leia, busque e favorite passagens bíblicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="read" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="read">Ler a Bíblia</TabsTrigger>
                    <TabsTrigger value="search">Buscar na Bíblia</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="read" className="space-y-4">
                    <div className="flex gap-4 items-center flex-wrap">
                      <Select value={selectedBook} onValueChange={setSelectedBook} disabled={booksLoading}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder={booksLoading ? "Carregando livros..." : "Selecionar livro"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBooks.map((book) => (
                            <SelectItem key={book.abbrev.pt} value={book.name}>
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
                            {/* Header do capítulo */}
                            <div className="flex items-center justify-between border-b pb-4">
                              <h3 className="text-xl font-bold text-primary">
                                {chapterData.book.name} {chapterData.chapter.number}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigateChapter('prev')}
                                  disabled={currentChapter <= 1}
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  Anterior
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigateChapter('next')}
                                  disabled={currentChapter >= chapterData.book.chapters}
                                >
                                  Próximo
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Conteúdo dos versículos */}
                            {useScrollView ? (
                              <ScrollArea className="h-[400px]">
                                <div className="space-y-3 pr-4">
                                  {chapterData.verses.map((verse) => (
                                    <p 
                                      key={verse.number}
                                      className={`cursor-pointer p-3 rounded-lg transition-colors ${
                                        selectedVerses.has(verse.number) 
                                          ? 'bg-primary/20 border border-primary/30' 
                                          : 'hover:bg-muted/50'
                                      }`}
                                      onClick={() => toggleVerseSelection(verse.number)}
                                    >
                                      <span className="text-sm font-semibold text-primary mr-3">
                                        {verse.number}
                                      </span>
                                      <span className="text-foreground leading-relaxed">
                                        {verse.text}
                                      </span>
                                    </p>
                                  ))}
                                </div>
                              </ScrollArea>
                            ) : (
                              <div>
                                <div className="space-y-3 text-foreground leading-relaxed mb-6">
                                  {chapterData.verses.map((verse) => (
                                    <p 
                                      key={verse.number}
                                      className={`cursor-pointer p-3 rounded-lg transition-colors ${
                                        selectedVerses.has(verse.number) 
                                          ? 'bg-primary/20 border border-primary/30' 
                                          : 'hover:bg-muted/50'
                                      }`}
                                      onClick={() => toggleVerseSelection(verse.number)}
                                    >
                                      <span className="text-sm font-semibold text-primary mr-3">
                                        {verse.number}
                                      </span>
                                      <span className="text-foreground leading-relaxed">
                                        {verse.text}
                                      </span>
                                    </p>
                                  ))}
                                </div>
                                
                                {/* Paginação */}
                                <Pagination className="mt-6">
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => navigateChapter('prev')}
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
                                        onClick={() => navigateChapter('next')}
                                        className={currentChapter >= chapterData.book.chapters ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                            
                            {/* Botão de favoritar versículos selecionados */}
                            {selectedVerses.size > 0 && user && (
                              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">
                                    {selectedVerses.size} versículo(s) selecionado(s)
                                  </p>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedVerses(new Set())}
                                    >
                                      Limpar seleção
                                    </Button>
                                    <Button size="sm" className="divine-button" onClick={addToFavorites}>
                                      <Heart className="w-4 h-4 mr-2" />
                                      Adicionar aos Favoritos
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>
                              {availableBooks.length === 0 
                                ? "Configure sua chave de API da BibliaAPI.com para acessar todos os livros da Bíblia" 
                                : "Selecione um livro para começar a leitura"
                              }
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="search" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Digite sua busca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Button className="divine-button">
                          Buscar
                        </Button>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Brain className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Busca inteligente por IA (ex: versículos sobre esperança)"
                            value={aiSearchTerm}
                            onChange={(e) => setAiSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          Busca por IA
                        </Button>
                      </div>
                    </div>

                    <Card className="min-h-[400px]">
                      <CardContent className="p-6">
                        <div className="text-center py-12 text-muted-foreground">
                          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Digite sua busca para encontrar versículos</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {!user && (
          <div className="text-center mt-12">
            <Card className="spiritual-card max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Faça login para salvar seus versículos favoritos e acessar recursos premium
                </p>
                <Button className="divine-button">
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bible;