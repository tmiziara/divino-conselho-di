import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Brain, Loader2 } from "lucide-react";
import { useBibleSearch } from "@/hooks/useBibleSearch";

export const BibleSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const { searchResults, searching, searchVerses, clearSearch } = useBibleSearch();

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchVerses(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    clearSearch();
  };

  return (
    <div className="space-y-4">
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
          <Button className="divine-button" onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {searchResults.length} resultado(s) encontrado(s)
                </h3>
                <Button variant="outline" onClick={handleClearSearch}>
                  Limpar busca
                </Button>
              </div>
              
              <ScrollArea className="h-[350px]">
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-primary">
                          {result.book.name} {result.chapter}:{result.verse.number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.book.testament}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {result.verse.text}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {searching
                  ? "Buscando versículos..."
                  : "Digite sua busca para encontrar versículos"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};