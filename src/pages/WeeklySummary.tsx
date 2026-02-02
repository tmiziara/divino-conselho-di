import { useState } from "react";
import { BarChart3, Flame, CalendarDays } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWeeklySummary } from "@/hooks/useWeeklySummary";

const WeeklySummary = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { summary, currentStreak, encouragement } = useWeeklySummary();

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold heavenly-text flex items-center justify-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Resumo Semanal
          </h1>
          <p className="text-muted-foreground">Sua semana de fé em números simples.</p>
        </div>

        <Card className="spiritual-card bg-card dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              Sequência atual
            </CardTitle>
            <CardDescription>{currentStreak} dias seguidos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{encouragement}</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Dias ativos</CardTitle>
              <CardDescription>{summary.rangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{summary.daysActive}</p>
            </CardContent>
          </Card>
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Capítulos lidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{summary.chaptersRead}</p>
            </CardContent>
          </Card>
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Dias de plano</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{summary.planDaysCompleted}</p>
            </CardContent>
          </Card>
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Estudos concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{summary.studiesCompleted}</p>
            </CardContent>
          </Card>
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Diário de oração</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{summary.journalEntries}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="spiritual-card bg-card dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Próximos passos
            </CardTitle>
            <CardDescription>Escolha um caminho para continuar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to="/planos">
              <Button className="divine-button">Ver planos</Button>
            </Link>
            <Link to="/diario">
              <Button variant="outline">Abrir diário</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default WeeklySummary;
