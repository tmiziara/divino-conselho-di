import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, Flame, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReadingPlans } from "@/hooks/useReadingPlans";
import { useStreaks } from "@/hooks/useStreaks";

const ReadingPlans = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { plans, loading, activePlan, startPlan, getCompletedDays, isPlanCompleted } = useReadingPlans();
  const { current, badges, badgeLabels } = useStreaks();

  const streakLabel = useMemo(() => {
    if (current <= 0) return "Comece sua constância hoje";
    if (current === 1) return "1 dia seguido";
    return `${current} dias seguidos`;
  }, [current]);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold heavenly-text flex items-center justify-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Planos de Leitura
          </h1>
          <p className="text-muted-foreground">
            Jornadas simples para manter seu hábito diário com Deus.
          </p>
        </div>

        <Card className="spiritual-card bg-card dark:bg-zinc-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              Seu ritmo
            </CardTitle>
            <CardDescription>{streakLabel}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {badges.length === 0 && (
              <span className="text-xs text-muted-foreground">
                Complete capítulos ou dias de plano para desbloquear badges.
              </span>
            )}
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {badgeLabels[badge] || badge}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {loading && (
            <Card className="spiritual-card bg-card dark:bg-zinc-900">
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          )}

          {!loading && plans.map((plan) => {
            const completedDays = getCompletedDays(plan.id).length;
            const isActive = activePlan?.id === plan.id;
            const done = isPlanCompleted(plan.id);
            return (
              <Card key={plan.id} className="spiritual-card bg-card dark:bg-zinc-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {plan.title}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {completedDays}/{plan.durationDays} dias concluídos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isActive && <Badge>Plano ativo</Badge>}
                    {done && <Badge variant="secondary">Concluído</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/plano/${plan.id}`}>
                      <Button className="divine-button">
                        {isActive ? "Continuar" : "Ver detalhes"}
                      </Button>
                    </Link>
                    {!isActive && (
                      <Button
                        variant="outline"
                        onClick={() => startPlan(plan.id)}
                      >
                        Iniciar plano
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default ReadingPlans;
