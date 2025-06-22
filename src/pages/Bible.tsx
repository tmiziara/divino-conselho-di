
import { useState } from "react";
import { Search, Bookmark, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import BibleReader from "@/components/BibleReader";
import BibleSearch from "@/components/BibleSearch";
import BibleFavorites from "@/components/BibleFavorites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const Bible = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'reader' | 'search'>('reader');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleAuthClick = () => {
    setShowAuthDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold heavenly-text mb-4">
              Bíblia Sagrada
            </h1>
            <p className="text-muted-foreground">
              Leia, pesquise e favorite versículos da Palavra de Deus
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisar na Bíblia..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                />
              </div>
              <Button onClick={() => handleSearch(searchQuery)}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'reader' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('reader')}
              className="flex-1"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Leitura
            </Button>
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Pesquisar
            </Button>
          </div>

          {/* Content */}
          <div className="bg-card rounded-lg border p-6">
            {activeTab === 'reader' && <BibleReader onAuthClick={handleAuthClick} />}
            {activeTab === 'search' && <BibleSearch searchQuery={searchQuery} />}
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};

export default Bible;
