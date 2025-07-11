import React from 'react';
import { useLocalData } from '@/hooks/useLocalData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const SyncStatus: React.FC = () => {
  const { syncStatus, forceSync, localData } = useLocalData();

  if (!localData) {
    return null;
  }

  const handleForceSync = () => {
    if (localData.user_id) {
      forceSync(localData.user_id);
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (syncStatus.error) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Sincronizando...';
    }
    if (syncStatus.error) {
      return 'Erro na sincronização';
    }
    if (syncStatus.lastSync) {
      const lastSync = new Date(syncStatus.lastSync);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return 'Sincronizado agora';
      } else if (diffMinutes < 60) {
        return `Sincronizado há ${diffMinutes} min`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Sincronizado há ${diffHours}h`;
      }
    }
    return 'Não sincronizado';
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      {getStatusIcon()}
      <span className="text-sm text-muted-foreground">{getStatusText()}</span>
      {syncStatus.error && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceSync}
          disabled={syncStatus.isSyncing}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}; 