import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Heart, ChevronRight, Sparkles, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBibleStudies } from "@/hooks/useBibleStudies";

const Studies = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  const { studies, loading, getStudyProgress } = useBibleStudies();

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen celestial-bg">
        <Navigation onAuthClick={handleAuthClick} />
        <div className="container mx-auto px-6 py-20">
          <Card className="spiritual-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center heavenly-text">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                Estudos Bíblicos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Faça login para acessar estudos bíblicos profundos e salvar seu progresso
              </p>
              <Button className="divine-button" onClick={handleAuthClick}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen celestial-bg">
      <Navigation onAuthClick={handleAuthClick} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold heavenly-text mb-4">
            <BookOpen className="w-8 h-8 md:w-10 md:h-10 inline-block mr-3" />
            Estudos Bíblicos
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Aprofunde sua fé através de estudos bíblicos estruturados e reflexivos
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="spiritual-card">
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded animate-pulse mb-4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : studies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => {
              const progress = getStudyProgress(study.id);
              
              return (
                <Card key={study.id} className="spiritual-card group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg md:text-xl mb-2 group-hover:text-primary transition-colors">
                          {study.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {study.description}
                        </CardDescription>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progresso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {progress.completed}/{progress.total} capítulos
                        </span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{study.total_chapters} capítulos • Navegação livre</span>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-muted-foreground">Estudo Completo</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-muted-foreground">Reflexão Profunda</span>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <Link to={`/estudos/${encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, '-'))}`}>
                      <Button className="w-full divine-button group-hover:bg-primary/90 transition-colors">
                        <span>Começar Estudo</span>
                        <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="spiritual-card max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum estudo disponível</h3>
              <p className="text-muted-foreground">
                Em breve teremos estudos bíblicos incríveis para você!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informações adicionais */}
        <div className="mt-12">
          <Card className="spiritual-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Como funcionam os estudos?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Escolha o Estudo</h4>
                  <p className="text-sm text-muted-foreground">
                    Selecione um tema que fale ao seu coração
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Navegue Livremente</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesse qualquer capítulo na ordem que preferir
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Aplique na Vida</h4>
                  <p className="text-sm text-muted-foreground">
                    Reflita, ore e pratique os ensinamentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Studies; 