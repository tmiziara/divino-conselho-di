import { useState, useEffect, useRef } from 'react';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';

console.log('[DEBUG] Início do arquivo useNotifications.ts');

// Declarações de tipo para Cordova
declare global {
  interface Window {
    cordova?: {
      plugins?: {
        notification?: {
          local?: {
            schedule: (notification: any, callback: (scheduled: boolean) => void) => void;
            cancel: (id: number, callback: () => void) => void;
            cancelAll: (callback: () => void) => void;
            hasPermission: (callback: (granted: boolean) => void) => void;
            requestPermission: (callback: (granted: boolean) => void) => void;
            on: (event: string, callback: (notification: any) => void) => void;
            getPending: (callback: (notifications: any[]) => void) => void;
          };
        };
      };
    };
  }
}

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
const NOTIFICATION_STATE_KEY = 'notification_system_state';

// Interface para controle de estado
interface NotificationState {
  isInitialized: boolean;
  lastInitialization: string;
  version: string;
}

// Verificar se o plugin Cordova está disponível
const isCordovaAvailable = (): boolean => {
  const hasWindow = typeof window !== 'undefined';
  const hasCordova = hasWindow && typeof window.cordova !== 'undefined';
  const hasNotificationPlugin = hasCordova && window.cordova?.plugins?.notification?.local !== undefined;
  
  // Verificação adicional para diferentes formas de acesso ao plugin
  let alternativeCheck = false;
  if (hasCordova) {
    // Tentar diferentes formas de acessar o plugin
    alternativeCheck = !!(
      window.cordova?.plugins?.notification?.local ||
      (window as any).cordova?.plugins?.notification?.local ||
      (window as any).plugins?.notification?.local
    );
  }
  
  console.log('[Notifications] Verificação Cordova:', {
    hasWindow,
    hasCordova,
    hasNotificationPlugin,
    alternativeCheck,
    cordovaExists: hasWindow ? !!window.cordova : false,
    pluginsExists: hasCordova ? !!window.cordova?.plugins : false,
    notificationExists: hasCordova ? !!window.cordova?.plugins?.notification : false,
    localExists: hasCordova ? !!window.cordova?.plugins?.notification?.local : false,
    windowKeys: hasWindow ? Object.keys(window).filter(k => k.includes('cordova') || k.includes('plugin')) : []
  });
  
  return hasNotificationPlugin || alternativeCheck;
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

  // Verificar se está no mobile
  useEffect(() => {
    console.log('[DEBUG] useEffect checkPlatform chamado');
    checkPlatform();
  }, []);

  const checkPlatform = async () => {
    try {
      console.log('[DEBUG] checkPlatform executando');
      const info = await Device.getInfo();
      setIsMobile(info.platform !== 'web');
      console.log(`[Notifications] Plataforma detectada: ${info.platform}`);
    } catch (error) {
      console.error('[DEBUG] Erro em checkPlatform:', error);
      setIsMobile(false);
    }
  };

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    console.log('[DEBUG] useEffect de inicialização chamado, isMobile:', isMobile, 'initRef:', initializationRef.current);
    if (isMobile === true && !initializationRef.current) {
      initializationRef.current = true;
      console.log('[DEBUG] Entrou no bloco de inicialização do useEffect');
      // Aguardar um pouco para garantir que o Cordova esteja carregado
      const timer = setTimeout(() => {
        console.log('[DEBUG] Chamando initializeNotifications');
        initializeNotifications();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Verificar persistência das notificações quando o app é aberto
  useEffect(() => {
    if (isMobile) {
      const checkOnAppOpen = async () => {
        await checkNotificationPersistence();
      };
      const timer = setTimeout(checkOnAppOpen, 3000); // Aguardar 3 segundos para o Cordova carregar
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Função para obter estado atual do sistema
  const getNotificationState = (): NotificationState => {
    try {
      console.log('[DEBUG] getNotificationState chamado');
      const stored = localStorage.getItem(NOTIFICATION_STATE_KEY);
      return stored ? JSON.parse(stored) : { isInitialized: false, lastInitialization: '', version: '2.0' };
    } catch (error) {
      console.error('[DEBUG] Erro em getNotificationState:', error);
      return { isInitialized: false, lastInitialization: '', version: '2.0' };
    }
  };

  // Função para salvar estado atual do sistema
  const saveNotificationState = (state: Partial<NotificationState>) => {
    try {
      console.log('[DEBUG] saveNotificationState chamado');
      const currentState = getNotificationState();
      const newState = { ...currentState, ...state };
      localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('[DEBUG] Erro em saveNotificationState:', error);
    }
  };

  // Função para aguardar o Cordova estar disponível
  const waitForCordova = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isCordovaAvailable()) {
        resolve(true);
        return;
      }
      
      // Tentar por até 10 segundos
      let attempts = 0;
      const maxAttempts = 20; // 20 tentativas * 500ms = 10 segundos
      
      const checkCordova = () => {
        attempts++;
        console.log(`[Notifications] Tentativa ${attempts}/${maxAttempts} de detectar Cordova...`);
        
        if (isCordovaAvailable()) {
          console.log('[Notifications] Cordova detectado com sucesso!');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log('[Notifications] Timeout aguardando Cordova');
          resolve(false);
          return;
        }
        
        setTimeout(checkCordova, 500);
      };
      
      checkCordova();
    });
  };

  const initializeNotifications = async () => {
    try {
      console.log('[Notifications] Entrou initializeNotifications');
      const currentState = getNotificationState();
      
      // Verificar se já foi inicializado recentemente (últimas 24h)
      const lastInit = new Date(currentState.lastInitialization);
      const now = new Date();
      const hoursSinceLastInit = (now.getTime() - lastInit.getTime()) / (1000 * 60 * 60);
      
      if (currentState.isInitialized && hoursSinceLastInit < 24) {
        console.log('[Notifications] Sistema já inicializado recentemente, apenas carregando dados...');
        console.log('[Notifications] Antes de loadSchedules');
        await loadSchedules();
        console.log('[Notifications] Depois de loadSchedules');
        console.log('[Notifications] Antes de loadUsedVerses');
        await loadUsedVerses();
        console.log('[Notifications] Depois de loadUsedVerses');
        console.log('[Notifications] Antes de loadVerses');
        await loadVerses();
        console.log('[Notifications] Depois de loadVerses');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('[Notifications] Inicializando sistema de notificações...');
      
      // Carregar dados primeiro
      console.log('[Notifications] Antes de loadSchedules');
      await loadSchedules();
      console.log('[Notifications] Depois de loadSchedules');
      console.log('[Notifications] Antes de loadUsedVerses');
      await loadUsedVerses();
      console.log('[Notifications] Depois de loadUsedVerses');
      console.log('[Notifications] Antes de loadVerses');
      const loadedVerses = await loadVerses();
      console.log('[Notifications] Depois de loadVerses');
      
      if (isMobile) {
        console.log('[Notifications] Executando em mobile - aguardando Cordova...');
        const cordovaAvailable = await waitForCordova();
        
        if (cordovaAvailable) {
          console.log('[Notifications] Cordova disponível - configurando notificações');
          await requestPermissions();
          await setupNotificationListeners();
          
          // Marcar como inicializado
          saveNotificationState({
            isInitialized: true,
            lastInitialization: now.toISOString(),
            version: '2.0'
          });
          
          console.log('[Notifications] Sistema inicializado com sucesso');
        } else {
          console.log('[Notifications] Cordova não disponível após timeout - apenas carregando dados');
        }
      } else {
        console.log('[Notifications] Executando em web - apenas carregando dados');
      }
    } catch (error) {
      console.error('[DEBUG] Erro em initializeNotifications:', error);
    } finally {
      setLoading(false);
      console.log('[Notifications] Finalizou initializeNotifications');
    }
  };

  const setupNotificationListeners = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) return;

      console.log('[Notifications] Configurando listeners de notificação Cordova...');

      // Listener para quando uma notificação é recebida
      window.cordova!.plugins.notification.local.on('trigger', (notification) => {
        console.log('[Notifications] Notificação recebida:', notification);
        // IMPORTANTE: Não cancelar a notificação aqui - deixar o sistema manter
        // A propriedade repeats: true deve manter a notificação agendada
      });

      // Listener para quando uma notificação é clicada
      window.cordova!.plugins.notification.local.on('click', (notification) => {
        console.log('[Notifications] Notificação clicada:', notification);
        // IMPORTANTE: Não cancelar a notificação aqui - deixar o sistema manter
        // A propriedade repeats: true deve manter a notificação agendada
      });

      // Listener para quando uma notificação é removida/cancelada
      window.cordova!.plugins.notification.local.on('clear', (notification) => {
        console.log('[Notifications] Notificação removida/cancelada:', notification);
        
        // Verificar se é uma notificação do nosso sistema
        if (notification.data && notification.data.scheduleId) {
          console.log(`[Notifications] Notificação do agendamento ${notification.data.scheduleId} foi fechada da barra de status`);
          
          // Verificar se o agendamento ainda está ativo após alguns segundos
          setTimeout(() => {
            verificarSeAgendamentoAindaAtivo(notification.data.scheduleId);
          }, 3000);
        }
      });

      console.log('[Notifications] Listeners Cordova configurados com sucesso');
    } catch (error) {
      console.error('Error setting up Cordova notification listeners:', error);
    }
  };

  const requestPermissions = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        console.log('[Notifications] Permissões não necessárias em web ou Cordova não disponível');
        return;
      }

      console.log('[Notifications] Solicitando permissões de notificação...');
      
      // Verificar permissões
      window.cordova!.plugins.notification.local.hasPermission((granted) => {
        if (granted) {
          console.log('[Notifications] Permissões já concedidas');
        } else {
          console.log('[Notifications] Solicitando permissões...');
          window.cordova!.plugins.notification.local.requestPermission((granted) => {
            if (granted) {
              console.log('[Notifications] Permissões concedidas com sucesso');
            } else {
              toast({
                title: "Permissão necessária",
                description: "Para receber notificações, é necessário permitir o acesso nas configurações do app.",
                variant: "destructive"
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Erro de permissão",
        description: "Não foi possível solicitar permissões de notificação.",
        variant: "destructive"
      });
    }
  };

  const loadSchedules = () => {
    try {
      console.log('[Notifications] Iniciando loadSchedules');
      const stored = localStorage.getItem(SCHEDULES_KEY);
      if (stored) {
        const parsedSchedules = JSON.parse(stored);
        setSchedules(parsedSchedules);
        console.log(`[Notifications] ${parsedSchedules.length} agendamentos carregados`);
      }
      console.log('[Notifications] Finalizou loadSchedules');
    } catch (error) {
      console.error('[DEBUG] Erro em loadSchedules:', error);
    }
  };

  const loadVerses = async (): Promise<Verse[]> => {
    try {
      console.log('[Notifications] Iniciando loadVerses');
      const response = await fetch('data/versiculos_por_tema_com_texto.json');
      const data = await response.json();
      setVerses(data);
      console.log(`[Notifications] Versículos carregados: ${data.length}`);
      console.log('[Notifications] Finalizou loadVerses');
      return data;
    } catch (error) {
      console.error('[DEBUG] Erro em loadVerses:', error);
      return [];
    }
  };

  const loadUsedVerses = () => {
    try {
      console.log('[Notifications] Iniciando loadUsedVerses');
      const stored = localStorage.getItem(USED_VERSES_KEY);
      if (stored) {
        setUsedVerses(JSON.parse(stored));
      }
      console.log('[Notifications] Finalizou loadUsedVerses');
    } catch (error) {
      console.error('[DEBUG] Erro em loadUsedVerses:', error);
    }
  };

  const saveSchedules = (newSchedules: NotificationSchedule[]) => {
    try {
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(newSchedules));
      setSchedules(newSchedules);
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  };

  const saveUsedVerses = (newUsedVerses: Record<string, string[]>) => {
    try {
      localStorage.setItem(USED_VERSES_KEY, JSON.stringify(newUsedVerses));
      setUsedVerses(newUsedVerses);
    } catch (error) {
      console.error('Error saving used verses:', error);
    }
  };

  function getRandomFromArray(verses: Verse[], theme: string): Verse | null {
    if (verses.length === 0) return null;
    
    const themeVerses = verses.filter(v => v.tema === theme);
    if (themeVerses.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * themeVerses.length);
    return themeVerses[randomIndex];
  }

  const getRandomVerse = (theme: string, versesArg: Verse[]): Verse | null => {
    try {
      if (theme === "auto") {
        if (versesArg.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * versesArg.length);
        return versesArg[randomIndex];
      } else {
        return getRandomFromArray(versesArg, theme);
      }
    } catch (error) {
      console.error('Error getting random verse:', error);
      return null;
    }
  };
// Função para criar uma única notificação usando Cordova
const createSingleNotification = async (schedule: NotificationSchedule, day: number, versesArg: Verse[] = verses) => {
  try {
    if (!isMobile || !isCordovaAvailable()) {
      console.log('[Notifications] Tentativa de criar notificação em web ou Cordova não disponível - ignorando');
      return true;
    }

    const verse = getRandomVerse(schedule.theme, versesArg);
    if (!verse) {
      console.error(`[Notifications] Não foi possível encontrar versículo para tema: ${schedule.theme}`);
      return false;
    }

    const [hours, minutes] = schedule.time.split(':').map(Number);
    const notificationId = parseInt(schedule.id) + day;

    // Ajuste correto do dia da semana para o plugin Cordova
    const weekday = (day === 0) ? 7 : day;

    console.log(`[Notifications] Criando notificação ${notificationId} para horário: ${schedule.time}, dia: ${day}, tema: ${schedule.theme}`);

    // Configuração da notificação usando Cordova
    const notificationConfig = {
      id: notificationId,
      title: "Versículo do Dia",
      text: `${verse.referencia}: ${verse.texto}`,
      trigger: {
        every: { weekday: weekday, hour: hours, minute: minutes }
      },
      repeats: true, // ESSENCIAL: Mantém a notificação recorrente
      foreground: true,
      silent: false,
      sound: null,
      vibrate: true,
      // Configurações específicas do Android para garantir persistência
      androidAutoCancel: false, // Não cancela automaticamente
      androidOngoing: false, // Não é uma notificação persistente
      androidOnlyAlertOnce: false, // Permite múltiplas execuções
      data: {
        scheduleId: schedule.id,
        theme: schedule.theme,
        day: day
      }
    };

    // Criar notificação usando Cordova
    window.cordova!.plugins.notification.local.schedule(notificationConfig, (scheduled) => {
      if (scheduled) {
        console.log(`[Notifications] Notificação ${notificationId} agendada com sucesso via Cordova`);
      } else {
        console.error(`[Notifications] Falha ao agendar notificação ${notificationId} via Cordova`);
      }
    });

    return true;
  } catch (error) {
    console.error('Error creating single notification with Cordova:', error);
    return false;
  }
};

  const createNotification = async (schedule: NotificationSchedule, versesArg: Verse[] = verses) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        console.log('[Notifications] Tentativa de criar notificação em web ou Cordova não disponível - ignorando');
        return true;
      }

      const verse = getRandomVerse(schedule.theme, versesArg);
      if (!verse) {
        console.error(`[Notifications] Não foi possível encontrar versículo para tema: ${schedule.theme}`);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar um versículo para este tema.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`[Notifications] Criando notificação para horário: ${schedule.time}, dias: ${schedule.days}, tema: ${schedule.theme}`);
      
      // Primeiro, cancelar notificações existentes para este agendamento
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day;
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
            console.log(`[Notifications] Notificação existente ${notificationId} cancelada via Cordova`);
          });
        } catch (error) {
          // Ignorar erro se a notificação não existia
        }
      }
      
      // Criar novas notificações
      for (const day of schedule.days) {
        const success = await createSingleNotification(schedule, day, versesArg);
        if (!success) {
          console.error(`[Notifications] Falha ao criar notificação para dia ${day}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error creating notification with Cordova:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a notificação. Verifique as permissões do app.",
        variant: "destructive"
      });
      return false;
    }
  };

  const addSchedule = async (scheduleData: Omit<NotificationSchedule, 'id' | 'enabled' | 'createdAt'>) => {
    try {
      const newSchedule: NotificationSchedule = {
        id: Math.floor(Math.random() * 1000000).toString(),
        ...scheduleData,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      const newSchedules = [...schedules, newSchedule];
      saveSchedules(newSchedules);
      
      console.log(`[Notifications] Novo agendamento criado: ${newSchedule.id}`);
      
      const success = await createNotification(newSchedule, verses);
      
      if (success) {
        toast({
          title: "Agendamento criado",
          description: `Notificação agendada para ${newSchedule.days.length} dia(s) da semana.`,
        });
      }

      return success;
    } catch (error) {
      console.error('Error adding schedule:', error);
      return false;
    }
  };

  const toggleSchedule = async (schedule: NotificationSchedule) => {
    try {
      const newSchedules = schedules.map(s => 
        s.id === schedule.id ? { ...s, enabled: !s.enabled } : s
      );
      saveSchedules(newSchedules);

      if (!schedule.enabled) {
        // Ativando - criar notificações
        console.log(`[Notifications] Ativando agendamento: ${schedule.id}`);
        const success = await createNotification(schedule, verses);
        if (!success) {
          // Reverter se falhou
          saveSchedules(schedules);
          return false;
        }
      } else {
        // Desativando - cancelar notificações
        console.log(`[Notifications] Desativando agendamento: ${schedule.id}`);
        try {
          for (const day of schedule.days) {
            const notificationId = parseInt(schedule.id) + day;
            window.cordova!.plugins.notification.local.cancel(notificationId, () => {
              console.log(`[Notifications] Notificação ${notificationId} cancelada via Cordova`);
            });
          }
        } catch (error) {
          console.error('Error canceling notifications:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling schedule:', error);
      return false;
    }
  };

  const deleteSchedule = async (schedule: NotificationSchedule) => {
    try {
      console.log(`[Notifications] Deletando agendamento: ${schedule.id}`);
      
      // Cancelar notificações
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day;
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
            console.log(`[Notifications] Notificação ${notificationId} cancelada via Cordova`);
          });
        } catch (error) {
          console.error(`[Notifications] Erro ao cancelar notificação ${parseInt(schedule.id) + day}:`, error);
        }
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

  const resetAllNotifications = async () => {
    try {
      console.log('[Notifications] Iniciando reset de todas as notificações...');
      
      // Cancelar todas as notificações (só no mobile com Cordova)
      if (isMobile && isCordovaAvailable()) {
        window.cordova!.plugins.notification.local.cancelAll(() => {
          console.log('[Notifications] Todas as notificações canceladas via Cordova');
        });
      }
      
      // Limpar localStorage
      localStorage.removeItem(SCHEDULES_KEY);
      localStorage.removeItem(USED_VERSES_KEY);
      localStorage.removeItem(NOTIFICATION_STATE_KEY);
      
      // Resetar estado
      setSchedules([]);
      setUsedVerses({});
      
      // Resetar flag de inicialização
      initializationRef.current = false;
      
      console.log('[Notifications] Todas as notificações foram resetadas');
      
      toast({
        title: "Notificações resetadas",
        description: "Todas as notificações foram removidas. Você pode criar novos agendamentos.",
      });
      
      return true;
    } catch (error) {
      console.error('Error resetting notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar as notificações.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getNotificationStatus = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return { enabled: false, message: 'Notificações não disponíveis em web ou Cordova não disponível' };
      }

      return new Promise((resolve) => {
        window.cordova!.plugins.notification.local.hasPermission((granted) => {
          resolve({
            enabled: granted,
            message: granted ? 'Notificações habilitadas' : 'Permissão necessária'
          });
        });
      });
    } catch (error) {
      console.error('Error checking notification status:', error);
      return { enabled: false, message: 'Erro ao verificar permissões' };
    }
  };

  const testNotification = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        toast({
          title: "Teste não disponível",
          description: "Teste de notificação só funciona no app móvel com Cordova.",
          variant: "destructive"
        });
        return false;
      }

      console.log('[Notifications] Criando notificação de teste via Cordova...');
      
      // Agendar para 1 minuto no futuro
      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + 1);
      
      const testConfig = {
        id: 999999, // ID único para teste
        title: "Teste de Notificação",
        text: "Esta é uma notificação de teste. Se você vê isso, o sistema está funcionando!",
        trigger: {
          at: testTime
        },
        repeats: true, // Testar se a repetição funciona
        foreground: true
      };

      console.log(`[Notifications] Agendando teste para: ${testTime.toLocaleString()}`);

      window.cordova!.plugins.notification.local.schedule(testConfig, (scheduled) => {
        if (scheduled) {
          toast({
            title: "Teste agendado",
            description: "Uma notificação de teste aparecerá em 1 minuto.",
          });
        } else {
          toast({
            title: "Erro no teste",
            description: "Não foi possível criar a notificação de teste.",
            variant: "destructive"
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível criar a notificação de teste.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Função para verificar se as notificações estão sendo mantidas
  const checkNotificationPersistence = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        console.log('[Notifications] Verificação de persistência não disponível em web');
        return;
      }

      console.log('[Notifications] Verificando persistência das notificações...');
      
      // Verificar notificações pendentes
      window.cordova!.plugins.notification.local.getPending((notifications) => {
        console.log(`[Notifications] Notificações pendentes encontradas: ${notifications.length}`);
        notifications.forEach((notification: any) => {
          console.log(`[Notifications] Notificação pendente: ID ${notification.id}, próxima execução: ${notification.trigger?.at || 'repetitiva'}`);
        });
      });
    } catch (error) {
      console.error('Error checking notification persistence:', error);
    }
  };

  // Função para verificar se um agendamento específico ainda está ativo
  const verificarSeAgendamentoAindaAtivo = async (scheduleId: string) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return;
      }

      console.log(`[Notifications] Verificando se agendamento ${scheduleId} ainda está ativo...`);
      
      // Verificar notificações pendentes
      window.cordova!.plugins.notification.local.getPending((notifications) => {
        const agendamentoAtivo = notifications.some((notification: any) => 
          notification.data && notification.data.scheduleId === scheduleId
        );
        
        if (agendamentoAtivo) {
          console.log(`[Notifications] ✅ Agendamento ${scheduleId} ainda está ativo - notificação vai tocar na próxima semana`);
        } else {
          console.log(`[Notifications] ❌ Agendamento ${scheduleId} foi cancelado - precisa ser reativado`);
        }
      });
    } catch (error) {
      console.error('Error checking specific schedule:', error);
    }
  };

  return {
    schedules,
    verses,
    loading,
    isMobile,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
    formatDays,
    getThemeLabel,
    getActiveSchedulesCount,
    getAvailableThemesCount,
    getNotificationStatus,
    resetAllNotifications,
    testNotification,
    checkNotificationPersistence,
    verificarSeAgendamentoAindaAtivo,
    THEMES,
    DAYS_OF_WEEK,
  };
}; 