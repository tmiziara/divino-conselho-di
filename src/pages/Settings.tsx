import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, Info, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from '@/components/AuthDialog';
import { useNotifications } from "@/hooks/useNotifications";

export default function Settings() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{ enabled: boolean; message: string } | null>(null);
  const { getNotificationStatus, testNotification } = useNotifications({ enableInitialization: false });
  const handleAuthClick = () => setShowAuth(true);

  // Exemplo de logout (adapte para seu contexto de auth)
  const handleLogout = () => {
    // Adapte para seu m√©todo de logout
    window.location.href = '/logout';
  };
  // Phase 2: simple notification health check in Settings.
  useEffect(() => {
    getNotificationStatus().then((status) => setNotificationStatus(status));
  }, [getNotificationStatus]);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar √† Home
          </Button>
        </div>
        <h2 className="text-2xl font-bold heavenly-text text-center mb-6">Configura√ß√µes</h2>
        <div className="flex flex-col gap-6 items-center">
          {/* Card da vers√£o */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold">Vers√£o 1.0.0</span>
          </div>

          {/* Pol√≠tica de Privacidade */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">Pol√≠tica de Privacidade</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-primary hover:text-primary/80"
              onClick={() => navigate('/politica-privacidade')}
            >
              Ver Pol√≠tica
            </Button>
          </div>


          {/* Phase 2: Health check de notificaÁıes */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold">NotificaÁıes</span>
                <p className="text-sm text-muted-foreground">
                  {notificationStatus?.message || "Verificando status..."}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => testNotification()}>
              Testar notificaÁ„o
            </Button>
          </div>\n          {/* Sair */}
          <Button variant="outline" className="w-full max-w-xs flex items-center gap-2 mt-4" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </Button>
        </div>
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
} 





