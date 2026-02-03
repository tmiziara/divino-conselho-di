import React, { useState } from "react";
import { useLocalData } from "@/hooks/useLocalData";
import { useContentAccess } from "@/hooks/useContentAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Shield } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const DebugInfo: React.FC = () => {
  const { localData, syncStatus, forceSync, clearLocalData } = useLocalData();
  const { hasPremiumAccess, isDataReady } = useContentAccess();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isEnglish } = useLanguage();
  const tx = (pt: string, en: string) => (isEnglish ? en : pt);

  const handleForceSync = () => {
    if (localData?.user_id) {
      forceSync(localData.user_id);
    }
  };

  const handleClearData = () => {
    clearLocalData();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return tx("Nunca", "Never");
    return new Date(dateString).toLocaleString(isEnglish ? "en-US" : "pt-BR");
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
            <span>{tx("Debug - Cache Local", "Debug - Local Cache")}</span>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">{tx("Sincronização", "Sync")}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{tx("Status:", "Status:")}</span>
                <Badge variant={syncStatus.isSyncing ? "secondary" : syncStatus.error ? "destructive" : "default"}>
                  {syncStatus.isSyncing ? tx("Sincronizando", "Syncing") : syncStatus.error ? tx("Erro", "Error") : "OK"}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>{tx("Última sinc:", "Last sync:")}</span>
                <span>{formatDate(syncStatus.lastSync)}</span>
              </div>
              {syncStatus.error && <div className="text-xs text-destructive">{tx("Erro:", "Error:")} {syncStatus.error}</div>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">{tx("Dados Locais", "Local Data")}</span>
            </div>
            {localData ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{tx("Usuário:", "User:")}</span>
                  <span>{localData.user_id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{tx("Plano:", "Tier:")}</span>
                  <Badge variant={localData.subscription_tier === "premium" ? "default" : "secondary"}>
                    {localData.subscription_tier}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{tx("Status:", "Status:")}</span>
                  <Badge variant={localData.subscription_status === "active" ? "default" : "secondary"}>
                    {localData.subscription_status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{tx("Expira:", "Expires:")}</span>
                  <span>{formatDate(localData.subscription_expires_at)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">{tx("Nenhum dado local", "No local data")}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">{tx("Acesso Premium", "Premium Access")}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{tx("Status:", "Status:")}</span>
                <Badge variant={hasPremiumAccess() ? "default" : "secondary"}>
                  {hasPremiumAccess() ? tx("Ativo", "Active") : tx("Inativo", "Inactive")}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>{tx("Dados prontos:", "Data ready:")}</span>
                <Badge variant={isDataReady() ? "default" : "secondary"}>
                  {isDataReady() ? tx("Sim", "Yes") : tx("Não", "No")}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleForceSync} disabled={syncStatus.isSyncing} className="flex-1">
              <RefreshCw className="h-3 w-3 mr-1" />
              {tx("Sincronizar", "Sync")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData} className="flex-1">
              <Database className="h-3 w-3 mr-1" />
              {tx("Limpar", "Clear")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
