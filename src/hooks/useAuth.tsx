/* eslint-disable react-refresh/only-export-components */
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
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  const validateUserExists = async (currentUser: User) => {
    try {
      // Simplified validation - only clear auth on specific JWT errors
      const { error } = await supabase.auth.getUser();
      if (error && error.message.includes("JWT expired")) {
        return true; // Let Supabase handle token refresh
      }
      return true;
    } catch (error) {
      return true; // Don't clear auth on errors
    }
  };

  useEffect(() => {
    
    // Verificar sessão imediatamente
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Only clear auth on very specific errors
          if (error.message.includes("User from sub claim in JWT does not exist")) {
            await clearInvalidAuth();
            return;
          }
        }

        setUser(session?.user || null);
        setLoading(false);
      } catch (error) {
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
      
      // Simplified auth state handling
      setUser(session?.user || null);
      setLoading(false);

      // Handle redirect after login
      if (event === 'SIGNED_IN' && session?.user) {
        // Inicializar dados locais para o usuário
        
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
        
        // Disparar evento para limpar dados locais
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
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
