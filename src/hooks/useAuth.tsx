import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearInvalidAuth = async () => {
    console.log("[useAuth] Clearing invalid authentication state");
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const validateUserExists = async (currentUser: User) => {
    try {
      // Simplified validation - only clear auth on specific JWT errors
      const { error } = await supabase.auth.getUser();
      if (error && error.message.includes("JWT expired")) {
        console.log("[useAuth] JWT expired - refreshing session");
        return true; // Let Supabase handle token refresh
      }
      return true;
    } catch (error) {
      console.log("[useAuth] Error validating user:", error);
      return true; // Don't clear auth on errors
    }
  };

  useEffect(() => {
    console.log("[useAuth] Iniciando verificação de sessão...");
    
    // Verificar sessão imediatamente
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log("[useAuth] Session error:", error);
          // Only clear auth on very specific errors
          if (error.message.includes("User from sub claim in JWT does not exist")) {
            await clearInvalidAuth();
            return;
          }
        }

        console.log("[useAuth] Sessão verificada:", session ? "Usuário logado" : "Usuário não logado");
        setUser(session?.user || null);
        setLoading(false);
      } catch (error) {
        console.error("[useAuth] Erro ao verificar sessão:", error);
        setUser(null);
        setLoading(false);
      }
    };

    // Executar verificação imediatamente
    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] Auth state change:", event);
      
      // Simplified auth state handling
      setUser(session?.user || null);
      setLoading(false);

      // Handle redirect after login
      if (event === 'SIGNED_IN' && session?.user) {
        // Inicializar dados locais para o usuário
        console.log('[useAuth] Usuário logado, inicializando dados locais...');
        
        // Disparar evento para inicializar dados locais
        window.dispatchEvent(new CustomEvent('userLoggedIn', {
          detail: { userId: session.user.id }
        }));

        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== '/') {
          localStorage.removeItem('redirectAfterLogin');
          // Use setTimeout to ensure the state update is complete
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 100);
        }
      }

      // Handle logout
      if (event === 'SIGNED_OUT') {
        console.log('[useAuth] Usuário deslogado, limpando dados locais...');
        
        // Disparar evento para limpar dados locais
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log("[useAuth] Manual sign out");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
