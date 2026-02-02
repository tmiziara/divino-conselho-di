import { useState, useEffect, useRef, useCallback } from 'react';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Device } from '@capacitor/device';
import { useSubscription } from './useSubscription';

interface AdManagerConfig {
  versesPerAd: number;
  studiesPerAd: number;
}

interface InterstitialContext {
  source: 'verse' | 'study' | 'other';
  // Sensitive moments get extra cooldowns to protect UX (Phase 4).
  sensitive?: boolean;
  // Optional delay to avoid interrupting completion/transition moments.
  delayMs?: number;
}

const SESSION_FALLBACK_PREFIX = 'adManager_session_fallback_';
const SESSION_FALLBACK_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const useAdManager = (config: AdManagerConfig = { versesPerAd: 5, studiesPerAd: 1 }) => {
  const [verseCount, setVerseCount] = useState(0);
  const [studyCount, setStudyCount] = useState(0);
  const [isAdReady, setIsAdReady] = useState(false);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [dailyAdCount, setDailyAdCount] = useState(0);
  const [lastAdDate, setLastAdDate] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [sessionAdCount, setSessionAdCount] = useState(0);
  const [lastSessionAdTime, setLastSessionAdTime] = useState(0);
  const [isRewardedReady, setIsRewardedReady] = useState(false);
  const { subscription } = useSubscription();
  const adLoadedRef = useRef(false);
  const rewardListenerRef = useRef<any>(null);
  const loadedListenerRef = useRef<any>(null);
  const rewardGrantedRef = useRef(false);
  const interstitialDelayRef = useRef<NodeJS.Timeout | null>(null);

  const getSessionFallbackValue = useCallback((key: string) => {
    try {
      return localStorage.getItem(`${SESSION_FALLBACK_PREFIX}${key}`);
    } catch (error) {
      return null;
    }
  }, []);

  const ensureSessionFallbackStart = useCallback(() => {
    try {
      const startedAtKey = `${SESSION_FALLBACK_PREFIX}startedAt`;
      const startedAtRaw = localStorage.getItem(startedAtKey);
      const now = Date.now();

      if (startedAtRaw) {
        const startedAt = parseInt(startedAtRaw);
        if (Number.isFinite(startedAt) && now - startedAt < SESSION_FALLBACK_TTL_MS) {
          return startedAt;
        }
      }

      localStorage.setItem(startedAtKey, now.toString());
      localStorage.removeItem(`${SESSION_FALLBACK_PREFIX}sessionAdCount`);
      localStorage.removeItem(`${SESSION_FALLBACK_PREFIX}lastSessionAdTime`);
      return now;
    } catch (error) {
      return Date.now();
    }
  }, []);

  const getSessionValue = useCallback((key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      ensureSessionFallbackStart();
      return getSessionFallbackValue(key);
    }
  }, [ensureSessionFallbackStart, getSessionFallbackValue]);

  const setSessionValue = useCallback((key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      const startedAt = ensureSessionFallbackStart();
      try {
        localStorage.setItem(`${SESSION_FALLBACK_PREFIX}startedAt`, startedAt.toString());
        localStorage.setItem(`${SESSION_FALLBACK_PREFIX}${key}`, value);
      } catch (fallbackError) {
      }
    }
  }, [ensureSessionFallbackStart]);

  // Carregar contadores do localStorage na inicialização
  useEffect(() => {
    try {
      const savedVerseCount = localStorage.getItem('adManager_verseCount');
      const savedStudyCount = localStorage.getItem('adManager_studyCount');
      const savedLastAdTime = localStorage.getItem('adManager_lastAdTime');
      const savedDailyAdCount = localStorage.getItem('adManager_dailyAdCount');
      const savedLastAdDate = localStorage.getItem('adManager_lastAdDate');

      if (savedVerseCount) setVerseCount(parseInt(savedVerseCount));
      if (savedStudyCount) setStudyCount(parseInt(savedStudyCount));
      if (savedLastAdTime) setLastAdTime(parseInt(savedLastAdTime));
      if (savedDailyAdCount) setDailyAdCount(parseInt(savedDailyAdCount));
      if (savedLastAdDate) setLastAdDate(savedLastAdDate);
    } catch (error) {
      // Ignore storage errors to keep the ad manager functional.
    }
  }, []);

  // Carregar contadores da sessao (sessionStorage) para cooldowns por sessao.
  useEffect(() => {
    try {
      const savedSessionStart = getSessionValue('adManager_sessionStart');
      const savedSessionAdCount = getSessionValue('adManager_sessionAdCount');
      const savedLastSessionAdTime = getSessionValue('adManager_lastSessionAdTime');
      const sessionStart = savedSessionStart ? parseInt(savedSessionStart) : Date.now();

      setSessionStartTime(sessionStart);
      setSessionAdCount(savedSessionAdCount ? parseInt(savedSessionAdCount) : 0);
      setLastSessionAdTime(savedLastSessionAdTime ? parseInt(savedLastSessionAdTime) : 0);

      if (!savedSessionStart) {
        setSessionValue('adManager_sessionStart', sessionStart.toString());
      }
    } catch (error) {
      // Fallback to an in-memory session when storage is unavailable.
      setSessionStartTime(Date.now());
      setSessionAdCount(0);
      setLastSessionAdTime(0);
    }
  }, [getSessionValue, setSessionValue]);

  // IDs de produção do AdMob
  const getInterstitialAdId = () => {
    return Device.getInfo().then(info => {
      return info.platform === 'ios' 
        ? 'ca-app-pub-7772749408418204/1479212901' // ← ID de produção iOS
        : 'ca-app-pub-7772749408418204/1479212901'; // ← ID de produção Android
    });
  };

  const getRewardedAdId = () => {
    return Device.getInfo().then(info => {
      return info.platform === 'ios' 
        ? 'ca-app-pub-7772749408418204/5482037094' // ← ID de produção iOS
        : 'ca-app-pub-7772749408418204/5482037094'; // ← ID de produção Android
    });
  };

  // Preparar ad intersticial
  const prepareInterstitialAd = useCallback(async () => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    try {
      const adId = await getInterstitialAdId();
      await AdMob.prepareInterstitial({
        adId,
        isTesting: false, // ← Mudado para false em produção
      });
      setIsAdReady(true);
    } catch (error) {
    }
  }, [subscription.subscription_tier]);

  // Mostrar ad intersticial
  const showInterstitialAd = async (context: InterstitialContext = { source: 'other' }) => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    if (!isAdReady) {
      return;
    }

    // Verificar cooldown global (mínimo 60s, ou mais em momentos sensíveis).
    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;
    const minInterval = context.sensitive ? 120 * 1000 : 60 * 1000;

    if (timeSinceLastAd < minInterval) {
      return;
    }

    // Cooldowns por sessão para reduzir frequência (Phase 4).
    const sessionAge = sessionStartTime ? now - sessionStartTime : 0;
    const minSessionAge = context.sensitive ? 180 * 1000 : 90 * 1000;
    const sessionCooldown = 90 * 1000; // evita intersticiais muito próximos na mesma sessão
    const maxSessionAds = 3;

    if (sessionAge < minSessionAge) {
      return;
    }

    if (lastSessionAdTime && now - lastSessionAdTime < sessionCooldown) {
      return;
    }

    if (sessionAdCount >= maxSessionAds) {
      return;
    }

    // Verificar limite diário (máximo 20 ads por dia)
    const today = new Date().toDateString();
    if (lastAdDate !== today) {
      setDailyAdCount(0);
      setLastAdDate(today);
      localStorage.setItem('adManager_dailyAdCount', '0');
      localStorage.setItem('adManager_lastAdDate', today);
    }

    if (dailyAdCount >= 20) {
      return;
    }

    try {
      await AdMob.showInterstitial();
      setIsAdReady(false);
      setLastAdTime(now);
      setDailyAdCount(prev => prev + 1);
      localStorage.setItem('adManager_lastAdTime', now.toString());
      localStorage.setItem('adManager_dailyAdCount', (dailyAdCount + 1).toString());

      // Atualizar métricas de sessão para o cooldown por sessão.
      const nextSessionAdCount = sessionAdCount + 1;
      setSessionAdCount(prev => prev + 1);
      setLastSessionAdTime(now);
      try {
        setSessionValue('adManager_sessionAdCount', nextSessionAdCount.toString());
        setSessionValue('adManager_lastSessionAdTime', now.toString());
      } catch (error) {
      }
      
      // Preparar próximo ad
      setTimeout(() => {
        prepareInterstitialAd();
      }, 1000);
    } catch (error) {
    }
  };

  // Preparar ad recompensado
  const prepareRewardedAd = useCallback(async () => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    try {
      const adId = await getRewardedAdId();
      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: false, // ← Mudado para false em produção
      });
      adLoadedRef.current = true;
      setIsRewardedReady(true);
    } catch (error) {
      setIsRewardedReady(false);
    }
  }, [subscription.subscription_tier]);

  // Mostrar ad recompensado
  const showRewardedAd = async (onReward?: () => void) => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    if (!adLoadedRef.current) {
      return;
    }

    try {
      rewardGrantedRef.current = false;
      
      // Adicionar listeners antes de mostrar o ad
      if (rewardListenerRef.current) {
        rewardListenerRef.current.remove();
      }
      if (loadedListenerRef.current) {
        loadedListenerRef.current.remove();
      }

      // Listener para recompensa
      rewardListenerRef.current = await (AdMob as any).addListener(
        RewardAdPluginEvents.Rewarded,
        async () => {
          rewardGrantedRef.current = true;
          if (onReward) {
            try {
              await onReward();
            } catch (error) {
            }
          }
          rewardListenerRef.current?.remove();
          loadedListenerRef.current?.remove();
        }
      );

      // Listener para quando o ad é carregado
      loadedListenerRef.current = await (AdMob as any).addListener(
        RewardAdPluginEvents.Loaded,
        () => {
          setIsRewardedReady(true);
        }
      );

      // Listener para quando o ad é fechado
      const closedListener = await (AdMob as any).addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
        }
      );

      // Listener para quando o ad falha
      const failedListener = await (AdMob as any).addListener(
        RewardAdPluginEvents.FailedToLoad,
        (error: any) => {
        }
      );

      const rewardItem = await AdMob.showRewardVideoAd();
      adLoadedRef.current = false;
      setIsRewardedReady(false);
      if (!rewardGrantedRef.current && rewardItem && onReward) {
        rewardGrantedRef.current = true;
        await onReward();
      }
      
      // Preparar próximo ad
      setTimeout(() => {
        prepareRewardedAd();
      }, 1000);
    } catch (error) {
      setIsRewardedReady(false);
    }
  };

  // Contador de versículos navegados
  const incrementVerseCount = (context: InterstitialContext = { source: 'verse' }) => {
    if (subscription.subscription_tier === 'premium') return;

    const newCount = verseCount + 1;
    setVerseCount(newCount);
    localStorage.setItem('adManager_verseCount', newCount.toString());
    
    
    if (newCount >= config.versesPerAd) {
      if (context.delayMs) {
        if (interstitialDelayRef.current) {
          clearTimeout(interstitialDelayRef.current);
        }
        interstitialDelayRef.current = setTimeout(() => {
          showInterstitialAd(context);
        }, context.delayMs);
      } else {
        showInterstitialAd(context);
      }
      setVerseCount(0);
      localStorage.setItem('adManager_verseCount', '0');
    }
  };

  // Contador de estudos completados
  const incrementStudyCount = (context: InterstitialContext = { source: 'study', sensitive: true, delayMs: 1500 }) => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    const newCount = studyCount + 1;
    setStudyCount(newCount);
    localStorage.setItem('adManager_studyCount', newCount.toString());
    
    if (newCount >= config.studiesPerAd) {
      if (context.delayMs) {
        if (interstitialDelayRef.current) {
          clearTimeout(interstitialDelayRef.current);
        }
        interstitialDelayRef.current = setTimeout(() => {
          showInterstitialAd(context);
        }, context.delayMs);
      } else {
        showInterstitialAd(context);
      }
      setStudyCount(0);
      localStorage.setItem('adManager_studyCount', '0');
    }
  };

  // Inicializar ads
  useEffect(() => {
    prepareInterstitialAd();
    prepareRewardedAd();
  }, [prepareInterstitialAd, prepareRewardedAd]);

  // Cleanup listeners
  useEffect(() => {
    return () => {
      if (rewardListenerRef.current) {
        rewardListenerRef.current.remove();
      }
      if (loadedListenerRef.current) {
        loadedListenerRef.current.remove();
      }
      if (interstitialDelayRef.current) {
        clearTimeout(interstitialDelayRef.current);
      }
    };
  }, []);

  return {
    incrementVerseCount,
    incrementStudyCount,
    showRewardedAd,
    prepareRewardedAd,
    isAdReady,
    isRewardedReady,
    verseCount,
    studyCount,
  };
}; 
