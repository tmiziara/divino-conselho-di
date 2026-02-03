// BibleReader.tsx

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useBibleData } from "@/hooks/useBibleData";
import { useBibleProgress } from "@/hooks/useBibleProgress";
import { useBibleFavorites } from "@/hooks/useBibleFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const BOOK_NAMES_PT = {
  "gn": "Gênesis", "ex": "Êxodo", "lv": "Levítico", "nm": "Números", "dt": "Deuteronômio",
  "js": "Josué", "jz": "Juízes", "rt": "Rute", "1sm": "1 Samuel", "2sm": "2 Samuel",
  "1rs": "1 Reis", "2rs": "2 Reis", "1cr": "1 Crônicas", "2cr": "2 Crônicas",
  "ed": "Esdras", "ne": "Neemias", "et": "Ester", "jó": "Jó", "sl": "Salmos",
  "pv": "Provérbios", "ec": "Eclesiastes", "ct": "Cânticos", "is": "Isaías",
  "jr": "Jeremias", "lm": "Lamentações", "ez": "Ezequiel", "dn": "Daniel",
  "os": "Oseias", "jl": "Joel", "am": "Amós", "ob": "Obadias", "jn": "Jonas",
  "mq": "Miquéias", "na": "Naum", "hc": "Habacuque", "sf": "Sofonias",
  "ag": "Ageu", "zc": "Zacarias", "ml": "Malaquias", "mt": "Mateus",
  "mc": "Marcos", "lc": "Lucas", "jo": "João", "atos": "Atos", "rm": "Romanos",
  "1co": "1 Coríntios", "2co": "2 Coríntios", "gl": "Gálatas", "ef": "Efésios",
  "fp": "Filipenses", "cl": "Colossenses", "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo", "2tm": "2 Timóteo", "tt": "Tito", "fm": "Filemom",
  "hb": "Hebreus", "tg": "Tiago", "1pe": "1 Pedro", "2pe": "2 Pedro",
  "1jo": "1 João", "2jo": "2 João", "3jo": "3 João", "jd": "Judas", "ap": "Apocalipse"
};

const BOOK_NAMES_EN = {
  "gn": "Genesis", "ex": "Exodus", "lv": "Leviticus", "nm": "Numbers", "dt": "Deuteronomy",
  "js": "Joshua", "jz": "Judges", "rt": "Ruth", "1sm": "1 Samuel", "2sm": "2 Samuel",
  "1rs": "1 Kings", "2rs": "2 Kings", "1cr": "1 Chronicles", "2cr": "2 Chronicles",
  "ed": "Ezra", "ne": "Nehemiah", "et": "Esther", "jó": "Job", "sl": "Psalms",
  "pv": "Proverbs", "ec": "Ecclesiastes", "ct": "Song of Solomon", "is": "Isaiah",
  "jr": "Jeremiah", "lm": "Lamentations", "ez": "Ezekiel", "dn": "Daniel",
  "os": "Hosea", "jl": "Joel", "am": "Amos", "ob": "Obadiah", "jn": "Jonah",
  "mq": "Micah", "na": "Nahum", "hc": "Habakkuk", "sf": "Zephaniah",
  "ag": "Haggai", "zc": "Zechariah", "ml": "Malachi", "mt": "Matthew",
  "mc": "Mark", "lc": "Luke", "jo": "John", "atos": "Acts", "rm": "Romans",
  "1co": "1 Corinthians", "2co": "2 Corinthians", "gl": "Galatians", "ef": "Ephesians",
  "fp": "Philippians", "cl": "Colossians", "1ts": "1 Thessalonians", "2ts": "2 Thessalonians",
  "1tm": "1 Timothy", "2tm": "2 Timothy", "tt": "Titus", "fm": "Philemon",
  "hb": "Hebrews", "tg": "James", "1pe": "1 Peter", "2pe": "2 Peter",
  "1jo": "1 John", "2jo": "2 John", "3jo": "3 John", "jd": "Jude", "ap": "Revelation"
};

type BibleVersionOption = { value: string; label: string; premium: boolean };

const BIBLE_VERSIONS_PT: BibleVersionOption[] = [
  { value: "nvi", label: "NVI", premium: false },
  { value: "pt_aa", label: "AA", premium: true },
  { value: "pt_acf", label: "ACF", premium: true },
];

const BIBLE_VERSIONS_EN: BibleVersionOption[] = [
  { value: "niv", label: "NIV", premium: false },
  { value: "esv", label: "ESV", premium: true },
  { value: "nkjv", label: "NKJV", premium: true },
  { value: "nasb1995", label: "NASB95", premium: true },
];

const PREMIUM_TRIAL_KEY = "bible_premium_trial_expires_at";
const TRIAL_DURATION_HOURS = 24;

interface BibleReaderProps {
  onAuthClick?: () => void;
}

const BibleReader = ({ onAuthClick }: BibleReaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const tx = useCallback((pt: string, en: string) => (isEnglish ? en : pt), [isEnglish]);
  const bookNames = isEnglish ? BOOK_NAMES_EN : BOOK_NAMES_PT;
  const versionOptions = isEnglish ? BIBLE_VERSIONS_EN : BIBLE_VERSIONS_PT;
  const fallbackVersion = isEnglish ? "niv" : "nvi";
  const getAllowedVersion = useCallback((version?: string | null) => {
    if (!version) return fallbackVersion;
    return versionOptions.some((item) => item.value === version) ? version : fallbackVersion;
  }, [fallbackVersion, versionOptions]);
  // Phase 3: track a local 24h premium Bible trial for version selection.
  const [premiumTrialExpiresAt, setPremiumTrialExpiresAt] = useState<string | null>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<string | null>(null);
  const [bibleVersion, setBibleVersion] = useState<string>(fallbackVersion);
  const { 
    chapters, verses, selectedBook, selectedChapter, 
    setSelectedBook, setSelectedChapter,
    loadChapters, loadVerses 
  } = useBibleData(bibleVersion);
  const { saveProgress, lastPosition, hasLoaded } = useBibleProgress();
  const { favorites, addToFavorites, removeFromFavorites, loadFavorites } = useBibleFavorites();

  // Phase 3 fix: treat legacy "basic" as premium access, but do not grant access while loading.
  const hasPremiumSubscription =
    subscription.subscribed && (subscription.subscription_tier === "premium" || subscription.subscription_tier === "basic");

  const BIBLICAL_BOOKS = Object.keys(BOOK_NAMES_PT);

  useEffect(() => {
    if (!hasLoaded) return;

    if (user) {
      loadFavorites();
      if (lastPosition.book) {
        setSelectedBook(lastPosition.book);
        setSelectedChapter(lastPosition.chapter ?? 1);
        setBibleVersion(getAllowedVersion(lastPosition.version));
      } else {
        setSelectedBook("gn");
        setSelectedChapter(1);
        setBibleVersion(fallbackVersion);
      }
    } else {
      setSelectedBook("gn");
      setSelectedChapter(1);
      setBibleVersion(fallbackVersion);
    }
  }, [
    user,
    hasLoaded,
    lastPosition?.book,
    lastPosition?.chapter,
    lastPosition?.version,
    loadFavorites,
    setSelectedBook,
    setSelectedChapter,
    getAllowedVersion,
    fallbackVersion,
  ]);

  useEffect(() => {
    setBibleVersion((current) => getAllowedVersion(current));
  }, [getAllowedVersion]);

  const getTrialStorageKey = useCallback(() => {
    // Phase 3 fix: scope the trial to the current user (or guest) to avoid unintended sharing.
    const identity = user?.id || "guest";
    return `${PREMIUM_TRIAL_KEY}_${identity}`;
  }, [user?.id]);

  useEffect(() => {
    // Phase 3: restore local premium trial state for Bible versions.
    try {
      const stored = localStorage.getItem(getTrialStorageKey());
      if (stored) setPremiumTrialExpiresAt(stored);
    } catch (error) {
      // Ignore storage errors to keep the reader usable.
    }
  }, [getTrialStorageKey]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook, bibleVersion);
    }
  }, [selectedBook, bibleVersion, loadChapters]);

  const isTrialActive = useCallback(() => {
    if (!premiumTrialExpiresAt) return false;
    const expiresAt = new Date(premiumTrialExpiresAt).getTime();
    return Number.isFinite(expiresAt) && expiresAt > Date.now();
  }, [premiumTrialExpiresAt]);

  const startPremiumTrial = () => {
    const expiresAt = new Date(Date.now() + TRIAL_DURATION_HOURS * 60 * 60 * 1000).toISOString();
    try {
      localStorage.setItem(getTrialStorageKey(), expiresAt);
    } catch (error) {
      // Ignore storage errors to keep the reader usable.
    }
    setPremiumTrialExpiresAt(expiresAt);
    if (pendingVersion) {
      setBibleVersion(pendingVersion);
    }
    setPendingVersion(null);
    setShowPremiumDialog(false);
    toast({
      title: tx("Teste ativado", "Trial activated"),
      description: tx("Você liberou as versões premium por 24h.", "You unlocked premium versions for 24h."),
    });
  };

  const handleBibleVersionChange = (version: string) => {
    const selected = versionOptions.find(ver => ver.value === version);
    const canUsePremium = hasPremiumSubscription || isTrialActive();
    if (subscriptionLoading && selected?.premium) {
      // Phase 3 fix: avoid granting premium while subscription is unknown.
      toast({
        title: tx("Carregando assinatura...", "Loading subscription..."),
        description: tx("Aguarde para acessar versões premium.", "Please wait to access premium versions."),
      });
      return;
    }
    if (selected?.premium && !canUsePremium) {
      setPendingVersion(version);
      setShowPremiumDialog(true);
      return;
    }
    setBibleVersion(version);
  };

  useEffect(() => {
    // Phase 3 fix: if trial expires or subscription is removed, downgrade premium versions.
    const isPremiumVersion = versionOptions.some(ver => ver.value === bibleVersion && ver.premium);
    const canUsePremium = hasPremiumSubscription || isTrialActive();
    if (isPremiumVersion && !canUsePremium && !subscriptionLoading) {
      setBibleVersion(fallbackVersion);
      toast({
        title: tx("Versão premium expirada", "Premium version expired"),
        description: tx("Sua versão foi restaurada para a padrão.", "Your version was restored to default."),
      });
    }
  }, [bibleVersion, hasPremiumSubscription, isTrialActive, subscriptionLoading, toast, tx, versionOptions, fallbackVersion]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerses(selectedBook, selectedChapter, bibleVersion);
      saveProgress(selectedBook, selectedChapter, 1, bibleVersion);
    }
  }, [selectedBook, selectedChapter, bibleVersion, loadVerses, saveProgress]);

  const handleBookChange = (book: string) => {
    if (!user && book !== "gn") {
      toast({
        title: tx("Cadastro necessário", "Registration required"),
        description: tx("Faça seu cadastro gratuito para ler todos os livros da Bíblia", "Sign up for free to read all books of the Bible"),
        variant: "destructive"
      });
      return;
    }
    setSelectedBook(book);
    setSelectedChapter(1);
  };

  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(parseInt(chapter));
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (!selectedBook || !selectedChapter) return;
    if (direction === 'prev' && selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else if (direction === 'next' && selectedChapter < chapters.length) {
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const toggleFavorite = async (verse: any) => {
    if (!user) {
      toast({
        title: tx("Login necessário", "Login required"),
        description: tx("Faça login para salvar versículos favoritos", "Log in to save favorite verses"),
        variant: "destructive"
      });
      return;
    }

    // Usar a versão do versículo específico ou a versão global como fallback
    const version = verse.versao?.toLowerCase() || bibleVersion;
    const isFavorite = isVerseFavorite(verse, version);

    try {
      if (isFavorite) {
        await removeFromFavorites(verse.livro, verse.capitulo, verse.versiculo, version);
        toast({ title: tx("Removido dos favoritos", "Removed from favorites") });
      } else {
        await addToFavorites({
          book: verse.livro,
          chapter: verse.capitulo,
          verse: verse.versiculo,
          title: `${bookNames[verse.livro]} ${verse.capitulo}:${verse.versiculo}`,
          content: verse.texto,
          reference: `${bookNames[verse.livro]} ${verse.capitulo}:${verse.versiculo}`,
          version: version
        });
        toast({ title: tx("Adicionado aos favoritos", "Added to favorites") });
      }
    } catch (error: any) {
      toast({
        title: tx("Não foi possível salvar o favorito", "Could not save favorite"),
        description: error?.message || tx("Tente novamente.", "Please try again."),
        variant: "destructive"
      });
    }
  };

  const isVerseFavorite = (verse: any, forcedVersion?: string) => {
    // Usar a versão do versículo específico ou a versão global como fallback
    const version = forcedVersion || verse.versao?.toLowerCase() || bibleVersion;
    return favorites.some(fav =>
      fav.book === verse.livro &&
      fav.chapter === verse.capitulo &&
      fav.verse === verse.versiculo &&
      fav.version === version
    );
  };

  return (
    <div className="space-y-6">
      {/* Alerta para não logados */}
      {!user && (
        <div className="bg-muted/50 border rounded-lg p-4 text-center">
          <h3 className="font-semibold">{tx("📖 Leitura Gratuita de Gênesis", "📖 Free Genesis Reading")}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {tx("Faça seu cadastro para desbloquear todos os livros da Bíblia.", "Sign up to unlock all books of the Bible.")}
          </p>
          <Button variant="outline" size="sm" onClick={onAuthClick}>
            {tx("Fazer Cadastro Gratuito", "Sign Up for Free")}
          </Button>
        </div>
      )}

      {/* Versão da Bíblia */}
      <div className="flex justify-center">
        <Select value={bibleVersion} onValueChange={handleBibleVersionChange}>
          <SelectTrigger className="w-48 bg-card dark:bg-zinc-900">
            <SelectValue placeholder={tx("Versão da Bíblia", "Bible Version")} />
          </SelectTrigger>
          <SelectContent>
            {versionOptions.map(ver => {
              const canUsePremium = hasPremiumSubscription || isTrialActive();
              const isLocked = ver.premium && !canUsePremium;
              return (
                <SelectItem
                  key={ver.value}
                  value={ver.value}
                  className={isLocked ? "text-muted-foreground" : undefined}
                >
                  {ver.label}{isLocked ? " (Premium)" : ""}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Phase 3: contextual paywall + 24h trial for premium Bible versions */}
      <AlertDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tx("Versão premium da Bíblia", "Premium Bible version")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tx(
                "Algumas versões fazem parte do plano Premium. Você pode testar gratuitamente por 24 horas ou conhecer os planos.",
                "Some versions are part of the Premium plan. You can try them free for 24 hours or view plans."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tx("Agora não", "Not now")}</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setShowPremiumDialog(false);
                navigate('/assinatura?plan=premium');
              }}
            >
              {tx("Ver planos", "View plans")}
            </Button>
            <AlertDialogAction onClick={startPremiumTrial}>{tx("Testar 24h", "Try 24h")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Livro / Capítulo / Navegação */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Select value={selectedBook || ""} onValueChange={handleBookChange}>
          <SelectTrigger className="w-48 bg-card dark:bg-zinc-900">
            <SelectValue placeholder={tx("Selecione o livro", "Select book")} />
          </SelectTrigger>
          <SelectContent>
            {BIBLICAL_BOOKS.map(book => (
              <SelectItem key={book} value={book} disabled={!user && book !== "gn"}>
                {bookNames[book]} {!user && book !== "gn" && "🔒"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedChapter?.toString() || ""} onValueChange={handleChapterChange} disabled={!selectedBook}>
          <SelectTrigger className="w-48 bg-card dark:bg-zinc-900">
            <SelectValue placeholder={tx("Capítulo", "Chapter")} />
          </SelectTrigger>
          <SelectContent>
            {chapters.map(ch => (
              <SelectItem key={ch} value={ch.toString()}>{ch}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button onClick={() => navigateChapter('prev')} disabled={!selectedChapter || selectedChapter <= 1} className="w-12 h-10">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigateChapter('next')} disabled={!selectedChapter || selectedChapter >= chapters.length} className="w-12 h-10">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Versículos */}
      <div className="space-y-4">
        {verses.map(verse => (
          <Card key={`${verse.livro}-${verse.capitulo}-${verse.versiculo}`} className="p-4">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary w-6">{verse.versiculo}</span>
              <p className="flex-1">{verse.texto}</p>
              {user && (
                <Button variant="ghost" size="icon" onClick={() => toggleFavorite(verse)}>
                  {isVerseFavorite(verse) ? (
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  ) : (
                    <HeartOff className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BibleReader;
