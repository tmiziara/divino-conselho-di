import { useState, useEffect, useRef } from 'react';
import { Device } from '@capacitor/device';
import { useToast } from '@/hooks/use-toast';

console.log('[DEBUG] Início do arquivo useNotifications.ts');

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
  
  console.log('[Notifications] Verificação Cordova Local Notifications:', {
    hasWindow,
    hasCordova,
    hasNotificationPlugin,
    cordovaExists: hasWindow ? !!window.cordova : false,
    pluginsExists: hasCordova ? !!window.cordova?.plugins : false,
    notificationExists: hasCordova ? !!window.cordova?.plugins?.notification : false,
    localExists: hasCordova ? !!window.cordova?.plugins?.notification?.local : false,
    windowKeys: hasWindow ? Object.keys(window).filter(k => k.includes('cordova') || k.includes('plugin')) : []
  });
  
  return hasNotificationPlugin;
};

export const useNotifications = () => {
  console.log('[DEBUG] Início do hook useNotifications');
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
        
        // Garantir que os listeners estejam configurados quando o app é aberto
        if (isCordovaAvailable()) {
          console.log('[Notifications] Cordova disponível, configurando listeners...');
          await setupNotificationListeners();
        } else {
          console.log('[Notifications] Cordova não disponível ainda, aguardando...');
          // Tentar novamente em 2 segundos
          setTimeout(async () => {
            if (isCordovaAvailable()) {
              console.log('[Notifications] Cordova agora disponível, configurando listeners...');
              await setupNotificationListeners();
            }
          }, 2000);
        }
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
      return stored ? JSON.parse(stored) : { isInitialized: false, lastInitialization: '', version: '4.0' };
    } catch (error) {
      console.error('[DEBUG] Erro em getNotificationState:', error);
      return { isInitialized: false, lastInitialization: '', version: '4.0' };
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
        console.log(`[Notifications] Tentativa ${attempts}/${maxAttempts} de detectar Cordova Local Notifications...`);
        
        if (isCordovaAvailable()) {
          console.log('[Notifications] Cordova Local Notifications detectado com sucesso!');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log('[Notifications] Timeout aguardando Cordova Local Notifications');
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
        console.log('[Notifications] Antes de loadPrayerSchedules');
        loadPrayerSchedules();
        console.log('[Notifications] Depois de loadPrayerSchedules');
        console.log('[Notifications] Antes de loadUsedVerses');
        await loadUsedVerses();
        console.log('[Notifications] Depois de loadUsedVerses');
        console.log('[Notifications] Antes de loadVerses');
        await loadVerses();
        console.log('[Notifications] Depois de loadVerses');
        setLoading(false);
        return;
      }

      console.log('[Notifications] Inicializando sistema de notificações com Local Notifications...');
      
      // Aguardar Cordova estar disponível
      const cordovaAvailable = await waitForCordova();
      if (!cordovaAvailable) {
        console.log('[Notifications] Cordova não disponível, usando modo web');
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
      console.log('[Notifications] Sistema inicializado com sucesso usando Local Notifications');
    } catch (error) {
      console.error('[Notifications] Erro na inicialização:', error);
      setLoading(false);
    }
  };

  const setupNotificationListeners = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) return;

      console.log('[Notifications] Configurando listeners de notificação Cordova...');

      // Listener para quando uma notificação é recebida
      (window.cordova?.plugins as any)?.notification?.local?.on('trigger', (notification: any) => {
        console.log('[Notifications] Notificação recebida:', notification);
        // Marcar versículo como usado se necessário
        if (notification.data && notification.data.theme && notification.data.reference) {
          markVerseAsUsed(notification.data.theme, notification.data.reference);
        }
      });

      // Listener para quando uma notificação é clicada
      (window.cordova?.plugins as any)?.notification?.local?.on('click', (notification: any) => {
        console.log('[Notifications] Notificação clicada:', notification);
        
        // Verificar se é notificação de oração
        if (notification.data && notification.data.type === 'prayer') {
          console.log('[Notifications] Notificação de oração clicada, redirecionando para home');
          // Redirecionar para home (sem parâmetros especiais)
          window.location.href = '/';
          return;
        }
        
        // Verificar se há dados de deep link na notificação (versículos)
        if (notification.data && notification.data.deeplink) {
          console.log('[Notifications] Deep link encontrado:', notification.data.deeplink);
          
          // Remover o deeplink salvo do localStorage (já foi usado)
          const deeplinkKey = `pendingDeeplink_${notification.id}`;
          localStorage.removeItem(deeplinkKey);
          console.log('[Notifications] Deeplink removido do localStorage:', deeplinkKey);
          
          // Tentar abrir o deep link usando Capacitor App
          if (window.Capacitor?.App) {
            try {
              window.Capacitor.App.openUrl({ url: notification.data.deeplink });
              console.log('[Notifications] Deep link aberto via Capacitor App');
            } catch (error) {
              console.error('[Notifications] Erro ao abrir deep link via Capacitor:', error);
              // Fallback: disparar evento manualmente
              window.dispatchEvent(new CustomEvent('appUrlOpen', { 
                detail: { url: notification.data.deeplink } 
              }));
            }
          } else {
            // Fallback: disparar evento manualmente
            console.log('[Notifications] Capacitor não disponível, disparando evento manual');
            window.dispatchEvent(new CustomEvent('appUrlOpen', { 
              detail: { url: notification.data.deeplink } 
            }));
          }
        } else {
          console.log('[Notifications] Nenhum deep link encontrado na notificação');
        }
      });

      // Listener para quando uma notificação é removida/cancelada
      (window.cordova?.plugins as any)?.notification?.local?.on('clear', (notification: any) => {
        console.log('[Notifications] Notificação removida/cancelada:', notification);
        
        // Limpar o deeplink salvo do localStorage quando a notificação é cancelada
        if (notification.id) {
          const deeplinkKey = `pendingDeeplink_${notification.id}`;
          localStorage.removeItem(deeplinkKey);
          console.log('[Notifications] Deeplink removido do localStorage (notificação cancelada):', deeplinkKey);
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
      (window.cordova?.plugins as any)?.notification?.local?.hasPermission((granted: boolean) => {
        if (granted) {
          console.log('[Notifications] Permissões já concedidas');
          // Solicitar permissão para ignorar otimização de bateria
          requestBatteryOptimizationPermission();
        } else {
          console.log('[Notifications] Solicitando permissões...');
          (window.cordova?.plugins as any)?.notification?.local?.requestPermission((granted: boolean) => {
            if (granted) {
              console.log('[Notifications] Permissões concedidas com sucesso');
              // Solicitar permissão para ignorar otimização de bateria
              requestBatteryOptimizationPermission();
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

  const requestBatteryOptimizationPermission = () => {
    try {
      // Verificar se o dispositivo tem Android 6+ (API 23+)
      if (window.cordova?.platformId === 'android') {
        console.log('[Notifications] Verificando permissões de otimização de bateria...');
        
        // Mostrar instruções para o usuário
        toast({
          title: "Otimização de Bateria",
          description: "Para notificações precisas, desative a otimização de bateria para este app nas configurações.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('[Notifications] Erro ao verificar permissões de bateria:', error);
    }
  };

  const loadSchedules = () => {
    try {
      const stored = localStorage.getItem(SCHEDULES_KEY);
      if (stored) {
        const loadedSchedules = JSON.parse(stored);
        setSchedules(loadedSchedules);
        console.log(`[Notifications] Carregados ${loadedSchedules.length} agendamentos`);
      }
    } catch (error) {
      console.error('[Notifications] Erro ao carregar agendamentos:', error);
    }
  };

  // NOVA função para carregar agendamentos de oração
  const loadPrayerSchedules = () => {
    try {
      const stored = localStorage.getItem(PRAYER_SCHEDULES_KEY);
      if (stored) {
        const loadedPrayerSchedules = JSON.parse(stored);
        setPrayerSchedules(loadedPrayerSchedules);
        console.log(`[Notifications] Carregados ${loadedPrayerSchedules.length} agendamentos de oração`);
      }
    } catch (error) {
      console.error('[Notifications] Erro ao carregar agendamentos de oração:', error);
    }
  };

  const loadVerses = async (): Promise<Verse[]> => {
    try {
      console.log('[DEBUG] loadVerses: Iniciando carregamento de versículos...');
      const response = await fetch('/data/versiculos_por_tema_com_texto.json');
      
      if (!response.ok) {
        console.error(`[DEBUG] loadVerses: Erro na resposta HTTP: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      console.log('[DEBUG] loadVerses: Dados brutos carregados:', typeof data, Array.isArray(data) ? `Array com ${data.length} itens` : 'Não é array');
      
      // Verificar se data é um array direto ou tem propriedade versiculos
      const loadedVerses = Array.isArray(data) ? data : (data.versiculos || []);
      console.log(`[DEBUG] loadVerses: Versículos processados: ${loadedVerses.length} itens`);
      
      // Verificar estrutura dos primeiros itens
      if (loadedVerses.length > 0) {
        const firstVerse = loadedVerses[0];
        console.log('[DEBUG] loadVerses: Estrutura do primeiro versículo:', {
          hasTema: 'tema' in firstVerse,
          hasReferencia: 'referencia' in firstVerse,
          hasTexto: 'texto' in firstVerse,
          tema: firstVerse.tema,
          referencia: firstVerse.referencia
        });
      }
      
      setVerses(loadedVerses);
      console.log(`[Notifications] Carregados ${loadedVerses.length} versículos`);
      return loadedVerses;
    } catch (error) {
      console.error('[Notifications] Erro ao carregar versículos:', error);
      return [];
    }
  };

  const loadUsedVerses = () => {
    try {
      const stored = localStorage.getItem(USED_VERSES_KEY);
      if (stored) {
        const loadedUsedVerses = JSON.parse(stored);
        setUsedVerses(loadedUsedVerses);
        console.log('[Notifications] Versículos usados carregados');
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

  // NOVA função para salvar agendamentos de oração
  const savePrayerSchedules = (newPrayerSchedules: PrayerSchedule[]) => {
    try {
      localStorage.setItem(PRAYER_SCHEDULES_KEY, JSON.stringify(newPrayerSchedules));
      setPrayerSchedules(newPrayerSchedules);
    } catch (error) {
      console.error('[Notifications] Erro ao salvar agendamentos de oração:', error);
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

  function getRandomFromArray(verses: Verse[], theme: string): Verse | null {
    try {
      console.log(`[DEBUG] getRandomFromArray: Buscando versículos para tema: ${theme}`);
      console.log(`[DEBUG] getRandomFromArray: Total de versículos disponíveis: ${verses.length}`);
      
      const themeVerses = verses.filter(v => v.tema === theme);
      console.log(`[DEBUG] getRandomFromArray: Versículos encontrados para tema ${theme}: ${themeVerses.length}`);
      
      if (themeVerses.length === 0) {
        console.error(`[DEBUG] getRandomFromArray: Nenhum versículo encontrado para tema: ${theme}`);
        return null;
      }
      
      const usedVersesForTheme = usedVerses[theme] || [];
      console.log(`[DEBUG] getRandomFromArray: Versículos já usados para tema ${theme}: ${usedVersesForTheme.length}`);
      
      const availableVerses = themeVerses.filter(v => !usedVersesForTheme.includes(v.referencia));
      console.log(`[DEBUG] getRandomFromArray: Versículos disponíveis para tema ${theme}: ${availableVerses.length}`);
      
      if (availableVerses.length === 0) {
        // Reset se todos foram usados
        console.log(`[DEBUG] getRandomFromArray: Todos os versículos do tema ${theme} foram usados, resetando...`);
        const randomVerse = themeVerses[Math.floor(Math.random() * themeVerses.length)];
        console.log(`[DEBUG] getRandomFromArray: Versículo selecionado após reset:`, randomVerse?.referencia);
        return randomVerse;
      }
      
      const selectedVerse = availableVerses[Math.floor(Math.random() * availableVerses.length)];
      console.log(`[DEBUG] getRandomFromArray: Versículo selecionado:`, selectedVerse?.referencia);
      return selectedVerse;
    } catch (error) {
      console.error('[DEBUG] getRandomFromArray: Erro ao obter versículo do array:', error);
      return null;
    }
  }

  const getRandomVerse = (theme: string, versesArg: Verse[]): Verse | null => {
    try {
      console.log(`[DEBUG] getRandomVerse chamado com tema: ${theme}, total de versículos: ${versesArg.length}`);
      
      if (theme === 'auto') {
        if (versesArg.length === 0) {
          console.error('[DEBUG] getRandomVerse: Array de versículos vazio para tema auto');
          return null;
        }
        
        const allThemes = [...new Set(versesArg.map(v => v.tema))];
        console.log(`[DEBUG] getRandomVerse: Temas disponíveis para auto: ${allThemes.join(', ')}`);
        
        if (allThemes.length === 0) {
          console.error('[DEBUG] getRandomVerse: Nenhum tema encontrado para auto');
          return null;
        }
        
        const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
        console.log(`[DEBUG] getRandomVerse: Tema aleatório selecionado: ${randomTheme}`);
        
        const result = getRandomFromArray(versesArg, randomTheme);
        console.log(`[DEBUG] getRandomVerse: Resultado para tema ${randomTheme}:`, result ? 'encontrado' : 'não encontrado');
        return result;
      } else {
        console.log(`[DEBUG] getRandomVerse: Buscando versículo para tema específico: ${theme}`);
        const result = getRandomFromArray(versesArg, theme);
        console.log(`[DEBUG] getRandomVerse: Resultado para tema ${theme}:`, result ? 'encontrado' : 'não encontrado');
        return result;
      }
    } catch (error) {
      console.error('[DEBUG] getRandomVerse: Erro ao obter versículo aleatório:', error);
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
      const weekday = convertToCordovaWeekday(day);

      // Para tema "auto", usar o tema real do versículo selecionado
      const actualTheme = schedule.theme === 'auto' ? verse.tema : schedule.theme;

      console.log(`[Notifications] Criando notificação ${notificationId} para horário: ${schedule.time}, dia: ${day} (Cordova: ${weekday}), tema original: ${schedule.theme}, tema real: ${actualTheme}`);

      // Configuração da notificação usando Cordova Local Notifications
      const notificationConfig = {
        id: notificationId,
        title: "Versículo do Dia",
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
        androidChannelName: 'Versículos Bíblicos',
        androidChannelDescription: 'Notificações de versículos agendados',
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
          console.log(`[Notifications] Notificação ${notificationId} agendada com sucesso via Cordova`);
          
          // Salvar o deeplink no localStorage para caso o app esteja fechado quando a notificação for clicada
          const deeplink = notificationConfig.data.deeplink;
          const deeplinkKey = `pendingDeeplink_${notificationId}`;
          localStorage.setItem(deeplinkKey, deeplink);
          console.log(`[Notifications] Deeplink salvo no localStorage para notificação ${notificationId}:`, deeplink);
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

  // NOVA função para criar notificação de oração
  const createSinglePrayerNotification = async (schedule: PrayerSchedule, day: number) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        console.log('[Notifications] Tentativa de criar notificação de oração em web ou Cordova não disponível - ignorando');
        return true;
      }

      const [hours, minutes] = schedule.time.split(':').map(Number);
      const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
      const weekday = convertToCordovaWeekday(day);

      console.log(`[Notifications] Criando notificação de oração ${notificationId} para horário: ${schedule.time}, dia: ${day} (Cordova: ${weekday})`);

      // Configuração da notificação de oração usando Cordova Local Notifications
      const notificationConfig = {
        id: notificationId,
        title: "Hora de Orar",
        text: "É um bom momento para fazer uma oração e conectar-se com Deus.",
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
        androidChannelName: 'Lembretes de Oração',
        androidChannelDescription: 'Notificações de lembretes de oração',
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
          console.log(`[Notifications] Notificação de oração ${notificationId} agendada com sucesso via Cordova`);
          
          // Salvar o deeplink no localStorage
          const deeplink = notificationConfig.data.deeplink;
          const deeplinkKey = `pendingDeeplink_${notificationId}`;
          localStorage.setItem(deeplinkKey, deeplink);
          console.log(`[Notifications] Deeplink salvo no localStorage para notificação de oração ${notificationId}:`, deeplink);
        } else {
          console.error(`[Notifications] Falha ao agendar notificação de oração ${notificationId} via Cordova`);
        }
      });

      return true;
    } catch (error) {
      console.error('Error creating single prayer notification with Cordova:', error);
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
      console.error('[Notifications] Erro ao marcar versículo como usado:', error);
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
      
      console.log(`[Notifications] Novo agendamento de oração criado: ${newSchedule.id}`);
      
      const success = await createPrayerNotification(newSchedule);
      
      if (success) {
        toast({
          title: "Lembrete de oração criado",
          description: `Lembrete agendado para ${newSchedule.days.length} dia(s) da semana.`,
        });
      }

      return success;
    } catch (error) {
      console.error('Error adding prayer schedule:', error);
      return false;
    }
  };

  // NOVA função para criar notificação de oração
  const createPrayerNotification = async (schedule: PrayerSchedule) => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        console.log('[Notifications] Tentativa de criar notificação de oração em web ou Cordova não disponível - ignorando');
        return true;
      }

      console.log(`[Notifications] Criando notificação de oração para horário: ${schedule.time}, dias: ${schedule.days}`);
      
      // Primeiro, cancelar notificações existentes para este agendamento
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
            console.log(`[Notifications] Notificação de oração existente ${notificationId} cancelada via Cordova`);
          });
        } catch (error) {
          // Ignorar erro se a notificação não existia
        }
      }
      
      // Criar novas notificações
      for (const day of schedule.days) {
        const success = await createSinglePrayerNotification(schedule, day);
        if (!success) {
          console.error(`[Notifications] Falha ao criar notificação de oração para dia ${day}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error creating prayer notification with Cordova:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lembrete de oração. Verifique as permissões do app.",
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
        console.log(`[Notifications] Ativando agendamento de oração: ${schedule.id}`);
        const success = await createPrayerNotification(schedule);
        if (!success) {
          // Reverter se falhou
          savePrayerSchedules(prayerSchedules);
          return false;
        }
      } else {
        // Desativando - cancelar notificações
        console.log(`[Notifications] Desativando agendamento de oração: ${schedule.id}`);
        try {
          for (const day of schedule.days) {
            const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
            window.cordova!.plugins.notification.local.cancel(notificationId, () => {
              console.log(`[Notifications] Notificação de oração ${notificationId} cancelada via Cordova`);
            });
          }
        } catch (error) {
          console.error('Error canceling prayer notifications:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error toggling prayer schedule:', error);
      return false;
    }
  };

  // NOVA função para deletar agendamento de oração
  const deletePrayerSchedule = async (schedule: PrayerSchedule) => {
    try {
      console.log(`[Notifications] Deletando agendamento de oração: ${schedule.id}`);
      
      // Cancelar notificações
      for (const day of schedule.days) {
        try {
          const notificationId = parseInt(schedule.id) + day + 1000000; // Offset para evitar conflitos
          window.cordova!.plugins.notification.local.cancel(notificationId, () => {
            console.log(`[Notifications] Notificação de oração ${notificationId} cancelada via Cordova`);
          });
        } catch (error) {
          console.error(`[Notifications] Erro ao cancelar notificação de oração ${parseInt(schedule.id) + day + 1000000}:`, error);
        }
      }

      const newPrayerSchedules = prayerSchedules.filter(s => s.id !== schedule.id);
      savePrayerSchedules(newPrayerSchedules);

      toast({
        title: "Lembrete de oração removido",
        description: "O lembrete de oração foi removido com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting prayer schedule:', error);
      return false;
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

  // NOVA função para contar agendamentos de oração ativos
  const getActivePrayerSchedulesCount = () => {
    return prayerSchedules.filter(s => s.enabled).length;
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
      localStorage.removeItem(PRAYER_SCHEDULES_KEY); // NOVA chave
      localStorage.removeItem(USED_VERSES_KEY);
      localStorage.removeItem(NOTIFICATION_STATE_KEY);
      
      // Resetar estado
      setSchedules([]);
      setPrayerSchedules([]); // NOVO estado
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
        repeats: false, // Não repetir para teste
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

  const checkNotificationPersistence = async () => {
    try {
      if (!isMobile || !isCordovaAvailable()) {
        console.log('[Notifications] Verificação de persistência não disponível em web');
        return;
      }

      console.log('[Notifications] Verificando persistência das notificações...');
      
      // Verificar notificações agendadas
      window.cordova!.plugins.notification.local.getScheduled((notifications) => {
        console.log(`[Notifications] Notificações agendadas encontradas: ${notifications.length}`);
        notifications.forEach((notification: any) => {
          console.log(`[Notifications] Notificação agendada: ID ${notification.id}, próxima execução: ${notification.trigger?.at || 'repetitiva'}`);
        });
      });
    } catch (error) {
      console.error('Error checking notification persistence:', error);
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
  };
}; 