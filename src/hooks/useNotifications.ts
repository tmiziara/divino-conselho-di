import { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useToast } from '@/hooks/use-toast';

export interface NotificationSchedule {
  id: string;
  time: string;
  days: number[];
  theme: string;
  enabled: boolean;
  createdAt: string;
}

export interface Verse {
  tema: string;
  referencia: string;
  texto: string;
}

export const THEMES = [
  { value: "auto", label: "Automático" },
  { value: "fé", label: "Fé" },
  { value: "esperança", label: "Esperança" },
  { value: "amor", label: "Amor" },
  { value: "perdão", label: "Perdão" },
  { value: "sabedoria", label: "Sabedoria" },
  { value: "força", label: "Força" },
  { value: "oração", label: "Oração" },
  { value: "paz", label: "Paz" },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export const useNotifications = () => {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [usedVerses, setUsedVerses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSchedules(),
        loadVerses(),
        loadUsedVerses(),
        requestPermissions()
      ]);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display !== 'granted') {
        toast({
          title: "Permissão necessária",
          description: "Para receber notificações, é necessário permitir o acesso.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const loadSchedules = () => {
    try {
      const stored = localStorage.getItem('notification_schedules');
      if (stored) {
        setSchedules(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadVerses = async () => {
    try {
      const response = await fetch('/data/versiculos_por_tema_com_texto.json');
      const data = await response.json();
      setVerses(data);
    } catch (error) {
      console.error('Error loading verses:', error);
    }
  };

  const loadUsedVerses = () => {
    try {
      const stored = localStorage.getItem('used_verses');
      if (stored) {
        setUsedVerses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading used verses:', error);
    }
  };

  const saveSchedules = (newSchedules: NotificationSchedule[]) => {
    try {
      localStorage.setItem('notification_schedules', JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  };

  const saveUsedVerses = (newUsedVerses: Record<string, string[]>) => {
    try {
      localStorage.setItem('used_verses', JSON.stringify(newUsedVerses));
      setUsedVerses(newUsedVerses);
    } catch (error) {
      console.error('Error saving used verses:', error);
    }
  };

  const getRandomVerse = (theme: string): Verse | null => {
    let availableVerses: Verse[];
    
    if (theme === 'auto') {
      availableVerses = verses;
    } else {
      availableVerses = verses.filter(v => v.tema === theme);
    }

    if (availableVerses.length === 0) return null;

    // Filtrar versículos já usados
    const usedForTheme = usedVerses[theme] || [];
    const unusedVerses = availableVerses.filter(v => !usedForTheme.includes(v.referencia));

    // Se todos foram usados, resetar
    if (unusedVerses.length === 0) {
      const newUsedVerses = { ...usedVerses };
      newUsedVerses[theme] = [];
      saveUsedVerses(newUsedVerses);
      return availableVerses[Math.floor(Math.random() * availableVerses.length)];
    }

    // Escolher versículo aleatório
    const selectedVerse = unusedVerses[Math.floor(Math.random() * unusedVerses.length)];
    
    // Marcar como usado
    const newUsedVerses = { ...usedVerses };
    if (!newUsedVerses[theme]) newUsedVerses[theme] = [];
    newUsedVerses[theme].push(selectedVerse.referencia);
    saveUsedVerses(newUsedVerses);

    return selectedVerse;
  };

  const createNotification = async (schedule: NotificationSchedule) => {
    try {
      const verse = getRandomVerse(schedule.theme);
      if (!verse) {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar um versículo para este tema.",
          variant: "destructive"
        });
        return false;
      }

      const [hours, minutes] = schedule.time.split(':').map(Number);
      
      for (const day of schedule.days) {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        scheduledTime.setDate(scheduledTime.getDate() + (day - scheduledTime.getDay() + 7) % 7);
        
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 7);
        }

        await LocalNotifications.schedule({
          notifications: [{
            id: parseInt(schedule.id) + day,
            title: "Versículo do Dia",
            body: `${verse.referencia}: ${verse.texto}`,
            schedule: {
              at: scheduledTime,
              repeats: true,
              every: 'week'
            }
          }]
        });
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a notificação.",
        variant: "destructive"
      });
      return false;
    }
  };

  const addSchedule = async (scheduleData: Omit<NotificationSchedule, 'id' | 'enabled' | 'createdAt'>) => {
    const newSchedule: NotificationSchedule = {
      id: Math.floor(Math.random() * 1000000).toString(),
      ...scheduleData,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const newSchedules = [...schedules, newSchedule];
    saveSchedules(newSchedules);
    
    const success = await createNotification(newSchedule);
    
    if (success) {
      toast({
        title: "Agendamento criado",
        description: `Notificação agendada para ${newSchedule.days.length} dia(s) da semana.`,
      });
    }

    return success;
  };

  const toggleSchedule = async (schedule: NotificationSchedule) => {
    const newSchedules = schedules.map(s => 
      s.id === schedule.id ? { ...s, enabled: !s.enabled } : s
    );
    saveSchedules(newSchedules);

    if (!schedule.enabled) {
      const success = await createNotification(schedule);
      if (!success) {
        // Reverter se falhou
        saveSchedules(schedules);
      }
    } else {
      // Cancelar notificações
      try {
        for (const day of schedule.days) {
          await LocalNotifications.cancel({ notifications: [{ id: parseInt(schedule.id) + day }] });
        }
      } catch (error) {
        console.error('Error canceling notifications:', error);
      }
    }
  };

  const deleteSchedule = async (schedule: NotificationSchedule) => {
    try {
      // Cancelar notificações
      for (const day of schedule.days) {
        await LocalNotifications.cancel({ notifications: [{ id: parseInt(schedule.id) + day }] });
      }

      const newSchedules = schedules.filter(s => s.id !== schedule.id);
      saveSchedules(newSchedules);

      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  const formatDays = (days: number[]) => {
    return days
      .sort()
      .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
      .join(', ');
  };

  const getThemeLabel = (theme: string) => {
    return THEMES.find(t => t.value === theme)?.label || theme;
  };

  const getActiveSchedulesCount = () => {
    return schedules.filter(s => s.enabled).length;
  };

  const getAvailableThemesCount = () => {
    return THEMES.length - 1; // Excluir "auto"
  };

  return {
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
  };
}; 