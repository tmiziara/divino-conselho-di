import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from '@mui/material/Switch';
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Calendar, Trash2, Plus, Settings, BookOpen, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const Notifications = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    time: "08:00",
    days: [] as number[],
    theme: "auto",
  });
  
  const {
    schedules,
    verses,
    loading,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
    formatDays,
    getThemeLabel,
    getActiveSchedulesCount,
    getAvailableThemesCount,
    THEMES,
    DAYS_OF_WEEK,
  } = useNotifications();

  const handleAddSchedule = async () => {
    if (formData.days.length === 0) {
      return false;
    }

    const success = await addSchedule({
      time: formData.time,
      days: formData.days,
      theme: formData.theme,
    });

    if (success) {
      setFormData({ time: "08:00", days: [], theme: "auto" });
      setShowForm(false);
    }

    return success;
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
      <Navigation onAuthClick={() => {}} />
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Agendamentos Ativos</p>
                  <p className="text-2xl font-bold">{getActiveSchedulesCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Versículos Disponíveis</p>
                  <p className="text-2xl font-bold">{verses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Temas Disponíveis</p>
                  <p className="text-2xl font-bold">{getAvailableThemesCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Adicionar */}
        <div className="mb-6">
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
                Configure quando e como você quer receber versículos bíblicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
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
              </div>

              <div>
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
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
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
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
          
          {schedules.length === 0 ? (
            <Card className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não tem agendamentos. Crie um para começar a receber versículos bíblicos.
                </p>
              </CardContent>
            </Card>
          ) : (
            schedules.map((schedule) => (
              <Card key={schedule.id} className="bg-card border border-border dark:bg-zinc-900 dark:border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={schedule.enabled ? "default" : "secondary"}>
                          {schedule.enabled ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline">
                          {getThemeLabel(schedule.theme)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {schedule.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDays(schedule.days)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.enabled}
                        onChange={(e) => toggleSchedule(schedule)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSchedule(schedule)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 