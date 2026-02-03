import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useMobileFeatures } from '@/hooks/use-mobile';
import { useLanguage } from '@/hooks/useLanguage';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);
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

  const getNetworkStatus = () => {
    if (networkStatus?.connected !== undefined) {
      return networkStatus.connected;
    }

    if (typeof navigator.onLine !== 'undefined') {
      return navigator.onLine;
    }

    return isOnline;
  };

  const networkConnected = getNetworkStatus();

  if (networkConnected || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>{tx('Voce esta offline. Algumas funcionalidades podem nao estar disponiveis.', 'You are offline. Some features may be unavailable.')}</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
