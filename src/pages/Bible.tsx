import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Heart, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

const Bible = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

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

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="spiritual-card">
            <CardHeader>
              <CardTitle>Buscar na Bíblia</CardTitle>
              <CardDescription>
                Pesquise por versículos, palavras-chave ou temas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button className="divine-button">
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Verses */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center heavenly-text">
            Versículos Populares
          </h2>
          
          <div className="grid gap-6">
            {sampleVerses.map((verse, index) => (
              <Card key={index} className="spiritual-card">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-primary">{verse.reference}</span>
                    {user && (
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed text-foreground">
                    {verse.text}
                  </p>
                </CardContent>
              </Card>
            ))}
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