import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

// Função para ativar o modo imersivo no Android
function enableImmersiveMode() {
  if (window?.AndroidFullScreen && window.AndroidFullScreen.immersiveMode) {
    window.AndroidFullScreen.immersiveMode();
  } else if (window?.cordova && window.cordova.plugins && window.cordova.plugins.AndroidFullScreen) {
    window.cordova.plugins.AndroidFullScreen.immersiveMode();
  } else {
    // Fallback: usar API Fullscreen do navegador
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  }
}

export function useSystemNavigation() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const setupSystemNavigation = async () => {
      try {
        // Verificar se estamos em um ambiente nativo
        const info = await App.getInfo();
        setIsNative(true);

        // Configurar status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#3b82f6' });
        
        // Configurar para esconder a barra de navegação do sistema
        await StatusBar.setOverlaysWebView({ overlay: true });
        
        // Ativar modo imersivo
        setTimeout(() => {
          enableImmersiveMode();
        }, 500);

        // Adicionar listener para botão voltar
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });

      } catch (error) {
        setIsNative(false);
        console.log('Not running in native environment');
      }
    };

    setupSystemNavigation();

    return () => {
      // Cleanup listeners
      App.removeAllListeners();
    };
  }, []);

  const hideSystemUI = async () => {
    if (isNative) {
      try {
        // Tentar esconder a barra de navegação do sistema
        await StatusBar.setOverlaysWebView({ overlay: true });
        enableImmersiveMode();
        
        // Adicionar CSS para esconder a barra de navegação
        const style = document.createElement('style');
        style.textContent = `
          body {
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
          }
          
          /* Esconder barra de navegação do sistema */
          @media screen and (max-width: 768px) {
            body {
              padding-bottom: env(safe-area-inset-bottom) !important;
            }
          }
          
          /* Garantir que o conteúdo não seja coberto */
          .mobile-bottom-nav {
            padding-bottom: calc(env(safe-area-inset-bottom) + 1rem) !important;
          }
        `;
        document.head.appendChild(style);
      } catch (error) {
        console.log('Could not hide system UI');
      }
    }
  };

  const showSystemUI = async () => {
    if (isNative) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.log('Could not show system UI');
      }
    }
  };

  return {
    isNative,
    hideSystemUI,
    showSystemUI
  };
} 