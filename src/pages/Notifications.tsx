import React, { useState, useEffect } from 'react';
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

const Notifications = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false); // NOVO estado
  const handleAuthClick = () => setShowAuth(true); // NOVA função
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
    addPrayerSchedule, // NOVA função
    toggleSchedule,
    deleteSchedule,
    togglePrayerSchedule, // NOVA função
    deletePrayerSchedule, // NOVA função
    formatDays,
    getThemeLabel,
    getActiveSchedulesCount,
    getActivePrayerSchedulesCount, // NOVA função
    getAvailableThemesCount,
    testNotification,
    THEMES,
    DAYS_OF_WEEK,
  } = useNotifications();

  const [notificationStatus, setNotificationStatus] = useState<{ enabled: boolean; message: string } | null>({
    enabled: true,
    message: 'Notificações disponíveis'
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
      }

      setFormData({ time: "08:00", days: [], theme: "auto", type: "verse" });
      setShowForm(false);
      return Promise.resolve(true);
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      return Promise.resolve(false);
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
              <p className="text-lg">Carregando notificações...</p>
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
            <h1 className="text-3xl font-bold heavenly-text">Notificações</h1>
            <p className="text-muted-foreground">
              Agende versículos bíblicos para receber notificações diárias
            </p>
          </div>
        </div>

        {/* Status das Notificações */}
        {notificationStatus && (
          <Card className="mb-6 bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Status das Notificações</p>
                  <p className={`font-medium ${notificationStatus.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {notificationStatus.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos Ativos</p>
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
                  <p className="text-sm text-muted-foreground">Versículos</p>
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
                  <p className="text-sm text-muted-foreground">Orações</p>
                  <p className="text-2xl font-bold">{getActivePrayerSchedulesCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button 
            onClick={() => setShowForm(true)} 
            className="w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
          

        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-6 bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardHeader>
              <CardTitle>Novo Agendamento</CardTitle>
              <CardDescription>
                Configure quando e como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de tipo - mobile friendly */}
              <div>
                <Label>Tipo de Notificação</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={formData.type === 'verse' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: 'verse' })}
                    className="h-12"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Versículo
                  </Button>
                  <Button
                    variant={formData.type === 'prayer' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type: 'prayer' })}
                    className="h-12"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Oração
                  </Button>
                </div>
              </div>

              {/* Horário */}
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              {/* Tema só para versículos */}
              {formData.type === 'verse' && (
                <div>
                  <Label htmlFor="theme">Tema</Label>
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
                <Label>Dias da Semana</Label>
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
                      {day.label.slice(0, 3)} {/* Seg, Ter, Qua, etc */}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Botões mobile */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddSchedule} className="flex-1">
                  Criar Agendamento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Seus Agendamentos</h2>
          
          {schedules.length === 0 && prayerSchedules.length === 0 ? (
            <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não tem agendamentos. Crie um para começar a receber notificações.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Agendamentos de Versículos */}
              {schedules.map((schedule) => (
                <Card key={`verse-${schedule.id}`} className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={schedule.enabled ? "default" : "secondary"} className="text-xs">
                            {schedule.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Versículo
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
                            Tema: {getThemeLabel(schedule.theme)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        <Switch
                          checked={schedule.enabled}
                          onChange={(e) => toggleSchedule(schedule)}
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

              {/* Agendamentos de Oração */}
              {prayerSchedules.map((schedule) => (
                <Card key={`prayer-${schedule.id}`} className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={schedule.enabled ? "default" : "secondary"} className="text-xs">
                            {schedule.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            Oração
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
                          onChange={(e) => togglePrayerSchedule(schedule)}
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