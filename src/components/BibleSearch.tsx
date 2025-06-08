import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Brain } from "lucide-react";

export const BibleSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiSearchTerm, setAiSearchTerm] = useState("");

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
    </div>
  );
};