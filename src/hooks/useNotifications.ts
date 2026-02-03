import { useState, useEffect, useRef } from 'react';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import i18n, { normalizeLanguage } from '@/i18n';

const tx = (pt: string, en: string) => {
  const isEnglish = normalizeLanguage(i18n.resolvedLanguage || i18n.language) === 'en';
  return isEnglish ? en : pt;
};

// Declarações de tipo para Cordova Local Notifications
declare global {
  // Extender a interface CordovaPlugins para incluir notification
  interface CordovaPlugins {
    notification?: {
      local?: {
        schedule: (notification: any, callback: (scheduled: boolean) => void) => void;
        cancel: (id: number, callback: () => void) => void;
        cancelAll: (callback: () => void) => void;
        hasPermission: (callback: (granted: boolean) => void) => void;
        requestPermission: (callback: (granted: boolean) => void) => void;
        on: (event: string, callback: (notification: any) => void) => void;
        getPending: (callback: (notifications: any[]) => void) => void;
        getScheduled: (callback: (notifications: any[]) => void) => void;
        isScheduled: (id: number, callback: (scheduled: boolean) => void) => void;
        isTriggered: (id: number, callback: (triggered: boolean) => void) => void;
        getAll: (callback: (notifications: any[]) => void) => void;
        getIds: (callback: (ids: number[]) => void) => void;
        getTypes: (callback: (types: any) => void) => void;
        getDefaults: (callback: (defaults: any) => void) => void;
        setDefaults: (defaults: any, callback: () => void) => void;
        update: (notification: any, callback: (updated: boolean) => void) => void;
        clear: (id: number, callback: (cleared: boolean) => void) => void;
        clearAll: (callback: (cleared: boolean) => void) => void;
        isPresent: (id: number, callback: (present: boolean) => void) => void;
        add: (notification: any, callback: (added: boolean) => void) => void;
        remove: (id: number, callback: (removed: boolean) => void) => void;
        removeAll: (callback: (removed: boolean) => void) => void;
        registerPermission: (callback: (granted: boolean) => void) => void;
        off: (event: string, callback: (notification: any) => void) => void;
        fireEvent: (event: string, notification: any) => void;
        fireQueuedEvents: () => void;
      };
    };
  }

  // Extender Window para incluir Capacitor
  interface Window {
    Capacitor?: {
      App?: {
        openUrl: (options: { url: string }) => void;
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

// NOVA interface para agendamentos de oração
export interface PrayerSchedule {
  id: string;
  time: string;
  days: number[];
  enabled: boolean;
  createdAt: string;
  type: 'prayer';
}

export interface Verse {
  tema: string;
  referencia: string;
  texto: string;
}

const THEMES = [
  { value: "auto", label: "Automático" },
  { value: "amor", label: "Amor" },
  { value: "fé", label: "Fé" },
  { value: "esperança", label: "Esperança" },
  { value: "paz", label: "Paz" },
  { value: "perdão", label: "Perdão" },
  { value: "sabedoria", label: "Sabedoria" },
  { value: "força", label: "Força" },
  { value: "oração", label: "Oração" },
  { value: "confiança", label: "Confiança" },
  { value: "graça", label: "Graça" },
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
const PRAYER_SCHEDULES_KEY = 'prayer_schedules'; // NOVA chave
const USED_VERSES_KEY = 'used_verses';
const NOTIFICATION_STATE_KEY = 'notification_system_state';
const NOTIFICATION_META_KEY = 'notification_schedules_meta';

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
  
  
  return hasNotificationPlugin;
};

export const useNotifications = (options?: { enableInitialization?: boolean }) => {
  const enableInitialization = options?.enableInitialization ?? true;
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [prayerSchedules, setPrayerSchedules] = useState<PrayerSchedule[]>([]); // NOVO estado
  const [verses, setVerses] = useState<Verse[]>([]);
  const [usedVerses, setUsedVerses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const initializationRef = useRef(false);

  // Verificar se está no mobile
  useEffect(() => {
    checkPlatform();
  }, []);

  useEffect(() => {
    // Phase 5: refresh schedules when cross-device sync updates local storage.
    const handleSyncUpdate = () => {
      loadSchedules();
      loadPrayerSchedules();
    };
    window.addEventListener('notificationSchedulesUpdated', handleSyncUpdate as EventListener);
    return () => {
      window.removeEventListener('notificationSchedulesUpdated', handleSyncUpdate as EventListener);
    };
  }, []);

  const checkPlatform = async () => {
    try {
      const info = await Device.getInfo();
      setIsMobile(info.platform !== 'web');
    } catch (error) {
      setIsMobile(false);
    }
  };

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (!enableInitialization) return;
    if (isMobile === true && !initializationRef.current) {
      initializationRef.current = true;
      // Aguardar um pouco para garantir que o Cordova esteja carregado
      const timer = setTimeout(() => {
        initializeNotifications();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Verificar persistência das notificações quando o app é aberto
  useEffect(() => {
    if (!enableInitialization) return;
    if (isMobile) {
      const checkOnAppOpen = async () => {
        await checkNotificationPersistence();
        
        // Garantir que os listeners estejam configurados quando o app é aberto
        if (isCordovaAvailable()) {
          await setupNotificationListeners();
        } else {
          // Tentar novamente em 2 segundos
          setTimeout(async () => {
            if (isCordovaAvailable()) {
              await setupNotificationListeners();
            }
          }, 2000);
        }
      };
      const timer = setTimeout(checkOnAppOpen, 3000); // Aguardar 3 segundos para o Cordova carregar
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Função para obter estado atual do sistema
  const getNotificationState = (): NotificationState => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STATE_KEY);
      return stored ? JSON.parse(stored) : { isInitialized: false, lastInitialization: '', version: '4.0' };
    } catch (error) {
      return { isInitialized: false, lastInitialization: '', version: '4.0' };
    }
  };

  // Função para salvar estado atual do sistema
  const saveNotificationState = (state: Partial<NotificationState>) => {
    try {
      const currentState = getNotificationState();
      const newState = { ...currentState, ...state };
      localStorage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(newState));
    } catch (error) {
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
        
        if (isCordovaAvailable()) {
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
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
      const currentState = getNotificationState();
      
      // Verificar se já foi inicializado recentemente (últimas 24h)
      const lastInit = new Date(currentState.lastInitialization);
      const now = new Date();
      const hoursSinceLastInit = (now.getTime() - lastInit.getTime()) / (1000 * 60 * 60);
      
      if (currentState.isInitialized && hoursSinceLastInit < 24) {
        await loadSchedules();
        loadPrayerSchedules();
        await loadUsedVerses();
        await loadVerses();
        setLoading(false);
        return;
      }

      
      // Aguardar Cordova estar disponível
      const cordovaAvailable = await waitForCordova();
      if (!cordovaAvailable) {
        setLoading(false);
        return;
      }

      // Carregar dados
      await loadSchedules();
      loadPrayerSchedules(); // NOVA função
      await loadUsedVerses();
      await loadVerses();

      // Configurar sistema de notificações
      await requestPermissions();
      await setupNotificationListeners();

      // Marcar como inicializado
      saveNotificationState({
        isInitialized: true,
        lastInitialization: new Date().toISOString(),
        version: '4.0'
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const setupNotificationListeners = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) return;


      // Listener para quando uma notificação é recebida
      (window.cordova?.plugins as any)?.notification?.local?.on('trigger', (notification: any) => {
        // Marcar versículo como usado se necessário
        if (notification.data && notification.data.theme && notification.data.reference) {
          markVerseAsUsed(notification.data.theme, notification.data.reference);
        }
      });

      // Listener para quando uma notificação é clicada
      (window.cordova?.plugins as any)?.notification?.local?.on('click', (notification: any) => {
        // Verificar se é notificação de oração
        if (notification.data && notification.data.type === 'prayer') {
          // Redirecionar para home (sem parâmetros especiais)
          window.location.href = '/';
          return;
        }
        
        // Verificar se há dados de deep link na notificação (versículos)
        if (notification.data && notification.data.deeplink) {
          // Remover o deeplink salvo do localStorage (já foi usado)
          const deeplinkKey = `pendingDeeplink_${notification.id}`;
          localStorage.removeItem(deeplinkKey);
          
          // Tentar abrir o deep link usando Capacitor App
          if (window.Capacitor?.App) {
            try {
              window.Capacitor.App.openUrl({ url: notification.data.deeplink });
            } catch (error) {
              // Fallback: disparar evento manualmente
              window.dispatchEvent(new CustomEvent('appUrlOpen', { 
                detail: { url: notification.data.deeplink } 
              }));
            }
          } else {
            // Fallback: disparar evento manualmente
            window.dispatchEvent(new CustomEvent('appUrlOpen', { 
              detail: { url: notification.data.deeplink } 
            }));
          }
        }
      });

      // Listener para quando uma notificação é removida/cancelada
      (window.cordova?.plugins as any)?.notification?.local?.on('clear', (notification: any) => {
        // Limpar o deeplink salvo do localStorage quando a notificação é cancelada
        if (notification.id) {
          const deeplinkKey = `pendingDeeplink_${notification.id}`;
          localStorage.removeItem(deeplinkKey);
        }
      });
    } catch (error) {
    }
  };

  const requestPermissions = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return;
      }
      
      // Verificar permissões
      (window.cordova?.plugins as any)?.notification?.local?.hasPermission((granted: boolean) => {
        if (granted) {
          // Solicitar permissão para ignorar otimização de bateria
          requestBatteryOptimizationPermission();
        } else {
          (window.cordova?.plugins as any)?.notification?.local?.requestPermission((granted: boolean) => {
            if (granted) {
              // Solicitar permissão para ignorar otimização de bateria
              requestBatteryOptimizationPermission();
            } else {
              toast({
                title: tx("Permissão necessária", "Permission required"),
                description: tx("Para receber notificações, é necessário permitir o acesso nas configurações do app.", "To receive notifications, you must allow access in app settings."),
                variant: "destructive"
              });
            }
          });
        }
      });
    } catch (error) {
      toast({
        title: tx("Erro de permissão", "Permission error"),
        description: tx("Não foi possível solicitar permissões de notificação.", "Could not request notification permissions."),
        variant: "destructive"
      });
    }
  };

  const requestBatteryOptimizationPermission = () => {
    try {
      // Verificar se o dispositivo tem Android 6+ (API 23+)
      if (window.cordova?.platformId === 'android') {
        // Mostrar instrucoes para o usuario
        toast({
          title: tx("Otimiza\u00e7\u00e3o de Bateria", "Battery Optimization"),
          description: tx(
            "Para notifica\u00e7\u00f5es precisas, desative a otimiza\u00e7\u00e3o de bateria para este app nas configura\u00e7\u00f5es.",
            "For reliable notifications, disable battery optimization for this app in system settings."
          ),
          duration: 5000
        });
      }
    } catch (error) {
    }
  };

  const loadSchedules = () => {
    try {
      const stored = localStorage.getItem(SCHEDULES_KEY);
      if (stored) {
        const loadedSchedules = JSON.parse(stored);
        setSchedules(loadedSchedules);
      }
    } catch (error) {
    }
  };

  // NOVA função para carregar agendamentos de oração
  const loadPrayerSchedules = () => {
    try {
      const stored = localStorage.getItem(PRAYER_SCHEDULES_KEY);
      if (stored) {
        const loadedPrayerSchedules = JSON.parse(stored);
        setPrayerSchedules(loadedPrayerSchedules);
      }
    } catch (error) {
    }
  };

  const loadVerses = async (): Promise<Verse[]> => {
    try {
      const response = await fetch('/data/versiculos_por_tema_com_texto.json');
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      
      // Verificar se data é um array direto ou tem propriedade versiculos
      const loadedVerses = Array.isArray(data) ? data : (data.versiculos || []);
      
      // Verificar estrutura dos primeiros itens
      if (loadedVerses.length > 0) {
        const firstVerse = loadedVerses[0];
      }
      
      setVerses(loadedVerses);
      return loadedVerses;
    } catch (error) {
      return [];
    }
  };

  const loadUsedVerses = () => {
    try {
      const stored = localStorage.getItem(USED_VERSES_KEY);
      if (stored) {
        const loadedUsedVerses = JSON.parse(stored);
        setUsedVerses(loadedUsedVerses);
      }
    } catch (error) {
    }
  };

  const saveSchedules = (newSchedules: NotificationSchedule[]) => {
    try {
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(newSchedules));
      // Phase 5: bump local meta so cross-device sync has a timestamp.
      localStorage.setItem(
        NOTIFICATION_META_KEY,
        JSON.stringify({ updated_at: new Date().toISOString() })
      );
      setSchedules(newSchedules);
      // Phase 5: push schedules to Supabase when logged in.
      if (user?.id) {
        supabase
          .from('notification_schedules')
          .upsert(
            {
              user_id: user.id,
              schedules: newSchedules,
              prayer_schedules: prayerSchedules,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .then()
          .catch(() => {});
      }
    } catch (error) {
    }
  };

  // NOVA função para salvar agendamentos de oração
  const savePrayerSchedules = (newPrayerSchedules: PrayerSchedule[]) => {
    try {
      localStorage.setItem(PRAYER_SCHEDULES_KEY, JSON.stringify(newPrayerSchedules));
      // Phase 5: bump local meta so cross-device sync has a timestamp.
      localStorage.setItem(
        NOTIFICATION_META_KEY,
        JSON.stringify({ updated_at: new Date().toISOString() })
      );
      setPrayerSchedules(newPrayerSchedules);
      // Phase 5: push schedules to Supabase when logged in.
      if (user?.id) {
        supabase
          .from('notification_schedules')
          .upsert(
            {
              user_id: user.id,
              schedules: schedules,
              prayer_schedules: newPrayerSchedules,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .then()
          .catch(() => {});
      }
    } catch (error) {
    }
  };

  const saveUsedVerses = (newUsedVerses: Record<string, string[]>) => {
    try {
      localStorage.setItem(USED_VERSES_KEY, JSON.stringify(newUsedVerses));
      setUsedVerses(newUsedVerses);
    } catch (error) {
    }
  };

  function getRandomFromArray(verses: Verse[], theme: string): Verse | null {
    try {
      const themeVerses = verses.filter(v => v.tema === theme);
      
      if (themeVerses.length === 0) {
        return null;
      }
      
      const usedVersesForTheme = usedVerses[theme] || [];
      
      const availableVerses = themeVerses.filter(v => !usedVersesForTheme.includes(v.referencia));
      
      if (availableVerses.length === 0) {
        // Reset se todos foram usados
        const randomVerse = themeVerses[Math.floor(Math.random() * themeVerses.length)];
        return randomVerse;
      }

      const selectedVerse = availableVerses[Math.floor(Math.random() * availableVerses.length)];
      return selectedVerse;
    } catch (error) {
      return null;
    }
  }

  const getRandomVerse = (theme: string, versesArg: Verse[]): Verse | null => {
    try {
      
      if (theme === 'auto') {
        if (versesArg.length === 0) {
          return null;
        }
        
        const allThemes = [...new Set(versesArg.map(v => v.tema))];
        
        if (allThemes.length === 0) {
          return null;
        }
        
        const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
        
        const result = getRandomFromArray(versesArg, randomTheme);
        return result;
      } else {
        const result = getRandomFromArray(versesArg, theme);
        return result;
      }
    } catch (error) {
      return null;
    }
  };

  // Converte de 0 (domingo em JavaScript) para 7 (domingo em Cordova)
  const convertToCordovaWeekday = (day: number): number => {
    return day === 0 ? 7 : day;
  };

  const createSingleNotification = async (schedule: NotificationSchedule, day: number, versesArg: Verse[] = verses) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return true;
      }

      const verse = getRandomVerse(schedule.theme, versesArg);
      if (!verse) {
        return false;
      }

      const [hours, minutes] = schedule.time.split(':').map(Number);
      const notificationId = parseInt(schedule.id) + day;
      const weekday = convertToCordovaWeekday(day);

      // Para tema "auto", usar o tema real do versículo selecionado
      const actualTheme = schedule.theme === 'auto' ? verse.tema : schedule.theme;


      // Configuração da notificação usando Cordova Local Notifications
      const notificationConfig = {
        id: notificationId,
        title: tx("Versículo do Dia", "Verse of the Day"),
        text: `${verse.referencia}: ${verse.texto}`,
        trigger: {
          every: {
            weekday,
            hour: hours,
            minute: minutes
          }
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
        // Configurações para notificações precisas
        androidPriority: 1, // PRIORITY_HIGH
        androidImportance: 4, // IMPORTANCE_HIGH
        androidVisibility: 1, // VISIBILITY_PUBLIC
        androidChannelId: 'versiculos',
        androidChannelName: tx('Versículos Bíblicos', 'Bible Verses'),
        androidChannelDescription: tx('Notificações de versículos agendados', 'Scheduled verse notifications'),
        androidChannelImportance: 4, // IMPORTANCE_HIGH
        androidChannelShowBadge: true,
        androidChannelEnableVibration: true,
        androidChannelEnableLights: true,
        androidChannelLightColor: '#FF0000',
        androidChannelSound: null,
        androidChannelVibrationPattern: [0, 1000, 500, 1000],
        data: {
          scheduleId: schedule.id,
          theme: actualTheme, // Usar o tema real do versículo
          day: day,
          reference: verse.referencia,
          versiculoId: verse.referencia.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '-'),
          deeplink: `conexaodeus://versiculo-do-dia?theme=${actualTheme}&versiculoId=${verse.referencia.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '-')}`
        }
      };

      // Criar notificação usando Cordova
      (window.cordova?.plugins as any)?.notification?.local?.schedule(notificationConfig, (scheduled: boolean) => {
        if (scheduled) {
          // Salvar o deeplink no localStorage para caso o app esteja fechado quando a notificação for clicada
          const deeplink = notificationConfig.data.deeplink;
          const deeplinkKey = `pendingDeeplink_${notificationId}`;
          localStorage.setItem(deeplinkKey, deeplink);
        } else {
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  // NOVA função para criar notificação de oração
  const createSinglePrayerNotification = async (schedule: PrayerSchedule, day: number) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return true;
      }

      const [hours, minutes] = schedule.time.split(':').map(Number);
      const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
      const weekday = convertToCordovaWeekday(day);


      // Configuração da notificação de oração usando Cordova Local Notifications
      const notificationConfig = {
        id: notificationId,
        title: tx("Hora de Orar", "Time to Pray"),
        text: tx("É um bom momento para fazer uma oração e conectar-se com Deus.", "This is a good moment to pray and connect with God."),
        trigger: {
          every: {
            weekday,
            hour: hours,
            minute: minutes
          }
        },
        repeats: true,
        foreground: true,
        silent: false,
        sound: null,
        vibrate: true,
        // Configurações específicas do Android para garantir persistência
        androidAutoCancel: false,
        androidOngoing: false,
        androidOnlyAlertOnce: false,
        androidPriority: 1, // PRIORITY_HIGH
        androidImportance: 4, // IMPORTANCE_HIGH
        androidVisibility: 1, // VISIBILITY_PUBLIC
        androidChannelId: 'oracoes',
        androidChannelName: tx('Lembretes de Oração', 'Prayer Reminders'),
        androidChannelDescription: tx('Notificações de lembretes de oração', 'Prayer reminder notifications'),
        androidChannelImportance: 4, // IMPORTANCE_HIGH
        androidChannelShowBadge: true,
        androidChannelEnableVibration: true,
        androidChannelEnableLights: true,
        androidChannelLightColor: '#00FF00',
        androidChannelSound: null,
        androidChannelVibrationPattern: [0, 1000, 500, 1000],
        data: {
          scheduleId: schedule.id,
          type: 'prayer',
          day: day,
          deeplink: 'conexaodeus://home' // Redireciona para home
        }
      };

      // Criar notificação usando Cordova
      (window.cordova?.plugins as any)?.notification?.local?.schedule(notificationConfig, (scheduled: boolean) => {
        if (scheduled) {
          
          // Salvar o deeplink no localStorage
          const deeplink = notificationConfig.data.deeplink;
          const deeplinkKey = `pendingDeeplink_${notificationId}`;
          localStorage.setItem(deeplinkKey, deeplink);
        } else {
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  };



  const createNotification = async (schedule: NotificationSchedule, versesArg: Verse[] = verses) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return true;
      }

      const verse = getRandomVerse(schedule.theme, versesArg);
      if (!verse) {
        toast({
          title: tx("Erro", "Error"),
          description: tx("Não foi possível encontrar um versículo para este tema.", "Could not find a verse for this theme."),
          variant: "destructive"
        });
        return false;
      }

      
      // Primeiro, cancelar notificações existentes para este agendamento
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day;
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
          });
        } catch (error) {
          // Ignorar erro se a notificação não existia
        }
      }
      
      // Criar novas notificações
      for (const day of schedule.days) {
        const success = await createSingleNotification(schedule, day, versesArg);
        if (!success) {
        }
      }

      return true;
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível criar a notificação. Verifique as permissões do app.", "Could not create the notification. Check app permissions."),
        variant: "destructive"
      });
      return false;
    }
  };

  const markVerseAsUsed = (theme: string, reference: string) => {
    try {
      const currentUsed = { ...usedVerses };
      if (!currentUsed[theme]) {
        currentUsed[theme] = [];
      }
      currentUsed[theme].push(reference);
      setUsedVerses(currentUsed);
      saveUsedVerses(currentUsed);
    } catch (error) {
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
      
      
      const success = await createNotification(newSchedule, verses);
      
      if (success) {
        toast({
          title: tx("Agendamento criado", "Schedule created"),
          description: tx(`Notificação agendada para ${newSchedule.days.length} dia(s) da semana.`, `Notification scheduled for ${newSchedule.days.length} day(s) of the week.`),
        });
      }

      return success;
    } catch (error) {
      return false;
    }
  };

  // NOVA função para adicionar agendamento de oração
  const addPrayerSchedule = async (scheduleData: Omit<PrayerSchedule, 'id' | 'enabled' | 'createdAt' | 'type'>) => {
    try {
      const newSchedule: PrayerSchedule = {
        id: Math.floor(Math.random() * 1000000).toString(),
        ...scheduleData,
        enabled: true,
        createdAt: new Date().toISOString(),
        type: 'prayer',
      };

      const newPrayerSchedules = [...prayerSchedules, newSchedule];
      savePrayerSchedules(newPrayerSchedules);
      
      
      const success = await createPrayerNotification(newSchedule);
      
      if (success) {
        toast({
          title: tx("Lembrete de oração criado", "Prayer reminder created"),
          description: tx(`Lembrete agendado para ${newSchedule.days.length} dia(s) da semana.`, `Reminder scheduled for ${newSchedule.days.length} day(s) of the week.`),
        });
      }

      return success;
    } catch (error) {
      return false;
    }
  };

  // NOVA função para criar notificação de oração
  const createPrayerNotification = async (schedule: PrayerSchedule) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return true;
      }

      
      // Primeiro, cancelar notificações existentes para este agendamento
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
          });
        } catch (error) {
          // Ignorar erro se a notificação não existia
        }
      }
      
      // Criar novas notificações
      for (const day of schedule.days) {
        const success = await createSinglePrayerNotification(schedule, day);
        if (!success) {
        }
      }

      return true;
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível criar o lembrete de oração. Verifique as permissões do app.", "Could not create the prayer reminder. Check app permissions."),
        variant: "destructive"
      });
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
        const success = await createNotification(schedule, verses);
        if (!success) {
          // Reverter se falhou
          saveSchedules(schedules);
          return false;
        }
      } else {
        // Desativando - cancelar notificações
        try {
          for (const day of schedule.days) {
            const notificationId = parseInt(schedule.id) + day;
            window.cordova!.plugins.notification.local.cancel(notificationId, () => {
            });
          }
        } catch (error) {
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteSchedule = async (schedule: NotificationSchedule) => {
    try {
      
      // Cancelar notificações
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day;
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
          });
        } catch (error) {
        }
      }

      const newSchedules = schedules.filter(s => s.id !== schedule.id);
      saveSchedules(newSchedules);

      toast({
        title: tx("Agendamento removido", "Schedule removed"),
        description: tx("O agendamento foi removido com sucesso.", "The schedule was removed successfully."),
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  // NOVA função para alternar agendamento de oração
  const togglePrayerSchedule = async (schedule: PrayerSchedule) => {
    try {
      const newPrayerSchedules = prayerSchedules.map(s => 
        s.id === schedule.id ? { ...s, enabled: !s.enabled } : s
      );
      savePrayerSchedules(newPrayerSchedules);

      if (!schedule.enabled) {
        // Ativando - criar notificações
        const success = await createPrayerNotification(schedule);
        if (!success) {
          // Reverter se falhou
          savePrayerSchedules(prayerSchedules);
          return false;
        }
      } else {
        // Desativando - cancelar notificações
        try {
          for (const day of schedule.days) {
            const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
            window.cordova!.plugins.notification.local.cancel(notificationId, () => {
            });
          }
        } catch (error) {
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // NOVA função para deletar agendamento de oração
  const deletePrayerSchedule = async (schedule: PrayerSchedule) => {
    try {
      
      // Cancelar notificações
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
          });
        } catch (error) {
        }
      }

      const newPrayerSchedules = prayerSchedules.filter(s => s.id !== schedule.id);
      savePrayerSchedules(newPrayerSchedules);

      toast({
        title: tx("Lembrete de oração removido", "Prayer reminder removed"),
        description: tx("O lembrete de oração foi removido com sucesso.", "The prayer reminder was removed successfully."),
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const formatDays = (days: number[]) => {
    const isEnglish = normalizeLanguage(i18n.resolvedLanguage || i18n.language) === 'en';
    const pt = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const labels = isEnglish ? en : pt;
    return days.map((day) => labels[day] || "").filter(Boolean).join(', ');
  };

  const getDayShortLabel = (day: number) => {
    const isEnglish = normalizeLanguage(i18n.resolvedLanguage || i18n.language) === 'en';
    const pt = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (isEnglish ? en : pt)[day] ?? "";
  };

  const getThemeLabel = (theme: string) => {
    const ptToEn: Record<string, string> = {
      "Automático": "Automatic",
      "Amor": "Love",
      "Fé": "Faith",
      "Esperança": "Hope",
      "Paz": "Peace",
      "Perdão": "Forgiveness",
      "Sabedoria": "Wisdom",
      "Força": "Strength",
      "Oração": "Prayer",
      "Confiança": "Trust",
      "Graça": "Grace",
    };
    const label = THEMES.find(t => t.value === theme)?.label || theme;
    const isEnglish = normalizeLanguage(i18n.resolvedLanguage || i18n.language) === 'en';
    return isEnglish ? (ptToEn[label] || label) : label;
  };

  const getActiveSchedulesCount = () => {
    return schedules.filter(s => s.enabled).length;
  };

  // NOVA função para contar agendamentos de oração ativos
  const getActivePrayerSchedulesCount = () => {
    return prayerSchedules.filter(s => s.enabled).length;
  };

  const getAvailableThemesCount = () => {
    return THEMES.length - 1; // Excluir "auto"
  };

  const resetAllNotifications = async () => {
    try {
      
      // Cancelar todas as notificações (só no mobile com Cordova)
      if (isMobile && isCordovaAvailable()) {
        window.cordova!.plugins.notification.local.cancelAll(() => {
        });
      }
      
      // Limpar localStorage
      localStorage.removeItem(SCHEDULES_KEY);
      localStorage.removeItem(PRAYER_SCHEDULES_KEY); // NOVA chave
      localStorage.removeItem(USED_VERSES_KEY);
      localStorage.removeItem(NOTIFICATION_STATE_KEY);
      localStorage.removeItem(NOTIFICATION_META_KEY);
      
      // Resetar estado
      setSchedules([]);
      setPrayerSchedules([]); // NOVO estado
      setUsedVerses({});
      
      // Resetar flag de inicialização
      initializationRef.current = false;

      // Phase 5: ensure cross-device sync does not rehydrate old schedules.
      const clearedAt = new Date().toISOString();
      localStorage.setItem(NOTIFICATION_META_KEY, JSON.stringify({ updated_at: clearedAt }));
      if (user?.id) {
        supabase
          .from('notification_schedules')
          .upsert(
            {
              user_id: user.id,
              schedules: [],
              prayer_schedules: [],
              updated_at: clearedAt,
            },
            { onConflict: 'user_id' }
          )
          .then()
          .catch(() => {});
      }
      
      
      toast({
        title: tx("Notificações resetadas", "Notifications reset"),
        description: tx("Todas as notificações foram removidas. Você pode criar novos agendamentos.", "All notifications were removed. You can create new schedules."),
      });
      
      return true;
    } catch (error) {
      toast({
        title: tx("Erro", "Error"),
        description: tx("Não foi possível resetar as notificações.", "Could not reset notifications."),
        variant: "destructive"
      });
      return false;
    }
  };

  const getNotificationStatus = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return { enabled: false, message: tx('Notificações não disponíveis em web ou Cordova não disponível', 'Notifications are unavailable on web or Cordova is not available') };
      }

      return new Promise((resolve) => {
        window.cordova!.plugins.notification.local.hasPermission((granted) => {
          resolve({
            enabled: granted,
            message: granted ? tx('Notificações habilitadas', 'Notifications enabled') : tx('Permissão necessária', 'Permission required')
          });
        });
      });
    } catch (error) {
      return { enabled: false, message: tx('Erro ao verificar permissões', 'Error checking permissions') };
    }
  };

  const testNotification = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        toast({
          title: tx("Teste não disponível", "Test unavailable"),
          description: tx("Teste de notificação só funciona no app móvel com Cordova.", "Notification test only works in the mobile app with Cordova."),
          variant: "destructive"
        });
        return false;
      }

      
      // Agendar para 1 minuto no futuro
      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + 1);
      
      const testConfig = {
        id: 999999, // ID único para teste
        title: tx("Teste de Notificação", "Notification Test"),
        text: tx("Esta é uma notificação de teste. Se você vê isso, o sistema está funcionando!", "This is a test notification. If you can see this, the system is working!"),
        trigger: {
          at: testTime
        },
        repeats: false, // Não repetir para teste
        foreground: true
      };


      window.cordova!.plugins.notification.local.schedule(testConfig, (scheduled) => {
        if (scheduled) {
          toast({
            title: tx("Teste agendado", "Test scheduled"),
            description: tx("Uma notificação de teste aparecerá em 1 minuto.", "A test notification will appear in 1 minute."),
          });
        } else {
          toast({
            title: tx("Erro no teste", "Test error"),
            description: tx("Não foi possível criar a notificação de teste.", "Could not create the test notification."),
            variant: "destructive"
          });
        }
      });

      return true;
    } catch (error) {
      toast({
        title: tx("Erro no teste", "Test error"),
        description: tx("Não foi possível criar a notificação de teste.", "Could not create the test notification."),
        variant: "destructive"
      });
      return false;
    }
  };

  const checkNotificationPersistence = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        return;
      }

      
      // Verificar notificações agendadas
      window.cordova!.plugins.notification.local.getScheduled((notifications) => {
        notifications.forEach((notification: any) => {
        });
      });
    } catch (error) {
    }
  };

  return {
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
    getNotificationStatus,
    resetAllNotifications,
    testNotification,
    checkNotificationPersistence,
    THEMES,
    DAYS_OF_WEEK,
    getDayShortLabel,
  };
}; 
