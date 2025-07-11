import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalData } from '@/hooks/useLocalData';

interface LoadingContextType {
  isInitializing: boolean;
  isDataReady: boolean;
  showLoadingScreen: boolean;
}

const LoadingContext = createContext<LoadingContextType>({
  isInitializing: true,
  isDataReady: false,
  showLoadingScreen: true,
});

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const { loading: authLoading } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  // Para mobile - simplificar ao máximo
  useEffect(() => {
    console.log('[LoadingProvider] Auth loading:', authLoading);
    
    if (!authLoading) {
      // Para mobile, não precisamos de delay
      console.log('[LoadingProvider] Ocultando tela de carregamento');
      setShowLoadingScreen(false);
    }
  }, [authLoading]);

  // Timeout de segurança mais curto para mobile
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      console.log('[LoadingProvider] Timeout de segurança - forçando liberação');
      setShowLoadingScreen(false);
    }, 3000); // 3 segundos para mobile

    return () => clearTimeout(safetyTimer);
  }, []);

  const value: LoadingContextType = {
    isInitializing: authLoading,
    isDataReady: !authLoading,
    showLoadingScreen,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}; 