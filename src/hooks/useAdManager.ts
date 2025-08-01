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
      console.error('[AdManager] Erro ao carregar contadores:', error);
    }
  }, []);

  // IDs de teste do AdMob
  const getInterstitialAdId = () => {
    return Device.getInfo().then(info => {
      return info.platform === 'ios' 
        ? 'ca-app-pub-3940256099942544/4411468910' // iOS test
        : 'ca-app-pub-3940256099942544/1033173712'; // Android test
    });
  };

  const getRewardedAdId = () => {
    return Device.getInfo().then(info => {
      return info.platform === 'ios' 
        ? 'ca-app-pub-3940256099942544/1712485313' // iOS test
        : 'ca-app-pub-3940256099942544/5224354917'; // Android test
    });
  };

  // Preparar ad intersticial
  const prepareInterstitialAd = async () => {
    if (subscription.subscription_tier === 'premium') {
      console.log('[AdManager] Usuário premium, pulando ads');
      return;
    }

    try {
      const adId = await getInterstitialAdId();
      await AdMob.prepareInterstitial({
        adId,
        isTesting: true,
      });
      setIsAdReady(true);
      console.log('[AdManager] Ad intersticial preparado');
    } catch (error) {
      console.error('[AdManager] Erro ao preparar ad intersticial:', error);
    }
  };

  // Mostrar ad intersticial
  const showInterstitialAd = async () => {
    if (subscription.subscription_tier === 'premium') {
      console.log('[AdManager] Usuário premium, pulando ads');
      return;
    }

    if (!isAdReady) {
      console.log('[AdManager] Ad não está pronto');
      return;
    }

    // Verificar cooldown (mínimo 60 segundos entre ads)
    const now = Date.now();
    const timeSinceLastAd = now - lastAdTime;
    const minInterval = 60 * 1000; // 60 segundos

    if (timeSinceLastAd < minInterval) {
      console.log(`[AdManager] Cooldown ativo. Aguarde ${Math.ceil((minInterval - timeSinceLastAd) / 1000)}s`);
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
      console.log('[AdManager] Limite diário de ads atingido');
      return;
    }

    try {
      await AdMob.showInterstitial();
      setIsAdReady(false);
      setLastAdTime(now);
      setDailyAdCount(prev => prev + 1);
      localStorage.setItem('adManager_lastAdTime', now.toString());
      localStorage.setItem('adManager_dailyAdCount', (dailyAdCount + 1).toString());
      console.log('[AdManager] Ad intersticial exibido');
      
      // Preparar próximo ad
      setTimeout(() => {
        prepareInterstitialAd();
      }, 1000);
    } catch (error) {
      console.error('[AdManager] Erro ao mostrar ad intersticial:', error);
    }
  };

  // Preparar ad recompensado
  const prepareRewardedAd = async () => {
    if (subscription.subscription_tier === 'premium') {
      console.log('[AdManager] Usuário premium, pulando ads');
      return;
    }

    try {
      const adId = await getRewardedAdId();
      await AdMob.prepareRewardVideoAd({
        adId,
        isTesting: true,
      });
      adLoadedRef.current = true;
      console.log('[AdManager] Ad recompensado preparado');
    } catch (error) {
      console.error('[AdManager] Erro ao preparar ad recompensado:', error);
    }
  };

  // Mostrar ad recompensado
  const showRewardedAd = async (onReward?: () => void) => {
    if (subscription.subscription_tier === 'premium') {
      console.log('[AdManager] Usuário premium, pulando ads');
      return;
    }

    if (!adLoadedRef.current) {
      console.log('[AdManager] Ad recompensado não está pronto');
      return;
    }

    try {
      console.log('[AdManager] Iniciando showRewardedAd');
      
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
          console.log('[AdManager] Recompensa recebida:', reward);
          console.log('[AdManager] Executando callback onReward');
          if (onReward) {
            try {
              await onReward();
              console.log('[AdManager] Callback onReward executado com sucesso');
            } catch (error) {
              console.error('[AdManager] Erro no callback onReward:', error);
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
          console.log('[AdManager] Ad recompensado carregado');
        }
      );

      // Listener para quando o ad é fechado
      const closedListener = await (AdMob as any).addListener(
        'onRewardedVideoAdClosed',
        () => {
          console.log('[AdManager] Ad recompensado fechado');
        }
      );

      // Listener para quando o ad falha
      const failedListener = await (AdMob as any).addListener(
        'onRewardedVideoAdFailedToLoad',
        (error: any) => {
          console.log('[AdManager] Ad recompensado falhou:', error);
        }
      );

      console.log('[AdManager] Mostrando ad recompensado...');
      await AdMob.showRewardVideoAd();
      adLoadedRef.current = false;
      console.log('[AdManager] Ad recompensado exibido');
      
      // Preparar próximo ad
      setTimeout(() => {
        prepareRewardedAd();
      }, 1000);
    } catch (error) {
      console.error('[AdManager] Erro ao mostrar ad recompensado:', error);
    }
  };

  // Contador de versículos navegados
  const incrementVerseCount = () => {
    if (subscription.subscription_tier === 'premium') return;

    const newCount = verseCount + 1;
    setVerseCount(newCount);
    localStorage.setItem('adManager_verseCount', newCount.toString());
    
    console.log(`[AdManager] Versículo navegado: ${newCount}/${config.versesPerAd}`);
    
    if (newCount >= config.versesPerAd) {
      showInterstitialAd();
      setVerseCount(0);
      localStorage.setItem('adManager_verseCount', '0');
    }
  };

  // Contador de estudos completados
  const incrementStudyCount = () => {
    if (subscription.subscription_tier === 'premium') {
      console.log('[AdManager] Usuário premium, pulando incremento de estudo');
      return;
    }

    const newCount = studyCount + 1;
    setStudyCount(newCount);
    localStorage.setItem('adManager_studyCount', newCount.toString());
    
    console.log(`[AdManager] Estudo completado: ${newCount}/${config.studiesPerAd}`);
    console.log(`[AdManager] Contador salvo no localStorage: ${newCount}`);
    
    if (newCount >= config.studiesPerAd) {
      console.log('[AdManager] Limite atingido, mostrando ad...');
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