import { useState } from "react";
import { Link } from "react-router-dom";
import { NotebookPen, PlusCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrayerJournal } from "@/hooks/usePrayerJournal";
import { useLanguage } from "@/hooks/useLanguage";

const PrayerJournalList = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { entries } = usePrayerJournal();
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);
  const dateLocale = isEnglish ? "en-US" : "pt-BR";

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold heavenly-text flex items-center gap-2">
              <NotebookPen className="w-6 h-6 text-primary" />
              {tx("Diário de oração", "Prayer Journal")}
            </h1>
            <p className="text-muted-foreground">{tx("Guarde suas orações e reflexões.", "Keep your prayers and reflections.")}</p>
          </div>
          <Link to="/diario/nova">
            <Button className="divine-button">
              <PlusCircle className="w-4 h-4 mr-2" />
              {tx("Nova oração", "New prayer")}
            </Button>
          </Link>
        </div>

        {entries.length === 0 ? (
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>{tx("Nenhuma oração registrada", "No prayer entries yet")}</CardTitle>
              <CardDescription>
                {tx("Comece com uma oração simples e volte quando precisar.", "Start with a simple prayer and come back whenever you need.")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/diario/nova">
                <Button className="divine-button">{tx("Criar primeira oração", "Create first prayer")}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {entries.map((entry) => (
              <Link key={entry.id} to={`/diario/${entry.id}`}>
                <Card className="spiritual-card bg-card dark:bg-zinc-900 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <CardDescription>
                      {new Date(entry.createdAt).toLocaleDateString(dateLocale)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {entry.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default PrayerJournalList;
