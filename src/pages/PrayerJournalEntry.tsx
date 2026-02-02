import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrayerJournal } from "@/hooks/usePrayerJournal";

const PrayerJournalEntry = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { getEntryById, updateEntry, deleteEntry } = usePrayerJournal();
  const entry = entryId ? getEntryById(entryId) : null;

  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");

  useEffect(() => {
    if (!entry) return;
    setTitle(entry.title);
    setContent(entry.content);
  }, [entry]);

  if (!entry) {
    return (
      <div className="min-h-screen bg-background dark:bg-background">
        <Navigation onAuthClick={() => setShowAuth(true)} />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <Card className="spiritual-card bg-card dark:bg-zinc-900">
            <CardHeader>
              <CardTitle>Oração não encontrada</CardTitle>
              <CardDescription>Volte ao diário para criar uma nova.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/diario">
                <Button className="divine-button">Voltar ao diário</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={() => setShowAuth(true)} />
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link to="/diario" className="text-sm text-muted-foreground flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Voltar ao diário
        </Link>

        <Card className="spiritual-card bg-card dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>{entry.title}</CardTitle>
            <CardDescription>
              {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Oração / reflexão</label>
              <Textarea
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="divine-button"
                disabled={!title.trim() || !content.trim()}
                onClick={() => {
                  updateEntry(entry.id, { title: title.trim(), content: content.trim() });
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  deleteEntry(entry.id);
                  navigate("/diario");
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default PrayerJournalEntry;
