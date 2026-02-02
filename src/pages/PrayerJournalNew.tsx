import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NotebookPen, ChevronLeft, Save } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePrayerJournal } from "@/hooks/usePrayerJournal";

const PrayerJournalNew = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { prompts, createEntry } = usePrayerJournal();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [promptId, setPromptId] = useState("");

  const selectedPrompt = prompts.find((prompt) => prompt.id === promptId);

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
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="w-5 h-5 text-primary" />
              Nova oração
            </CardTitle>
            <CardDescription>Escreva com liberdade. Isso fica apenas no seu aparelho.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                placeholder="Ex: Gratidão pela semana"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tema de oração (opcional)</label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={promptId}
                onChange={(event) => setPromptId(event.target.value)}
              >
                <option value="">Sem tema</option>
                {prompts.map((prompt) => (
                  <option key={prompt.id} value={prompt.id}>
                    {prompt.label}
                  </option>
                ))}
              </select>
              {selectedPrompt && (
                <p className="text-xs text-muted-foreground">{selectedPrompt.label}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Oração / reflexão</label>
              <Textarea
                rows={6}
                placeholder="Escreva sua oração aqui..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </div>
            <Button
              className="divine-button"
              disabled={!title.trim() || !content.trim()}
              onClick={() => {
                const entry = createEntry({
                  title: title.trim(),
                  content: content.trim(),
                  promptId: promptId || undefined,
                });
                // Save entry locally and open the detail view.
                navigate(`/diario/${entry.id}`);
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar oração
            </Button>
          </CardContent>
        </Card>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default PrayerJournalNew;
