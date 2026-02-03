import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navigation from '@/components/Navigation';
import AuthDialog from '@/components/AuthDialog';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from '@mui/material/Switch';
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Calendar, Trash2, Plus, Settings, BookOpen, Loader2, Heart } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { trackEvent } from "@/lib/analytics";

const Notifications = () => {
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);
  const [showForm, setShowForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false); // NOVO estado
  const handleAuthClick = () => setShowAuth(true); // NOVA função
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  // Phase 2: track when guided setup is requested.
  const guidedSetup = searchParams.get('guided') === '1';
  const guidedInitialized = useRef(false);
  const [formData, setFormData] = useState({
    time: "08:00",
    days: [] as number[],
    theme: "auto",
    type: "verse" as "verse" | "prayer", // NOVO campo
  });
  
  const {
    schedules,
    prayerSchedules, // NOVO estado
    verses,
    loading,
    isMobile,
    addSchedule,
    addPrayerSchedule, // NOVA funÃ§Ã£o
    toggleSchedule,
    deleteSchedule,
    togglePrayerSchedule, // NOVA funÃ§Ã£o
    deletePrayerSchedule, // NOVA funÃ§Ã£o
    formatDays,
    getThemeLabel,
    getActiveSchedulesCount,
    getActivePrayerSchedulesCount, // NOVA funÃ§Ã£o
    getAvailableThemesCount,
    testNotification,
    THEMES,
    DAYS_OF_WEEK,
  } = useNotifications();
  // Phase 2: use onboarding preferences to prefill templates and guided setup.
  const safeStorageGet = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const onboardingPrefs = useMemo(() => {
    try {
      const stored = safeStorageGet("onboarding_v1");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }, []);

  const defaultTime = onboardingPrefs?.time || "08:00";
  const allDays = useMemo(() => DAYS_OF_WEEK.map((day) => day.value), [DAYS_OF_WEEK]);
  // Phase 2: gentler default days for guided setup (weekdays).
  const defaultDays = useMemo(() => [1, 2, 3, 4, 5], []);
  const themeValues = useMemo(() => new Set(THEMES.map((theme) => theme.value)), [THEMES]);
  // Phase 2: quick templates for prefilled notification setup.
  const quickTemplates = [
    { id: "auto", label: tx("Diário (Auto)", "Daily (Auto)"), type: "verse", theme: "auto" },
    { id: "paz", label: tx("Paz", "Peace"), type: "verse", theme: "paz" },
    { id: "esperanca", label: tx("Esperança", "Hope"), type: "verse", theme: "esperança" },
    { id: "oracao", label: tx("Oração diária", "Daily prayer"), type: "prayer", theme: "auto" },
  ];

  const dayShortLabel = (day: number) => {
    const pt = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (isEnglish ? en : pt)[day] ?? "";
  };

  const applyTemplate = (template: { type: "verse" | "prayer"; theme: string }) => {
    setFormData({
      time: defaultTime,
      days: defaultDays,
      theme: template.theme,
      type: template.type,
    });
    setShowForm(true);
  };

  // Phase 2: guided setup can prefill the form based on query params.
  useEffect(() => {
    if (!guidedSetup || guidedInitialized.current) return;
    guidedInitialized.current = true;
    const rawTheme = searchParams.get('theme') || "auto";
    const themeParam = themeValues.has(rawTheme) ? rawTheme : "auto";
    const typeParam = searchParams.get('type') === 'prayer' ? 'prayer' : 'verse';

    setFormData({
      time: defaultTime,
      days: defaultDays,
      theme: themeParam,
      type: typeParam,
    });
    setShowForm(true);
  }, [guidedSetup, searchParams, defaultTime, defaultDays, themeValues]);

  const [notificationStatus, setNotificationStatus] = useState<{ enabled: boolean; message: string } | null>({
    enabled: true,
    message: tx("Notificações disponíveis", "Notifications available")
  });

  const handleAddSchedule = async (): Promise<boolean> => {
    if (formData.days.length === 0) {
      return Promise.resolve(false);
    }

    try {
      if (formData.type === 'prayer') {
        await addPrayerSchedule({
          time: formData.time,
          days: formData.days,
        });
      } else {
        await addSchedule({
          time: formData.time,
          days: formData.days,
          theme: formData.theme,
        });
      if (user?.id) {
        trackEvent({
          event_name: "notification_enabled",
          user_id: user.id,
          properties: {
            type: formData.type,
            days: formData.days,
          },
        });
      }

      }

      setFormData({ time: "08:00", days: [], theme: "auto", type: "verse" });
      setShowForm(false);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    }
  };

  const handleToggleSchedule = async (schedule: typeof schedules[number]) => {
    const shouldEnable = !schedule.enabled;
    const result = await toggleSchedule(schedule);
    if (result && shouldEnable && user?.id) {
      trackEvent({
        event_name: "notification_enabled",
        user_id: user.id,
        properties: { type: "verse" },
      });
    }
  };

  const handleTogglePrayerSchedule = async (schedule: typeof prayerSchedules[number]) => {
    const shouldEnable = !schedule.enabled;
    const result = await togglePrayerSchedule(schedule);
    if (result && shouldEnable && user?.id) {
      trackEvent({
        event_name: "notification_enabled",
        user_id: user.id,
        properties: { type: "prayer" },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onAuthClick={() => {}} />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-lg">{tx("Carregando notificações...", "Loading notifications...")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold heavenly-text">{tx("Notificações", "Notifications")}</h1>
            <p className="text-muted-foreground">
              {tx("Agende versículos bíblicos para receber notificações diárias", "Schedule Bible verses to receive daily notifications")}
            </p>
          </div>
        </div>

        {/* Status das NotificaÃ§Ãµes */}
        {notificationStatus && (
          <Card className="mb-6 bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{tx("Status das Notificações", "Notification Status")}</p>
                  <p className={`font-medium ${notificationStatus.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {notificationStatus.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* EstatÃ­sticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{tx("Agendamentos Ativos", "Active schedules")}</p>
                  <p className="text-2xl font-bold">{getActiveSchedulesCount() + getActivePrayerSchedulesCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{tx("Versículos", "Verses")}</p>
                  <p className="text-2xl font-bold">{getActiveSchedulesCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{tx("Orações", "Prayers")}</p>
                  <p className="text-2xl font-bold">{getActivePrayerSchedulesCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Phase 2: Guided setup banner */}
        {guidedSetup && (
          <Card className="mb-6 bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardHeader>
              <CardTitle>{tx("Configuração guiada", "Guided setup")}</CardTitle>
              <CardDescription>
                {tx("Escolha um tema e horário para começar a receber lembretes.", "Choose a topic and time to start receiving reminders.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setShowForm(true)} className="flex-1">
                {tx("Ajustar detalhes", "Adjust details")}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                {tx("Ver meus agendamentos", "View my schedules")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phase 2: Theme-based templates */}
        <Card className="mb-6 bg-card border border-border dark:bg-zinc-900 dark:border-border">
          <CardHeader>
            <CardTitle>{tx("Modelos rápidos", "Quick templates")}</CardTitle>
            <CardDescription>
              {tx("Escolha um tema e deixe o resto pronto automaticamente.", "Pick a topic and leave the rest ready automatically.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quickTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                onClick={() => applyTemplate(template)}
              >
                {template.label}
              </Button>
            ))}
          </CardContent>
        </Card>
        {/* BotÃ£o Adicionar */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button 
            onClick={() => setShowForm(true)} 
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {tx("Novo Agendamento", "New Schedule")}
          </Button>
          

        </div>

        {/* FormulÃ¡rio */}
        {showForm && (
          <Card className="mb-6 bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardHeader>
              <CardTitle>{tx("Novo Agendamento", "New Schedule")}</CardTitle>
              <CardDescription>
                {tx("Configure quando e como você quer receber notificações", "Set when and how you want to receive notifications")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de tipo - mobile friendly */}
              <div>
                <Label>{tx("Tipo de Notificação", "Notification type")}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={formData.type === 'verse' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: 'verse' })}
                    className="h-12"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {tx("Versículo", "Verse")}
                  </Button>
                  <Button
                    variant={formData.type === 'prayer' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: 'prayer' })}
                    className="h-12"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {tx("Oração", "Prayer")}
                  </Button>
                </div>
              </div>

              {/* HorÃ¡rio */}
              <div>
                <Label htmlFor="time">{tx("Horário", "Time")}</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* Tema sÃ³ para versÃ­culos */}
              {formData.type === 'verse' && (
                <div>
                  <Label htmlFor="theme">{tx("Tema", "Theme")}</Label>
                  <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dias da semana - mobile grid */}
              <div>
                <Label>{tx("Dias da Semana", "Days of the Week")}</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      variant={formData.days.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newDays = formData.days.includes(day.value)
                          ? formData.days.filter(d => d !== day.value)
                          : [...formData.days, day.value];
                        setFormData({ ...formData, days: newDays });
                      }}
                    >
                      {dayShortLabel(day.value)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* BotÃµes mobile */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddSchedule} className="flex-1">
                  {tx("Criar Agendamento", "Create schedule")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  {tx("Cancelar", "Cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{tx("Seus Agendamentos", "Your schedules")}</h2>
          
          {schedules.length === 0 && prayerSchedules.length === 0 ? (
            <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {tx("Você ainda não tem agendamentos. Crie um para começar a receber notificações.", "You do not have schedules yet. Create one to start receiving notifications.")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Agendamentos de VersÃ­culos */}
              {schedules.map((schedule) => (
                <Card key={`verse-${schedule.id}`} className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={schedule.enabled ? "default" : "secondary"} className="text-xs">
                            {schedule.enabled ? tx("Ativo", "Active") : tx("Inativo", "Inactive")}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <BookOpen className="w-3 h-3 mr-1" />
                            {tx("Versículo", "Verse")}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {schedule.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDays(schedule.days)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx("Tema", "Theme")}: {getThemeLabel(schedule.theme)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <Switch
                          checked={schedule.enabled}
                          onChange={() => handleToggleSchedule(schedule)}
                          size="small"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSchedule(schedule)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Agendamentos de OraÃ§Ã£o */}
              {prayerSchedules.map((schedule) => (
                <Card key={`prayer-${schedule.id}`} className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={schedule.enabled ? "default" : "secondary"} className="text-xs">
                            {schedule.enabled ? tx("Ativo", "Active") : tx("Inativo", "Inactive")}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {tx("Oração", "Prayer")}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {schedule.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDays(schedule.days)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <Switch
                          checked={schedule.enabled}
                          onChange={() => handleTogglePrayerSchedule(schedule)}
                          size="small"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePrayerSchedule(schedule)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Notifications; 












