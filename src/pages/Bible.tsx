import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Heart, BookOpen, Brain } from "lucide-react";
import Navigation from "@/components/Navigation";
import BibleSidebar from "@/components/BibleSidebar";
import { useAuth } from "@/hooks/useAuth";

const Bible = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [selectedText, setSelectedText] = useState("");

  const bibleBooks = [
    "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
    "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
    "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
    "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
    "Eclesiastes", "Cantares", "Isaías", "Jeremias", "Lamentações",
    "Ezequiel", "Daniel", "Oséias", "Joel", "Amós",
    "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque",
    "Sofonias", "Ageu", "Zacarias", "Malaquias", "Mateus",
    "Marcos", "Lucas", "João", "Atos", "Romanos",
    "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses",
    "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo",
    "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro",
    "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"
  ];

  const sampleVerses = [
    {
      reference: "João 3:16",
      text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
      book: "João",
      chapter: 3,
      verse: 16
    },
    {
      reference: "Salmos 23:1",
      text: "O Senhor é o meu pastor, nada me faltará.",
      book: "Salmos",
      chapter: 23,
      verse: 1
    },
    {
      reference: "Filipenses 4:13",
      text: "Posso todas as coisas naquele que me fortalece.",
      book: "Filipenses",
      chapter: 4,
      verse: 13
    }
  ];

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
                    <div className="flex gap-4 items-center">
                      <Select value={selectedBook} onValueChange={setSelectedBook}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Selecionar livro" />
                        </SelectTrigger>
                        <SelectContent>
                          {bibleBooks.map((book) => (
                            <SelectItem key={book} value={book}>
                              {book}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={currentChapter.toString()} onValueChange={(value) => setCurrentChapter(parseInt(value))}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Capítulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 50 }, (_, i) => i + 1).map((chapter) => (
                            <SelectItem key={chapter} value={chapter.toString()}>
                              {chapter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Card className="min-h-[400px]">
                      <CardContent className="p-6">
                        {selectedBook && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-bold text-primary">
                              {selectedBook} {currentChapter}
                            </h3>
                            <div className="space-y-3 text-foreground leading-relaxed">
                              {/* Sample verses - in a real app, this would come from a Bible API */}
                              <p className="cursor-pointer hover:bg-muted/50 p-2 rounded" 
                                 onClick={() => setSelectedText("Versículo 1 selecionado")}>
                                <span className="text-sm text-muted-foreground mr-2">1</span>
                                No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.
                              </p>
                              <p className="cursor-pointer hover:bg-muted/50 p-2 rounded"
                                 onClick={() => setSelectedText("Versículo 2 selecionado")}>
                                <span className="text-sm text-muted-foreground mr-2">2</span>
                                Ele estava no princípio com Deus.
                              </p>
                              <p className="cursor-pointer hover:bg-muted/50 p-2 rounded"
                                 onClick={() => setSelectedText("Versículo 3 selecionado")}>
                                <span className="text-sm text-muted-foreground mr-2">3</span>
                                Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez.
                              </p>
                            </div>
                            
                            {selectedText && user && (
                              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm mb-2">Texto selecionado: {selectedText}</p>
                                <Button size="sm" className="divine-button">
                                  <Heart className="w-4 h-4 mr-2" />
                                  Adicionar aos Favoritos
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!selectedBook && (
                          <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Selecione um livro para começar a leitura</p>
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