import React, { useState } from 'react';
import { useLocalData } from '@/hooks/useLocalData';
import { useContentAccess } from '@/hooks/useContentAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Clock, User, Shield } from 'lucide-react';

export const DebugInfo: React.FC = () => {
  const { localData, syncStatus, forceSync, clearLocalData } = useLocalData();
  const { hasPremiumAccess, isDataReady, getSyncStatus } = useContentAccess();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleForceSync = () => {
    if (localData?.user_id) {
      forceSync(localData.user_id);
    }
  };

  const handleClearData = () => {
    clearLocalData();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-20 right-4 z-50"
      >
        <Database className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Debug - Cache Local</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status de Sincronização */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Sincronização</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Status:</span>
                <Badge variant={syncStatus.isSyncing ? 'secondary' : syncStatus.error ? 'destructive' : 'default'}>
                  {syncStatus.isSyncing ? 'Sincronizando' : syncStatus.error ? 'Erro' : 'OK'}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Última sinc:</span>
                <span>{formatDate(syncStatus.lastSync)}</span>
              </div>
              {syncStatus.error && (
                <div className="text-xs text-destructive">
                  Erro: {syncStatus.error}
                </div>
              )}
            </div>
          </div>

          {/* Dados Locais */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Dados Locais</span>
            </div>
            {localData ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Usuário:</span>
                  <span>{localData.user_id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Tier:</span>
                  <Badge variant={localData.subscription_tier === 'premium' ? 'default' : 'secondary'}>
                    {localData.subscription_tier}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Status:</span>
                  <Badge variant={localData.subscription_status === 'active' ? 'default' : 'secondary'}>
                    {localData.subscription_status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Expira:</span>
                  <span>{formatDate(localData.subscription_expires_at)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Nenhum dado local</div>
            )}
          </div>

          {/* Acesso Premium */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Acesso Premium</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Status:</span>
                <Badge variant={hasPremiumAccess() ? 'default' : 'secondary'}>
                  {hasPremiumAccess() ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Dados prontos:</span>
                <Badge variant={isDataReady() ? 'default' : 'secondary'}>
                  {isDataReady() ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              disabled={syncStatus.isSyncing}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sincronizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="flex-1"
            >
              <Database className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 