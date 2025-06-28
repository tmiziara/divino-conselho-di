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

  // Use native network status if available
  const networkConnected = networkStatus?.connected ?? isOnline;

  if (networkConnected) {
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