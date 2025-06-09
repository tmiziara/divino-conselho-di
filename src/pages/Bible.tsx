import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import BibleSidebar from "@/components/BibleSidebar";
import { SimpleBibleReader } from "@/components/SimpleBibleReader";
import { BibleSearch } from "@/components/BibleSearch";
import { useAuth } from "@/hooks/useAuth";

const Bible = () => {
  const { user } = useAuth();

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
                    <SimpleBibleReader />
                  </TabsContent>
                  
                  <TabsContent value="search" className="space-y-4">
                    <BibleSearch />
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