import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import Switch from '@mui/material/Switch';
import { ChevronLeft, Moon, LogOut, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from '@/components/AuthDialog';

// Hook para modo noturno com Tailwind (darkMode: class)
const useTheme = () => {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return {
    isDark,
    setIsDark,
    toggle: () => setIsDark((v) => !v),
  };
};

export default function Settings() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const handleAuthClick = () => setShowAuth(true);

  // Exemplo de logout (adapte para seu contexto de auth)
  const handleLogout = () => {
    // Adapte para seu método de logout
    window.location.href = '/logout';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navigation onAuthClick={handleAuthClick} />
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/chat')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar ao Chat
          </Button>
        </div>
        <h2 className="text-2xl font-bold heavenly-text text-center mb-6">Configurações</h2>
        <div className="flex flex-col gap-6 items-center">
          {/* Modo Noturno */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              <span className="font-semibold">Modo Noturno</span>
            </div>
            <Switch checked={isDark} onChange={e => toggle(e.target.checked)} />
          </div>

          {/* Espaço para futuras opções */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center justify-between opacity-60 cursor-not-allowed">
            <span className="font-semibold">(Em breve) Preferências de Notificação</span>
          </div>

          {/* Sobre o app */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold">Versão 1.0.0</span>
            <a href="/politica-privacidade" className="ml-auto text-primary underline text-sm">Política de Privacidade</a>
          </div>

          {/* Sair */}
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