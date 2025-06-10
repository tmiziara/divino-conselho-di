import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BookOpen, MessageCircle, Star, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";

import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();

  const features = [
    {
      icon: MessageCircle,
      title: "Canal de Conversa Espiritual",
      description: "Converse sobre fé, receba conselhos espirituais e orações personalizadas"
    },
    {
      icon: BookOpen,
      title: "Leitura da Bíblia",
      description: "Navegue por todos os livros, capítulos e versículos com busca avançada"
    },
    {
      icon: Heart,
      title: "Seus Favoritos",
      description: "Salve versículos, salmos e mensagens importantes para você"
    },
  ];

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-primary/10 rounded-full blur-lg animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo/Title */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Shield className="w-16 h-16 text-primary mr-4" />
                <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold heavenly-text">
                Conexão com Deus
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Conecte-se com o Divino através de uma experiência única de fé, 
              oração e estudo bíblico personalizado
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <>
                  <Link to="/biblia">
                    <Button className="divine-button text-lg px-8 py-4">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Explorar Bíblia
                    </Button>
                  </Link>
                  <Link to="/conversa">
                    <Button 
                      variant="outline" 
                      className="text-lg px-8 py-4 border-primary/20 hover:bg-primary/5"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Conversa Espiritual
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setShowAuth(true)}
                    className="divine-button text-lg px-8 py-4"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Comece Sua Jornada
                  </Button>
                  <Link to="/biblia">
                    <Button 
                      variant="outline" 
                      className="text-lg px-8 py-4 border-primary/20 hover:bg-primary/5"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Explorar Bíblia
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">66</div>
                <div className="text-sm text-muted-foreground">Livros Bíblicos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">31.102</div>
                <div className="text-sm text-muted-foreground">Versículos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Inspiração</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 heavenly-text">
            Recursos Espirituais
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas para fortalecer sua fé e aprofundar seu relacionamento com Deus
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="spiritual-card group cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>


      {/* Call to Action */}
      {!user && (
        <div className="bg-primary/5 py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4 heavenly-text">
              Comece Sua Jornada Espiritual Hoje
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de fiéis que já transformaram suas vidas através 
              da Palavra de Deus e da oração
            </p>
            <Button 
              onClick={() => setShowAuth(true)}
              className="divine-button text-lg px-8 py-4"
            >
              <Heart className="w-5 h-5 mr-2" />
              Iniciar Gratuitamente
            </Button>
          </div>
        </div>
      )}

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Index;