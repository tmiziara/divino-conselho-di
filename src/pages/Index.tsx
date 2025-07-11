import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, BookOpen, MessageCircle, Star, Shield, Sparkles, Book, FileText, Lightbulb } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";

import { useAuth } from "@/hooks/useAuth";
import bibleStudies from "../../public/data/bible_studies.json";
import { useSubscription } from "@/hooks/useSubscription";

const studiesCount = bibleStudies.length;

const features = [
  {
    icon: MessageCircle,
    title: "Conversa Espiritual",
    description: "Converse sobre fé, receba conselhos espirituais e orações personalizadas"
  },
  {
    icon: BookOpen,
    title: "Leitura da Bíblia",
    description: "Navegue por todos os livros, capítulos e versículos com busca avançada"
  },
  {
    icon: Star,
    title: "Versículo do Dia",
    description: "Versículos inspiradores com imagens personalizadas para compartilhar"
  },
  {
    icon: Heart,
    title: "Estudos Bíblicos",
    description: `Aprofunde-se em ${studiesCount} estudos bíblicos exclusivos`
  },
];

const stats = [
  {
    icon: Book,
    value: "66",
    label: "Livros Bíblicos",
    description: "Antigo e Novo Testamento"
  },
  {
    icon: FileText,
    value: "31.102",
    label: "Versículos",
    description: "Palavras inspiradas"
  },
  {
    icon: Lightbulb,
    value: "∞",
    label: "Inspiração",
    description: "Sabedoria divina"
  },
];

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      <div className="container mx-auto px-2 pt-2 pb-4 relative flex flex-col items-center justify-start min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-4xl mx-auto w-full">
          {/* Logo/Title */}
          <div className="flex items-center justify-center mb-4 mt-2 block sm:hidden">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary mr-3" />
              <Sparkles className="w-5 h-5 text-yellow-400 absolute -top-2 -right-2" />
            </div>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">Conecte-se com o Divino através de uma experiência única de fé, oração e estudo bíblico personalizado</p>
          {/* Botões centralizados, menores e sem ocupar toda a largura */}
          <div className="flex flex-col gap-4 justify-center items-center mb-6 w-full">
            {user ? (
              <>
                <Link to="/biblia">
                  <Button className="divine-button text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explorar Bíblia
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button 
                    variant="outline" 
                    className="text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center border-primary/20 hover:bg-primary/5 gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Conversa Espiritual</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setShowAuth(true)}
                  className="divine-button text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Comece Sua Jornada
                </Button>
                <Link to="/biblia">
                  <Button 
                    variant="outline" 
                    className="text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center border-primary/20 hover:bg-primary/5"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explorar Bíblia
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 max-w-full mx-auto mb-4 px-1">
            {stats.map((stat, index) => (
              <Card key={index} className="stats-card text-center group hover:scale-105 transition-all duration-300 p-3 bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
                <CardHeader className="pb-1 p-0">
                  <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-all duration-300">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold text-primary leading-tight">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-0">
                  <CardDescription className="text-xs font-medium text-foreground mb-1 leading-tight">
                    {stat.label}
                  </CardDescription>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Section - agora como cards pequenos, logo após os stats */}
          <div className="mt-2">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold mb-1 heavenly-text">
                Recursos Espirituais
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas para fortalecer sua fé e aprofundar seu relacionamento com Deus
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-full mx-auto px-1">
              {features.map((feature, index) => (
                <Card key={index} className="stats-card text-center group hover:scale-105 transition-all duration-300 p-3 bg-card dark:bg-zinc-900 text-card-foreground dark:text-white">
                  <CardHeader className="pb-1 p-0">
                    <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-all duration-300">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <CardTitle className="text-xs font-bold text-primary leading-tight whitespace-nowrap">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 p-0">
                    <CardDescription className="text-[10px] text-foreground mb-1 leading-tight">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA para upgrade premium */}
          {(!user || (!subscriptionLoading && subscription?.subscription_tier !== "premium")) && (
            <div className="w-full flex flex-col items-center mt-6 mb-2">
              <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-blue-100 dark:from-yellow-900 dark:via-yellow-800 dark:to-blue-900 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 max-w-md w-full flex flex-col items-center shadow-md">
                <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-200 mb-1">Desbloqueie todo o conteúdo premium!</span>
                <span className="text-sm text-gray-700 dark:text-gray-200 mb-3 text-center">Tenha acesso a estudos exclusivos, recursos avançados e uma experiência sem limites.</span>
                <Button
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 dark:bg-yellow-700 dark:hover:bg-yellow-600 dark:text-yellow-100 font-bold px-8 py-3 rounded-lg shadow-lg transition-all"
                  disabled={user && !subscriptionLoading && subscription?.subscription_tier === "premium"}
                  onClick={() => {
                    if (!user) {
                      setShowAuth(true);
                    } else if (!subscriptionLoading && subscription?.subscription_tier !== "premium") {
                      navigate("/assinatura?plan=premium");
                    }
                  }}
                >
                  Quero ser Premium
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      {!user && (
        <div className="bg-primary/5 dark:bg-zinc-900 py-12">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 heavenly-text">
              Comece Sua Jornada Espiritual Hoje
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Junte-se a milhares de fiéis que já transformaram suas vidas através 
              da Palavra de Deus e da oração
            </p>
            <Button 
              onClick={() => setShowAuth(true)}
              className="divine-button text-lg px-8 py-4 min-w-[220px] h-14 flex items-center justify-center mx-auto"
            >
              <Heart className="w-5 h-5 mr-3" />
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