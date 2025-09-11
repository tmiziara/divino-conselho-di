import { useState, useEffect, useRef } from 'react';
import { AdMob } from '@capacitor-community/admob';
import { Device } from '@capacitor/device';
import { useSubscription } from './useSubscription';

interface AdManagerConfig {
  versesPerAd: number;
  studiesPerAd: number;
}

export const useAdManager = (config: AdManagerConfig = { versesPerAd: 5, studiesPerAd: 1 }) => {
  const [verseCount, setVerseCount] = useState(0);
  const [studyCount, setStudyCount] = useState(0);
  const [isAdReady, setIsAdReady] = useState(false);
  const [lastAdTime, setLastAdTime] = useState(0);
  const [dailyAdCount, setDailyAdCount] = useState(0);
  const [lastAdDate, setLastAdDate] = useState('');
  const { subscription } = useSubscription();
  const adLoadedRef = useRef(false);
  const rewardListenerRef = useRef<any>(null);
  const loadedListenerRef = useRef<any>(null);

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
    }
  }, []);

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
  const prepareInterstitialAd = async () => {
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
  };

  // Mostrar ad intersticial
  const showInterstitialAd = async () => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    if (!isAdReady) {
      return;
    }

    // Verificar cooldown (mínimo 60 segundos entre ads)
    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;
    const minInterval = 60 * 1000; // 60 segundos

    if (timeSinceLastAd < minInterval) {
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
      
      // Preparar próximo ad
      setTimeout(() => {
        prepareInterstitialAd();
      }, 1000);
    } catch (error) {
    }
  };

  // Preparar ad recompensado
  const prepareRewardedAd = async () => {
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
    } catch (error) {
    }
  };

  // Mostrar ad recompensado
  const showRewardedAd = async (onReward?: () => void) => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    if (!adLoadedRef.current) {
      return;
    }

    try {
      
      // Adicionar listeners antes de mostrar o ad
      if (rewardListenerRef.current) {
        rewardListenerRef.current.remove();
      }
      if (loadedListenerRef.current) {
        loadedListenerRef.current.remove();
      }

      // Listener para recompensa
      rewardListenerRef.current = await (AdMob as any).addListener(
        'rewarded',
        async (reward: any) => {
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
        'onRewardedVideoAdLoaded',
        () => {
        }
      );

      // Listener para quando o ad é fechado
      const closedListener = await (AdMob as any).addListener(
        'onRewardedVideoAdClosed',
        () => {
        }
      );

      // Listener para quando o ad falha
      const failedListener = await (AdMob as any).addListener(
        'onRewardedVideoAdFailedToLoad',
        (error: any) => {
        }
      );

      await AdMob.showRewardVideoAd();
      adLoadedRef.current = false;
      
      // Preparar próximo ad
      setTimeout(() => {
        prepareRewardedAd();
      }, 1000);
    } catch (error) {
    }
  };

  // Contador de versículos navegados
  const incrementVerseCount = () => {
    if (subscription.subscription_tier === 'premium') return;

    const newCount = verseCount + 1;
    setVerseCount(newCount);
    localStorage.setItem('adManager_verseCount', newCount.toString());
    
    
    if (newCount >= config.versesPerAd) {
      showInterstitialAd();
      setVerseCount(0);
      localStorage.setItem('adManager_verseCount', '0');
    }
  };

  // Contador de estudos completados
  const incrementStudyCount = () => {
    if (subscription.subscription_tier === 'premium') {
      return;
    }

    const newCount = studyCount + 1;
    setStudyCount(newCount);
    localStorage.setItem('adManager_studyCount', newCount.toString());
    
    if (newCount >= config.studiesPerAd) {
      showInterstitialAd();
      setStudyCount(0);
      localStorage.setItem('adManager_studyCount', '0');
    }
  };

  // Inicializar ads
  useEffect(() => {
    prepareInterstitialAd();
    prepareRewardedAd();
  }, [subscription.subscription_tier]);

  // Cleanup listeners
  useEffect(() => {
    return () => {
      if (rewardListenerRef.current) {
        rewardListenerRef.current.remove();
      }
      if (loadedListenerRef.current) {
        loadedListenerRef.current.remove();
      }
    };
  }, []);

  return {
    incrementVerseCount,
    incrementStudyCount,
    showRewardedAd,
    isAdReady,
    verseCount,
    studyCount,
  };
}; 