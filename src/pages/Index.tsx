import { useState, useEffect, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";

import { Heart, BookOpen, MessageCircle, Star, Shield, Sparkles, Book, FileText, Lightbulb, Bell, CalendarDays, Flame } from "lucide-react";


import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";


import Navigation from "@/components/Navigation";


import AuthDialog from "@/components/AuthDialog";





import { useAuth } from "@/hooks/useAuth";


import bibleStudies from "../../public/data/bible_studies.json";


import { useSubscription } from "@/hooks/useSubscription";

import { localContent } from "@/lib/localContent";
import { useReadingPlans } from "@/hooks/useReadingPlans";
import { useStreaks } from "@/hooks/useStreaks";




const studiesCount = bibleStudies.length;





const features = [
  {
    icon: MessageCircle,
    path: "/chat",
    titlePt: "Conversa Espiritual",
    titleEn: "Spiritual Chat",
    descriptionPt: "Converse sobre f\u00e9, receba conselhos espirituais e ora\u00e7\u00f5es personalizadas",
    descriptionEn: "Talk about faith, receive spiritual guidance, and personalized prayers",
  },
  {
    icon: BookOpen,
    path: "/biblia",
    titlePt: "Leitura da B\u00edblia",
    titleEn: "Bible Reading",
    descriptionPt: "Navegue por todos os livros, cap\u00edtulos e vers\u00edculos com busca avan\u00e7ada",
    descriptionEn: "Browse all books, chapters, and verses with advanced search",
  },
  {
    icon: Star,
    path: "/versiculo-do-dia",
    titlePt: "Vers\u00edculo do Dia",
    titleEn: "Verse of the Day",
    descriptionPt: "Vers\u00edculos inspiradores com imagens personalizadas para compartilhar",
    descriptionEn: "Inspiring verses with personalized images to share",
  },
  {
    icon: Heart,
    path: "/estudos",
    titlePt: "Estudos B\u00edblicos",
    titleEn: "Bible Studies",
    descriptionPt: `Aprofunde-se em ${studiesCount} estudos b\u00edblicos exclusivos`,
    descriptionEn: `Go deeper with ${studiesCount} exclusive Bible studies`,
  },
  {
    icon: Heart,
    path: "/favoritos",
    titlePt: "Favoritos",
    titleEn: "Favorites",
    descriptionPt: "Acesse seus vers\u00edculos e estudos favoritos salvos",
    descriptionEn: "Access your saved favorite verses and studies",
  },
  {
    icon: Bell,
    path: "/notificacoes",
    titlePt: "Notifica\u00e7\u00f5es",
    titleEn: "Notifications",
    descriptionPt: "Configure e gerencie suas notifica\u00e7\u00f5es espirituais",
    descriptionEn: "Set up and manage your spiritual reminders",
  },
];

const stats = [
  {
    icon: Book,
    value: "66",
    labelPt: "Livros B\u00edblicos",
    labelEn: "Bible Books",
    descriptionPt: "Antigo e Novo Testamento",
    descriptionEn: "Old and New Testament",
  },
  {
    icon: FileText,
    value: "31.102",
    labelPt: "Vers\u00edculos",
    labelEn: "Verses",
    descriptionPt: "Palavras inspiradas",
    descriptionEn: "Inspired words",
  },
  {
    icon: Lightbulb,
    value: "\u221e",
    labelPt: "Inspira\u00e7\u00e3o",
    labelEn: "Inspiration",
    descriptionPt: "Sabedoria divina",
    descriptionEn: "Divine wisdom",
  },
];

const Index = () => {

  const [showAuth, setShowAuth] = useState(false);

  const { user } = useAuth();

  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { activePlan, getTodayPlanItem, isPlanCompleted } = useReadingPlans();
  const { current: currentStreak } = useStreaks();
  const { isEnglish } = useLanguage();

  const navigate = useNavigate();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const [showOnboarding, setShowOnboarding] = useState(false);

  const [onboardingTime, setOnboardingTime] = useState("08:00");

  const [onboardingInterest, setOnboardingInterest] = useState("paz");

  const [onboardingPace, setOnboardingPace] = useState("medio");

  const [continueReadingLabel, setContinueReadingLabel] = useState<string | null>(null);

  const [resumeStudyLink, setResumeStudyLink] = useState<string | null>(null);

  const [resumeStudyLabel, setResumeStudyLabel] = useState<string | null>(null);

  const [showNotificationGuide, setShowNotificationGuide] = useState(false);



  // Local keys for Phase 1 onboarding/loop

  const ONBOARDING_KEY = "onboarding_v1";

  const BIBLE_PROGRESS_KEY = "bible_reading_position";

  // Phase 2: track guided notification setup prompt state.

  const NOTIFICATION_GUIDE_KEY = "notification_guided_v1";

  const NOTIFICATION_GUIDE_DISMISSED_KEY = "notification_guided_dismissed_v1";



  const safeStorageGet = (key: string) => {

    try {

      return localStorage.getItem(key);

    } catch (error) {

      return null;

    }

  };



  const safeStorageSet = (key: string, value: string) => {

    try {

      localStorage.setItem(key, value);

    } catch (error) {

      // Ignore storage errors to keep UI functional

    }

  };



  // Small helper to keep UI labels readable

  const BOOK_NAMES = useMemo<Record<string, string>>(() => ({

    gn: "Gênesis",

    ex: "Êxodo",

    lv: "Levítico",

    nm: "Números",

    dt: "Deuteronômio",

    js: "Josué",

    jz: "Juízes",

    rt: "Rute",

    "1sm": "1 Samuel",

    "2sm": "2 Samuel",

    "1rs": "1 Reis",

    "2rs": "2 Reis",

    "1cr": "1 Crônicas",

    "2cr": "2 Crônicas",

    ed: "Esdras",

    ne: "Neemias",

    et: "Ester",

    "jó": "Jó",

    sl: "Salmos",

    pv: "Provérbios",

    ec: "Eclesiastes",

    ct: "Cânticos",

    is: "Isaías",

    jr: "Jeremias",

    lm: "Lamentações",

    ez: "Ezequiel",

    dn: "Daniel",

    os: "Oseias",

    jl: "Joel",

    am: "Amós",

    ob: "Obadias",

    jn: "Jonas",

    mq: "Miquéias",

    na: "Naum",

    hc: "Habacuque",

    sf: "Sofonias",

    ag: "Ageu",

    zc: "Zacarias",

    ml: "Malaquias",

    mt: "Mateus",

    mc: "Marcos",

    lc: "Lucas",

    jo: "João",

    atos: "Atos",

    rm: "Romanos",

    "1co": "1 Coríntios",

    "2co": "2 Coríntios",

    gl: "Gálatas",

    ef: "Efésios",

    fp: "Filipenses",

    cl: "Colossenses",

    "1ts": "1 Tessalonicenses",

    "2ts": "2 Tessalonicenses",

    "1tm": "1 Timóteo",

    "2tm": "2 Timóteo",

    tt: "Tito",

    fm: "Filemom",

    hb: "Hebreus",

    tg: "Tiago",

    "1pe": "1 Pedro",

    "2pe": "2 Pedro",

    "1jo": "1 João",

    "2jo": "2 João",

    "3jo": "3 João",

    jd: "Judas",

    ap: "Apocalipse",

  }), []);



  useEffect(() => {

    // Phase 1: show lightweight onboarding once

    const stored = safeStorageGet(ONBOARDING_KEY);

    if (!stored) {

      setShowOnboarding(true);

    }

  }, []);

  const evaluateNotificationGuide = useCallback(() => {

    if (showOnboarding) return;

    const guide = safeStorageGet(NOTIFICATION_GUIDE_KEY);

    const dismissed = safeStorageGet(NOTIFICATION_GUIDE_DISMISSED_KEY);

    if (!guide || dismissed) return;



    try {

      const schedules = JSON.parse(safeStorageGet("notification_schedules") || "[]");

      const prayerSchedules = JSON.parse(safeStorageGet("prayer_schedules") || "[]");

      const hasSchedules = (Array.isArray(schedules) && schedules.length > 0)

        || (Array.isArray(prayerSchedules) && prayerSchedules.length > 0);

      setShowNotificationGuide(!hasSchedules);

    } catch (error) {

      // Ignore malformed schedule data and keep the prompt visible.

      setShowNotificationGuide(true);

    }

  }, [showOnboarding]);



  useEffect(() => {

    // Phase 2: show guided notification setup if onboarding was completed and no schedules exist.

    evaluateNotificationGuide();



    const handleVisibility = () => {

      if (document.visibilityState === "visible") {

        evaluateNotificationGuide();

      }

    };



    window.addEventListener("focus", evaluateNotificationGuide);

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {

      window.removeEventListener("focus", evaluateNotificationGuide);

      document.removeEventListener("visibilitychange", handleVisibility);

    };

  }, [evaluateNotificationGuide]);



  useEffect(() => {

    // Phase 1: build “Continue reading” label from last Bible position

    try {

      const stored = safeStorageGet(BIBLE_PROGRESS_KEY);

      if (stored) {

        const parsed = JSON.parse(stored);

        const bookLabel = BOOK_NAMES[parsed.book] || parsed.book;

        if (bookLabel && parsed.chapter) {

          setContinueReadingLabel(`${bookLabel} ${parsed.chapter}`);

        }

      }

    } catch (error) {

      // Ignore parsing errors to keep home stable

    }

  }, [BOOK_NAMES]);


  useEffect(() => {

    // Phase 1: attempt to resume last completed study chapter (local only)

    const loadResumeStudy = async () => {

      if (!user) return;

      try {

        const progressRaw = safeStorageGet(`progress_${user.id}`);

        if (!progressRaw) return;

        const progress = JSON.parse(progressRaw) as Array<{ study_id: string; chapter_id: string; completed_at?: string }>;

        if (!progress || progress.length === 0) return;

        if (!Array.isArray(progress)) {

          safeStorageSet(`progress_${user.id}`, "[]");

          return;

        }



        // Pick most recent completion

        const sorted = [...progress].sort((a, b) => {

          const aTime = a.completed_at ? new Date(a.completed_at).getTime() : 0;

          const bTime = b.completed_at ? new Date(b.completed_at).getTime() : 0;

          return bTime - aTime;

        });



        const latest = sorted[0];

        const study = await localContent.getStudyById(latest.study_id);

        if (!study) return;

        const chapters = await localContent.getChaptersByStudyId(latest.study_id);

        const chapter = chapters.find((ch) => ch.id === latest.chapter_id);

        if (!chapter) return;




        const shortTitle = study.title.length > 20 ? `${study.title.slice(0, 20)}...` : study.title;
        const nextChapterNumber = chapter.chapter_number + 1;
        const nextChapter = chapters.find((ch) => ch.chapter_number === nextChapterNumber);

        if (nextChapter) {
          setResumeStudyLabel(`${shortTitle} • Cap. ${nextChapterNumber}`);
          setResumeStudyLink(`/estudo/${study.slug || encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, "-"))}/capitulo/${nextChapterNumber}`);
        } else {
          setResumeStudyLabel(shortTitle);
          setResumeStudyLink(`/estudo/${study.slug || encodeURIComponent(study.title.toLowerCase().replace(/\s+/g, "-"))}`);
        }
      }
      catch (error) {

        // Keep home safe if local data is malformed

        safeStorageSet(`progress_${user.id}`, "[]");

      }

    };



    loadResumeStudy();

  }, [user]);



  const handleOnboardingSave = () => {

    // Phase 1: save onboarding preferences locally (no backend changes)

    const payload = {

      time: onboardingTime,

      interest: onboardingInterest,

      pace: onboardingPace,

      savedAt: new Date().toISOString(),

    };

    safeStorageSet(ONBOARDING_KEY, JSON.stringify(payload));

    // Phase 2: trigger guided notification setup after onboarding.

    safeStorageSet(NOTIFICATION_GUIDE_KEY, JSON.stringify({ source: "onboarding", savedAt: new Date().toISOString() }));

    setShowOnboarding(false);

    evaluateNotificationGuide();


  };



  const handleOnboardingSkip = () => {

    // Phase 1: allow safe skip and avoid re-showing

    safeStorageSet(ONBOARDING_KEY, JSON.stringify({ skipped: true, savedAt: new Date().toISOString() }));

    // Phase 2: still offer guided notification setup after skip.

    safeStorageSet(NOTIFICATION_GUIDE_KEY, JSON.stringify({ source: "onboarding-skip", savedAt: new Date().toISOString() }));

    setShowOnboarding(false);

    evaluateNotificationGuide();


  };




  const todayPlanItem = activePlan ? getTodayPlanItem(activePlan.id) : null;
  const streakLabel = currentStreak > 0
    ? tx(`${currentStreak} dias seguidos`, `${currentStreak} day streak`)
    : tx("Comece sua constância", "Start your consistency");
  const planCompleted = activePlan ? isPlanCompleted(activePlan.id) : false;

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


          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed">
            {tx("Conecte-se com o Divino atrav\u00e9s de uma experi\u00eancia \u00fanica de f\u00e9, ora\u00e7\u00e3o e estudo b\u00edblico personalizado", "Connect with the Divine through a unique journey of faith, prayer, and personalized Bible study")}
          </p>


          {/* Botões centralizados, menores e sem ocupar toda a largura */}


          <div className="flex flex-col gap-4 justify-center items-center mb-6 w-full">


            {user ? (


              <>


                <Link to="/biblia">


                  <Button className="divine-button text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center">


                    <BookOpen className="w-5 h-5 mr-2" />


                    {tx("Explorar B\u00edblia", "Explore Bible")}


                  </Button>


                </Link>


                <Link to="/chat">


                  <Button


                    variant="outline"


                    className="text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center border-primary/20 hover:bg-primary/5 gap-2"


                  >


                    <MessageCircle className="w-5 h-5" />


                    <span>{tx("Conversa Espiritual", "Spiritual Chat")}</span>


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


                  {tx("Comece Sua Jornada", "Start Your Journey")}


                </Button>


                <Link to="/biblia">


                  <Button


                    variant="outline"


                    className="text-lg px-8 py-3 w-60 h-14 mx-auto flex items-center justify-center border-primary/20 hover:bg-primary/5"


                  >


                    <BookOpen className="w-5 h-5 mr-2" />


                    {tx("Explorar B\u00edblia", "Explore Bible")}


                  </Button>


                </Link>


              </>


            )}


          </div>





          {/* Phase 1: Daily Home panel */}
          <div className="w-full max-w-3xl mx-auto mb-6">
            <Card className="spiritual-card border border-blue-100/70 bg-gradient-to-b from-blue-50/80 to-white shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  {tx("Seu dia com Deus", "Your day with God")}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-blue-700/80 dark:text-blue-200/60">
                  {tx("Tr\u00eas passos simples para manter o h\u00e1bito di\u00e1rio", "Three simple steps to keep your daily habit")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                {/* Versículo do Dia */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-4 px-4 bg-white/60 dark:bg-zinc-900/40 hover:bg-white/90 dark:hover:bg-zinc-800/60 border border-blue-100 dark:border-zinc-800/50 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/30"
                  onClick={() => navigate("/versiculo-do-dia")}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-200/50 dark:group-hover:bg-blue-800/30 transition-colors">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-semibold text-sm text-foreground">{tx("Vers\u00edculo do Dia", "Verse of the Day")}</span>
                      <span className="text-xs text-muted-foreground">{tx("Palavra di\u00e1ria de inspira\u00e7\u00e3o", "Daily word of inspiration")}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    {tx("Ler", "Read")}
                  </span>
                </Button>

                {/* {tx("Continuar Leitura", "Continue Reading")} */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-4 px-4 bg-white/60 dark:bg-zinc-900/40 hover:bg-white/90 dark:hover:bg-zinc-800/60 border border-blue-100 dark:border-zinc-800/50 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/30"
                  onClick={() => navigate("/biblia")}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-200/50 dark:group-hover:bg-emerald-800/30 transition-colors flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-sm text-foreground truncate w-full text-left">
                        {continueReadingLabel || tx("Continuar Leitura", "Continue Reading")}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {continueReadingLabel ? tx("Continue de onde parou", "Pick up where you left off") : tx("Inicie sua leitura b\u00edblica", "Start your Bible reading")}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors flex-shrink-0">
                    {tx("Abrir", "Open")}
                  </span>
                </Button>

                {/* Retomar Estudo */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-4 px-4 bg-white/60 dark:bg-zinc-900/40 hover:bg-white/90 dark:hover:bg-zinc-800/60 border border-blue-100 dark:border-zinc-800/50 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/30"
                  onClick={() => navigate(resumeStudyLink || "/estudos")}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-purple-100/50 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-200/50 dark:group-hover:bg-purple-800/30 transition-colors flex-shrink-0">
                      <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1 pr-2">
                      <span className="font-semibold text-sm text-foreground truncate w-full text-left" title={resumeStudyLabel || tx("Estudos B\u00edblicos", "Bible Studies")}>
                        {resumeStudyLabel || tx("Estudos B\u00edblicos", "Bible Studies")}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {resumeStudyLabel ? tx("Continue seu aprendizado", "Keep learning") : tx("Explore novos temas", "Explore new topics")}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors flex-shrink-0">
                    {tx("Estudar", "Study")}
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Phase 6: Daily plan + streak preview */}
          <div className="w-full max-w-3xl mx-auto mb-6">
            <Card className="spiritual-card border border-amber-100/70 bg-gradient-to-b from-amber-50/70 to-white shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                  {tx("Plano do dia", "Plan of the day")}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-amber-700/80 dark:text-amber-200/60 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {streakLabel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activePlan && todayPlanItem ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {activePlan.title}
                      </Badge>
                      <Badge>{tx(`Dia ${todayPlanItem.dayNumber}`, `Day ${todayPlanItem.dayNumber}`)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {todayPlanItem.item.title} · {todayPlanItem.item.book.toUpperCase()} {todayPlanItem.item.chapter}
                      {todayPlanItem.item.verseRange ? `:${todayPlanItem.item.verseRange}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/plano/${activePlan.id}`}>
                        <Button className="divine-button">{tx("Continuar plano", "Continue plan")}</Button>
                      </Link>
                      <Link to="/resumo-semanal">
                        <Button variant="outline">{tx("Ver resumo semanal", "View weekly summary")}</Button>
                      </Link>
                    </div>
                  </div>
                ) : activePlan ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{activePlan.title}</Badge>
                      {planCompleted && <Badge variant="secondary">{tx("Conclu\u00eddo", "Completed")}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {planCompleted
                        ? tx("Plano conclu\u00eddo. Revise o conte\u00fado ou escolha um novo plano.", "Plan completed. Review the content or choose a new plan.")
                        : tx("Seu plano ativo passou da data prevista. Conclua os dias pendentes no detalhe do plano.", "Your active plan passed the expected date. Finish pending days in the plan details.")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/plano/${activePlan.id}`}>
                        <Button className="divine-button">{tx("Ver plano", "View plan")}</Button>
                      </Link>
                      <Link to="/planos">
                        <Button variant="outline">{tx("Ver planos", "View plans")}</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">
                      {tx("Escolha um plano curto para criar const\u00e2ncia di\u00e1ria.", "Pick a short plan to build daily consistency.")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/planos">
                        <Button className="divine-button">{tx("Ver planos", "View plans")}</Button>
                      </Link>
                      <Link to="/resumo-semanal">
                        <Button variant="outline">{tx("Ver resumo semanal", "View weekly summary")}</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Phase 1: Lightweight onboarding prompts (local only) */}

          {showOnboarding && (

            <div className="w-full max-w-3xl mx-auto mb-6">

              <Card className="spiritual-card bg-card dark:bg-zinc-900">

                <CardHeader>

                  <CardTitle className="text-lg">{tx("Personalize seu h\u00e1bito", "Personalize your routine")}</CardTitle>

                  <CardDescription>

                    {tx("Responda 3 perguntas r\u00e1pidas para melhorar suas recomenda\u00e7\u00f5es", "Answer 3 quick questions to improve your recommendations")}

                  </CardDescription>

                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="flex flex-col gap-2">

                    <label className="text-sm font-medium">{tx("Melhor hor\u00e1rio para lembrar voc\u00ea", "Best time to remind you")}</label>

                    <Input

                      type="time"

                      value={onboardingTime}

                      onChange={(e) => setOnboardingTime(e.target.value)}

                    />

                  </div>

                  <div className="flex flex-col gap-2">

                    <label className="text-sm font-medium">{tx("Tema que mais precisa hoje", "Topic you need the most today")}</label>

                    <select

                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"

                      value={onboardingInterest}

                      onChange={(e) => setOnboardingInterest(e.target.value)}

                    >

                      <option value="paz">{tx("Paz", "Peace")}</option>

                      <option value="ansiedade">{tx("Ansiedade", "Anxiety")}</option>

                      <option value="relacionamentos">{tx("Relacionamentos", "Relationships")}</option>

                      <option value="proposito">{tx("Prop\u00f3sito", "Purpose")}</option>

                      <option value="fe">{tx("F\u00e9", "Faith")}</option>

                    </select>

                  </div>

                  <div className="flex flex-col gap-2">

                    <label className="text-sm font-medium">{tx("Seu ritmo de leitura", "Your reading pace")}</label>

                    <select

                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"

                      value={onboardingPace}

                      onChange={(e) => setOnboardingPace(e.target.value)}

                    >

                      <option value="leve">{tx("Leve (5 min)", "Light (5 min)")}</option>

                      <option value="medio">{tx("M\u00e9dio (10 min)", "Medium (10 min)")}</option>

                      <option value="profundo">{tx("Profundo (15+ min)", "Deep (15+ min)")}</option>

                    </select>

                  </div>

                  <div className="flex gap-2">

                    <Button className="flex-1" onClick={handleOnboardingSave}>

                      {tx("Salvar prefer\u00eancias", "Save preferences")}

                    </Button>

                    <Button variant="outline" onClick={handleOnboardingSkip}>

                      {tx("Pular", "Skip")}

                    </Button>

                  </div>

                </CardContent>

              </Card>

            </div>

          )}





          {/* Phase 2: Guided notification setup prompt after onboarding */}

          {showNotificationGuide && (

            <div className="w-full max-w-3xl mx-auto mb-6">

              <Card className="spiritual-card bg-card dark:bg-zinc-900">

                <CardHeader>

                  <CardTitle className="text-lg">{tx("Ative lembretes di\u00e1rios", "Enable daily reminders")}</CardTitle>

                  <CardDescription>

                    {tx("Configure um hor\u00e1rio e tema em 30 segundos.", "Set a time and theme in 30 seconds.")}

                  </CardDescription>

                </CardHeader>

                <CardContent className="flex flex-col sm:flex-row gap-2">

                  <Button

                    className="flex-1"

                    onClick={() => {


                      safeStorageSet(NOTIFICATION_GUIDE_DISMISSED_KEY, "dismissed");


                      setShowNotificationGuide(false);


                      navigate("/notificacoes?guided=1&source=onboarding");


                    }}

                  >

                    {tx("Configurar lembretes", "Set reminders")}

                  </Button>

                  <Button

                    variant="outline"

                    onClick={() => {

                      safeStorageSet(NOTIFICATION_GUIDE_DISMISSED_KEY, "dismissed");

                      setShowNotificationGuide(false);

                    }}

                  >

                    {tx("Agora n\u00e3o", "Not now")}

                  </Button>

                </CardContent>

              </Card>

            </div>

          )}





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


                    {tx(stat.labelPt, stat.labelEn)}


                  </CardDescription>


                  <p className="text-[10px] text-muted-foreground leading-tight">


                    {tx(stat.descriptionPt, stat.descriptionEn)}


                  </p>


                </CardContent>


              </Card>


            ))}


          </div>





          {/* Features Section - agora como cards pequenos, logo após os stats */}


          <div className="mt-2">


            <div className="text-center mb-2">


              <h2 className="text-2xl font-bold mb-1 heavenly-text">


                {tx("Recursos Espirituais", "Spiritual Resources")}


              </h2>


              <p className="text-base text-muted-foreground max-w-2xl mx-auto">


                {tx("Ferramentas poderosas para fortalecer sua f\u00e9 e aprofundar seu relacionamento com Deus", "Powerful tools to strengthen your faith and deepen your relationship with God")}


              </p>


            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-full mx-auto px-1">


              {features.map((feature, index) => (


                <Link key={index} to={feature.path}>


                  <Card className="stats-card text-center group hover:scale-105 transition-all duration-300 p-3 bg-card dark:bg-zinc-900 text-card-foreground dark:text-white cursor-pointer">


                    <CardHeader className="pb-1 p-0">


                      <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-all duration-300">


                        <feature.icon className="w-4 h-4 text-primary" />


                      </div>


                      <CardTitle className="text-xs font-bold text-primary leading-tight whitespace-nowrap">{tx(feature.titlePt, feature.titleEn)}</CardTitle>


                    </CardHeader>


                    <CardContent className="pt-0 p-0">


                      <CardDescription className="text-[10px] text-foreground mb-1 leading-tight">


                        {tx(feature.descriptionPt, feature.descriptionEn)}


                      </CardDescription>


                    </CardContent>


                  </Card>


                </Link>


              ))}


            </div>


          </div>





          {/* CTA para upgrade premium */}


          {(!user || (!subscriptionLoading && subscription?.subscription_tier !== "premium")) && (


            <div className="w-full flex flex-col items-center mt-6 mb-2">


              <div className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-blue-100 dark:from-yellow-900 dark:via-yellow-800 dark:to-blue-900 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 max-w-md w-full flex flex-col items-center shadow-md">


                <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-200 mb-1">{tx("Desbloqueie todo o conte\u00fado premium!", "Unlock all premium content!")}</span>


                <span className="text-sm text-gray-700 dark:text-gray-200 mb-3 text-center">{tx("Tenha acesso a estudos exclusivos, recursos avan\u00e7ados e uma experi\u00eancia sem limites.", "Get access to exclusive studies, advanced features, and an unlimited experience.")}</span>


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


                  {tx("Quero ser Premium", "I want Premium")}


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


              {tx("Comece Sua Jornada Espiritual Hoje", "Start Your Spiritual Journey Today")}


            </h2>


            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">


              {tx("Junte-se a milhares de fi\u00e9is que j\u00e1 transformaram suas vidas atrav\u00e9s", "Join thousands of believers who have already transformed their lives through")}


              {tx("da Palavra de Deus e da ora\u00e7\u00e3o", "the Word of God and prayer")}


            </p>


            <Button


              onClick={() => setShowAuth(true)}


              className="divine-button text-lg px-8 py-4 min-w-[220px] h-14 flex items-center justify-center mx-auto"


            >


              <Heart className="w-5 h-5 mr-3" />


              {tx("Iniciar Gratuitamente", "Start for Free")}


            </Button>


          </div>


        </div>


      )}





      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />


    </div>


  );


};





export default Index;































