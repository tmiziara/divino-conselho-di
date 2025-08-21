import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useMobileFeatures } from '@/hooks/use-mobile';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { networkStatus } = useMobileFeatures();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Melhor detecção de rede com fallbacks
  const getNetworkStatus = () => {
    // 1. Primeiro tenta o status nativo do Capacitor
    if (networkStatus?.connected !== undefined) {
      return networkStatus.connected;
    }
    
    // 2. Fallback para navigator.onLine
    if (typeof navigator.onLine !== 'undefined') {
      return navigator.onLine;
    }
    
    // 3. Fallback para verificação manual de conectividade
    return isOnline;
  };

  const networkConnected = getNetworkStatus();

  // No emulador, às vezes é melhor assumir que está online
  // para evitar problemas de desenvolvimento
  if (networkConnected || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>Você está offline. Algumas funcionalidades podem não estar disponíveis.</span>
      </div>
    </div>
  );
};

export default OfflineIndicator; 