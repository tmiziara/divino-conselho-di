import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpen, CalendarCheck, CheckCircle2, ChevronLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReadingPlans } from "@/hooks/useReadingPlans";
import { useBibleProgress } from "@/hooks/useBibleProgress";

const ReadingPlanDetail = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const {
    plans,
    loading,
    activePlan,
    startPlan,
    completeDay,
    getDayNumberForToday,
    isDayCompleted,
    isPlanCompleted,
  } = useReadingPlans();
  const { setPreviewPosition } = useBibleProgress();

  const plan = useMemo(
    () => plans.find((candidate) => candidate.id === planId) || null,
    [plans, planId]
  );

  const isActive = activePlan?.id === plan?.id;
  const dayNumberForPlan = isActive ? getDayNumberForToday() : 1;

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={() => setShowAuth(true)} />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Carregando plano...</CardTitle>
            </CardHeader>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  const planCompleted = isPlanCompleted(plan.id);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/planos" className="text-sm text-muted-foreground flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <Card className="spiritual-card bg-card dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              {plan.title}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Badge>{plan.durationDays} dias</Badge>
            {isActive && <Badge variant="secondary">Plano ativo</Badge>}
            {planCompleted && <Badge variant="secondary">Concluído</Badge>}
            {!isActive && (
              <Button className="divine-button" onClick={() => startPlan(plan.id)}>
                Iniciar plano
              </Button>
            )}
            <p className="text-xs text-muted-foreground w-full">
              Leia o trecho do dia, reflita e marque como concluído.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {plan.items.map((item) => {
            const isCompleted = isDayCompleted(plan.id, item.dayNumber);
            const isToday = isActive && item.dayNumber === dayNumberForPlan;
            const canComplete = isActive && item.dayNumber <= dayNumberForPlan && !isCompleted;
            return (
              <Card key={item.dayNumber} className="spiritual-card bg-card dark:bg-zinc-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Dia {item.dayNumber}: {item.title}</CardTitle>
                    {isCompleted && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Concluído
                      </Badge>
                    )}
                    {isToday && !isCompleted && (
                      <Badge>Hoje</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {item.book.toUpperCase()} {item.chapter}{item.verseRange ? `:${item.verseRange}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.reflection && (
                    <p className="text-sm text-muted-foreground">{item.reflection}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Preload Bible position before opening the reader.
                        setPreviewPosition(item.book, item.chapter, 1, "nvi");
                        navigate("/biblia");
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Abrir Bíblia
                    </Button>
                    <Button
                      className="divine-button"
                      disabled={!canComplete}
                      onClick={() => completeDay(plan.id, item.dayNumber)}
                    >
                      Marcar como concluído
                    </Button>
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

export default ReadingPlanDetail;
