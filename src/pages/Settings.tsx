import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, Info, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthDialog from '@/components/AuthDialog';

export default function Settings() {
  const navigate = useNavigate();
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
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar à Home
          </Button>
        </div>
        <h2 className="text-2xl font-bold heavenly-text text-center mb-6">Configurações</h2>
        <div className="flex flex-col gap-6 items-center">
          {/* Card da versão */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            <span className="font-semibold">Versão 1.0.0</span>
          </div>

          {/* Política de Privacidade */}
          <div className="w-full max-w-xs bg-card text-card-foreground dark:bg-zinc-900 dark:text-white rounded-lg shadow-md p-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">Política de Privacidade</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-primary hover:text-primary/80"
              onClick={() => navigate('/politica-privacidade')}
            >
              Ver Política
            </Button>
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