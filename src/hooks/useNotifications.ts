import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

console.log('[DEBUG] Início do arquivo useNotifications.ts');

// Declarações de tipo para Cordova
// Usando any para evitar conflitos com @types/cordova

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

const THEMES = [
  { value: "auto", label: "Automático" },
  { value: "amor", label: "Amor" },
  { value: "fe", label: "Fé" },
  { value: "esperanca", label: "Esperança" },
  { value: "paz", label: "Paz" },
  { value: "gratidao", label: "Gratidão" },
  { value: "perdao", label: "Perdão" },
  { value: "coragem", label: "Coragem" },
  { value: "sabedoria", label: "Sabedoria" },
  { value: "humildade", label: "Humildade" },
  { value: "perseveranca", label: "Perseverança" },
  { value: "confianca", label: "Confiança" },
  { value: "alegria", label: "Alegria" },
  { value: "bondade", label: "Bondade" },
  { value: "paciencia", label: "Paciência" },
  { value: "misericordia", label: "Misericórdia" },
  { value: "justica", label: "Justiça" },
  { value: "verdade", label: "Verdade" },
  { value: "liberdade", label: "Liberdade" },
  { value: "vida", label: "Vida" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

// Chaves para controle de estado
const SCHEDULES_KEY = 'notification_schedules';
const USED_VERSES_KEY = 'used_verses';

// Verificar se o plugin Cordova está disponível
const isCordovaAvailable = (): boolean => {
  const hasWindow = typeof window !== 'undefined';
  const hasCordova = hasWindow && typeof (window as any).cordova !== 'undefined';
  const hasNotificationPlugin = hasCordova && (window as any).cordova?.plugins?.notification?.local !== undefined;
  
  return hasNotificationPlugin;
};

// Função para obter um versículo aleatório por tema
const getRandomVerseByTheme = (verses: Verse[], theme: string, usedVerses: Record<string, string[]>): Verse | null => {
  if (theme === 'auto') {
    // Para tema automático, escolher qualquer versículo
    const availableVerses = verses.filter(verse => {
      const usedForTheme = usedVerses[verse.tema] || [];
      return !usedForTheme.includes(verse.referencia);
    });
    
    if (availableVerses.length === 0) {
      // Se todos foram usados, resetar para este tema
      return verses[Math.floor(Math.random() * verses.length)];
    }
    
    return availableVerses[Math.floor(Math.random() * availableVerses.length)];
  } else {
    // Para tema específico
    const themeVerses = verses.filter(verse => verse.tema === theme);
    const availableVerses = themeVerses.filter(verse => {
      const usedForTheme = usedVerses[theme] || [];
      return !usedForTheme.includes(verse.referencia);
    });
    
    if (availableVerses.length === 0) {
      // Se todos foram usados para este tema, resetar
      return themeVerses[Math.floor(Math.random() * themeVerses.length)];
    }
    
    return availableVerses[Math.floor(Math.random() * availableVerses.length)];
  }
};

// Função para marcar versículo como usado
const markVerseAsUsed = (usedVerses: Record<string, string[]>, verse: Verse): Record<string, string[]> => {
  const newUsedVerses = { ...usedVerses };
  const theme = verse.tema;
  
  if (!newUsedVerses[theme]) {
    newUsedVerses[theme] = [];
  }
  
  if (!newUsedVerses[theme].includes(verse.referencia)) {
    newUsedVerses[theme].push(verse.referencia);
  }
  
  return newUsedVerses;
};

// Função para calcular próximo horário de notificação
const calculateNextNotificationTime = (schedule: NotificationSchedule): Date => {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  
  // Criar data para hoje com o horário especificado
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  
  // Se já passou do horário hoje, calcular para amanhã
  if (now >= today) {
    today.setDate(today.getDate() + 1);
  }
  
  // Encontrar o próximo dia da semana que está no agendamento
  let currentDay = today.getDay();
  let daysToAdd = 0;
  
  // Procurar o próximo dia válido
  while (daysToAdd < 7) {
    if (schedule.days.includes(currentDay)) {
      break;
    }
    currentDay = (currentDay + 1) % 7;
    daysToAdd++;
  }
  
  // Se não encontrou nenhum dia válido, usar o primeiro dia da lista
  if (daysToAdd >= 7) {
    daysToAdd = 0;
    currentDay = schedule.days[0];
  }
  
  const nextNotification = new Date(today);
  nextNotification.setDate(today.getDate() + daysToAdd);
  
  console.log('[Notifications] Próxima notificação calculada:', {
    horario: schedule.time,
    dias: schedule.days,
    proximaData: nextNotification.toISOString(),
    agora: now.toISOString(),
    diasAdicionados: daysToAdd
  });
  
  return nextNotification;
};

export const useNotifications = () => {
  console.log('[DEBUG] Início do hook useNotifications');
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [usedVerses, setUsedVerses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const initializationRef = useRef(false);

  // Inicializar diretamente para mobile
  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      setIsMobile(true); // Assumir que é mobile
      const timer = setTimeout(() => {
        initializeNotifications();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      console.log('[Notifications] Inicializando sistema de notificações...');
      
      if (!isCordovaAvailable()) {
        console.log('[Notifications] Cordova não disponível, pulando inicialização');
        setLoading(false);
        return;
      }

      // Carregar dados salvos
      loadSchedules();
      await loadVerses();
      loadUsedVerses();

      // Verificar permissões
      await requestPermissions();

      // Agendar notificações existentes
      await scheduleAllNotifications();

      setLoading(false);
      console.log('[Notifications] Sistema inicializado com sucesso');
    } catch (error) {
      console.error('[Notifications] Erro na inicialização:', error);
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      if (!isCordovaAvailable()) return;

      const cordova = (window as any).cordova;
      const notificationPlugin = cordova?.plugins?.notification?.local;

      if (notificationPlugin) {
        notificationPlugin.hasPermission((granted: boolean) => {
          if (!granted) {
            notificationPlugin.requestPermission((granted: boolean) => {
              console.log('[Notifications] Permissão solicitada:', granted);
            });
          } else {
            console.log('[Notifications] Permissão já concedida');
          }
        });
      }
    } catch (error) {
      console.error('[Notifications] Erro ao solicitar permissões:', error);
    }
  };

  const loadSchedules = () => {
    try {
      const saved = localStorage.getItem(SCHEDULES_KEY);
      if (saved) {
        const schedules = JSON.parse(saved);
        setSchedules(schedules);
        console.log('[Notifications] Agendamentos carregados:', schedules.length);
      }
    } catch (error) {
      console.error('[Notifications] Erro ao carregar agendamentos:', error);
    }
  };

  const loadVerses = async (): Promise<Verse[]> => {
    try {
      const response = await fetch('/data/versiculos_por_tema_com_texto.json');
      const verses = await response.json();
      setVerses(verses);
      console.log('[Notifications] Versículos carregados:', verses.length);
      return verses;
    } catch (error) {
      console.error('[Notifications] Erro ao carregar versículos:', error);
      return [];
    }
  };

  const loadUsedVerses = () => {
    try {
      const saved = localStorage.getItem(USED_VERSES_KEY);
      if (saved) {
        const usedVerses = JSON.parse(saved);
        setUsedVerses(usedVerses);
      }
    } catch (error) {
      console.error('[Notifications] Erro ao carregar versículos usados:', error);
    }
  };

  const saveSchedules = (newSchedules: NotificationSchedule[]) => {
    try {
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (error) {
      console.error('[Notifications] Erro ao salvar agendamentos:', error);
    }
  };

  const saveUsedVerses = (newUsedVerses: Record<string, string[]>) => {
    try {
      localStorage.setItem(USED_VERSES_KEY, JSON.stringify(newUsedVerses));
      setUsedVerses(newUsedVerses);
    } catch (error) {
      console.error('[Notifications] Erro ao salvar versículos usados:', error);
    }
  };

  // Função para agendar uma notificação específica
  const scheduleNotification = async (schedule: NotificationSchedule): Promise<boolean> => {
    try {
      if (!isCordovaAvailable() || !schedule.enabled) {
        return false;
      }

      const cordova = (window as any).cordova;
      const notificationPlugin = cordova?.plugins?.notification?.local;

      if (!notificationPlugin) {
        return false;
      }

      // Obter versículo para esta notificação
      const verse = getRandomVerseByTheme(verses, schedule.theme, usedVerses);
      if (!verse) {
        console.error('[Notifications] Nenhum versículo encontrado para o tema:', schedule.theme);
        return false;
      }

      // Marcar versículo como usado
      const newUsedVerses = markVerseAsUsed(usedVerses, verse);
      saveUsedVerses(newUsedVerses);

      // Calcular próximo horário
      const nextTime = calculateNextNotificationTime(schedule);

      // Criar notificação
      const notification = {
        id: parseInt(schedule.id), // Usar ID numérico para o plugin
        title: "Versículo do Dia",
        text: `${verse.referencia}: ${verse.texto}`,
        sound: "default",
        trigger: {
          type: 'calendar',
          at: nextTime
        },
        every: 'week', // Repetir semanalmente
        data: {
          scheduleId: schedule.id,
          theme: schedule.theme,
          verseReference: verse.referencia
        }
      };

      console.log('[Notifications] Configurando notificação:', {
        id: schedule.id,
        horario: schedule.time,
        dias: schedule.days,
        proximaExecucao: nextTime,
        repeticaoSemanal: true
      });

      return new Promise((resolve) => {
        notificationPlugin.schedule(notification, (scheduled: boolean) => {
          if (scheduled) {
            console.log('[Notifications] Notificação agendada para:', schedule.id, 'em', nextTime, 'com repetição semanal');
            resolve(true);
          } else {
            console.error('[Notifications] Falha ao agendar notificação:', schedule.id);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('[Notifications] Erro ao agendar notificação:', error);
      return false;
    }
  };

  // Função para agendar todas as notificações
  const scheduleAllNotifications = async () => {
    try {
      if (!isCordovaAvailable()) return;

      console.log('[Notifications] Agendando todas as notificações...');
      
      // Cancelar todas as notificações existentes
      const cordova = (window as any).cordova;
      const notificationPlugin = cordova?.plugins?.notification?.local;
      
      if (notificationPlugin) {
        notificationPlugin.cancelAll(() => {
          console.log('[Notifications] Todas as notificações canceladas');
        });
      }

      // Agendar apenas as notificações ativas
      const activeSchedules = schedules.filter(s => s.enabled);
      
      for (const schedule of activeSchedules) {
        await scheduleNotification(schedule);
      }

      console.log('[Notifications] Agendamento concluído');
    } catch (error) {
      console.error('[Notifications] Erro ao agendar notificações:', error);
    }
  };

  const addSchedule = async (scheduleData: Omit<NotificationSchedule, 'id' | 'enabled' | 'createdAt'>): Promise<NotificationSchedule> => {
    try {
      const newSchedule: NotificationSchedule = {
        ...scheduleData,
        id: Date.now().toString(),
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      const updatedSchedules = [...schedules, newSchedule];
      saveSchedules(updatedSchedules);

      // Agendar a nova notificação
      if (isCordovaAvailable()) {
        await scheduleNotification(newSchedule);
      }

      toast({
        title: "Agendamento criado",
        description: "Notificação agendada com sucesso!",
      });

      return Promise.resolve(newSchedule);
    } catch (error) {
      console.error('[Notifications] Erro ao adicionar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const toggleSchedule = async (schedule: NotificationSchedule): Promise<void> => {
    try {
      const updatedSchedules = schedules.map(s =>
        s.id === schedule.id ? { ...s, enabled: !s.enabled } : s
      );
      saveSchedules(updatedSchedules);

      // Reagendar todas as notificações
      if (isCordovaAvailable()) {
        await scheduleAllNotifications();
      }

      toast({
        title: schedule.enabled ? "Notificação desativada" : "Notificação ativada",
        description: schedule.enabled ? "A notificação foi desativada." : "A notificação foi ativada.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('[Notifications] Erro ao alternar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o agendamento.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const deleteSchedule = async (schedule: NotificationSchedule): Promise<void> => {
    try {
      const updatedSchedules = schedules.filter(s => s.id !== schedule.id);
      saveSchedules(updatedSchedules);

      // Cancelar notificação específica
      if (isCordovaAvailable()) {
        const cordova = (window as any).cordova;
        const notificationPlugin = cordova?.plugins?.notification?.local;
        
        if (notificationPlugin) {
          notificationPlugin.cancel(parseInt(schedule.id), () => {
            console.log('[Notifications] Notificação cancelada:', schedule.id);
          });
        }
      }

      toast({
        title: "Agendamento removido",
        description: "O agendamento foi removido com sucesso.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('[Notifications] Erro ao deletar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const formatDays = (days: number[]) => {
    return days.map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label).join(', ');
  };

  const getThemeLabel = (theme: string) => {
    return THEMES.find(t => t.value === theme)?.label || theme;
  };

  const getActiveSchedulesCount = () => {
    return schedules.filter(s => s.enabled).length;
  };

  const getAvailableThemesCount = () => {
    return THEMES.length;
  };

  const testNotification = async (): Promise<void> => {
    try {
      if (!isCordovaAvailable()) {
        toast({
          title: "Erro",
          description: "Notificações não estão disponíveis nesta plataforma.",
          variant: "destructive",
        });
        return Promise.resolve();
      }

      const cordova = (window as any).cordova;
      const notificationPlugin = cordova?.plugins?.notification?.local;

      if (notificationPlugin) {
        const testNotification = {
          id: Date.now(),
          title: "Teste de Notificação",
          text: "Esta é uma notificação de teste do app Conexão com Deus",
          sound: "default",
          at: new Date(Date.now() + 5000), // 5 segundos
        };

        return new Promise((resolve, reject) => {
          notificationPlugin.schedule(testNotification, (scheduled: boolean) => {
            if (scheduled) {
              toast({
                title: "Notificação de teste agendada",
                description: "Você receberá uma notificação em 5 segundos.",
              });
              resolve();
            } else {
              toast({
                title: "Erro",
                description: "Não foi possível agendar a notificação de teste.",
                variant: "destructive",
              });
              reject(new Error('Falha ao agendar notificação de teste'));
            }
          });
        });
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('[Notifications] Erro no teste de notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao testar notificação.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  return {
    schedules,
    verses,
    usedVerses,
    loading,
    isMobile,
    isCordovaAvailable: isCordovaAvailable(),
    THEMES,
    DAYS_OF_WEEK,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
    formatDays,
    getThemeLabel,
    getActiveSchedulesCount,
    getAvailableThemesCount,
    testNotification,
    scheduleAllNotifications, // Exportar para uso externo se necessário
  };
}; 