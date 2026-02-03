import { useState } from "react";
import { Search, Bookmark, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import BibleReader from "@/components/BibleReader";
import BibleSearch from "@/components/BibleSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";

const Bible = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"reader" | "search">("reader");
  const [searchQuery, setSearchQuery] = useState("");
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab("search");
  };

  const handleAuthClick = () => {
    setShowAuthDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={handleAuthClick} />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="flex justify-center items-center text-4xl font-bold heavenly-text mb-4">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 mr-3 text-primary" />
              {tx("Bíblia Sagrada", "Holy Bible")}
            </h1>
            <p className="text-muted-foreground">
              {tx("Leia, pesquise e favorite versículos da Palavra de Deus", "Read, search, and favorite verses from the Word of God")}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={tx("Pesquisar na Bíblia...", "Search in the Bible...")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                />
              </div>
              <Button onClick={() => handleSearch(searchQuery)}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === "reader" ? "default" : "ghost"}
              onClick={() => setActiveTab("reader")}
              className="flex-1"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {tx("Leitura", "Reading")}
            </Button>
            <Button
              variant={activeTab === "search" ? "default" : "ghost"}
              onClick={() => setActiveTab("search")}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              {tx("Pesquisar", "Search")}
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-6">
            {activeTab === "reader" && <BibleReader onAuthClick={handleAuthClick} />}
            {activeTab === "search" && <BibleSearch searchQuery={searchQuery} />}
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};

export default Bible;
