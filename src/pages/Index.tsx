import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Heart, BookOpen, MessageCircle, Star, Shield, Sparkles, Book, FileText, Lightbulb, Bell } from "lucide-react";


import { Link, useNavigate } from "react-router-dom";


import Navigation from "@/components/Navigation";


import AuthDialog from "@/components/AuthDialog";





import { useAuth } from "@/hooks/useAuth";


import bibleStudies from "../../public/data/bible_studies.json";


import { useSubscription } from "@/hooks/useSubscription";

import { localContent } from "@/lib/localContent";




const studiesCount = bibleStudies.length;





const features = [


  {


    icon: MessageCircle,


    title: "Conversa Espiritual",


    description: "Converse sobre fé, receba conselhos espirituais e orações personalizadas",


    path: "/chat"


  },


  {


    icon: BookOpen,


    title: "Leitura da Bíblia",


    description: "Navegue por todos os livros, capítulos e versículos com busca avançada",


    path: "/biblia"


  },


  {


    icon: Star,


    title: "Versículo do Dia",


    description: "Versículos inspiradores com imagens personalizadas para compartilhar",


    path: "/versiculo-do-dia"


  },


  {


    icon: Heart,


    title: "Estudos Bíblicos",


    description: `Aprofunde-se em ${studiesCount} estudos bíblicos exclusivos`,


    path: "/estudos"


  },


  {


    icon: Heart,


    title: "Favoritos",


    description: "Acesse seus versículos e estudos favoritos salvos",


    path: "/favoritos"


  },


  {


    icon: Bell,


    title: "Notificações",


    description: "Configure e gerencie suas notificações espirituais",


    path: "/notificacoes"


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

  const BOOK_NAMES: Record<string, string> = {

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

  };



  useEffect(() => {

    // Phase 1: show lightweight onboarding once

    const stored = safeStorageGet(ONBOARDING_KEY);

    if (!stored) {

      setShowOnboarding(true);

    }

  }, []);

  const evaluateNotificationGuide = () => {

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

  };



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

  }, [showOnboarding]);



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

  }, []);


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





          {/* Phase 1: Daily Home panel */}
          <div className="w-full max-w-3xl mx-auto mb-6">
            <Card className="spiritual-card border border-blue-100/70 bg-gradient-to-b from-blue-50/80 to-white shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Seu dia com Deus
                </CardTitle>
                <CardDescription className="text-sm font-medium text-blue-700/80 dark:text-blue-200/60">
                  Três passos simples para manter o hábito diário
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
                      <span className="font-semibold text-sm text-foreground">Versículo do Dia</span>
                      <span className="text-xs text-muted-foreground">Palavra diária de inspiração</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    Ler
                  </span>
                </Button>

                {/* Continuar Leitura */}
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
                        {continueReadingLabel || "Continuar Leitura"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {continueReadingLabel ? "Continue de onde parou" : "Inicie sua leitura bíblica"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors flex-shrink-0">
                    Abrir
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
                      <span className="font-semibold text-sm text-foreground truncate w-full text-left" title={resumeStudyLabel || "Estudos Bíblicos"}>
                        {resumeStudyLabel || "Estudos Bíblicos"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {resumeStudyLabel ? "Continue seu aprendizado" : "Explore novos temas"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors flex-shrink-0">
                    Estudar
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Phase 1: Lightweight onboarding prompts (local only) */}

          {showOnboarding && (

            <div className="w-full max-w-3xl mx-auto mb-6">

              <Card className="spiritual-card bg-card dark:bg-zinc-900">

                <CardHeader>

                  <CardTitle className="text-lg">Personalize seu hábito</CardTitle>

                  <CardDescription>

                    Responda 3 perguntas rápidas para melhorar suas recomendações

                  </CardDescription>

                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="flex flex-col gap-2">

                    <label className="text-sm font-medium">Melhor horário para lembrar você</label>

                    <Input

                      type="time"

                      value={onboardingTime}

                      onChange={(e) => setOnboardingTime(e.target.value)}

                    />

                  </div>

                  <div className="flex flex-col gap-2">

                    <label className="text-sm font-medium">Tema que mais precisa hoje</label>

                    <select

                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"

                      value={onboardingInterest}

                      onChange={(e) => setOnboardingInterest(e.target.value)}

                    >

                      <option value="paz">Paz</option>

                      <option value="ansiedade">Ansiedade</option>

                      <option value="relacionamentos">Relacionamentos</option>

                      <option value="proposito">Propósito</option>

                      <option value="fe">Fé</option>

                    </select>

                  </div>

                  <div className="flex flex-col gap-2">

                    <label className="text-sm font-medium">Seu ritmo de leitura</label>

                    <select

                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"

                      value={onboardingPace}

                      onChange={(e) => setOnboardingPace(e.target.value)}

                    >

                      <option value="leve">Leve (5 min)</option>

                      <option value="medio">Médio (10 min)</option>

                      <option value="profundo">Profundo (15+ min)</option>

                    </select>

                  </div>

                  <div className="flex gap-2">

                    <Button className="flex-1" onClick={handleOnboardingSave}>

                      Salvar preferências

                    </Button>

                    <Button variant="outline" onClick={handleOnboardingSkip}>

                      Pular

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

                  <CardTitle className="text-lg">Ative lembretes dirios</CardTitle>

                  <CardDescription>

                    Configure um horrio e tema em 30 segundos.

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

                    Configurar lembretes

                  </Button>

                  <Button

                    variant="outline"

                    onClick={() => {

                      safeStorageSet(NOTIFICATION_GUIDE_DISMISSED_KEY, "dismissed");

                      setShowNotificationGuide(false);

                    }}

                  >

                    Agora no

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


            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-full mx-auto px-1">


              {features.map((feature, index) => (


                <Link key={index} to={feature.path}>


                  <Card className="stats-card text-center group hover:scale-105 transition-all duration-300 p-3 bg-card dark:bg-zinc-900 text-card-foreground dark:text-white cursor-pointer">


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


                </Link>


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































