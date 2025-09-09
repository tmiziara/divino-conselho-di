import * as React from "react"

// Breakpoints para diferentes tamanhos de tela
const MOBILE_BREAKPOINT = 768    // até 768px = mobile
const TABLET_BREAKPOINT = 1024   // 768px - 1024px = tablet
const DESKTOP_BREAKPOINT = 1025  // acima de 1024px = desktop

export interface DeviceType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      
      setDeviceType({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < DESKTOP_BREAKPOINT,
        isDesktop: width >= DESKTOP_BREAKPOINT
      });
    };

    // Verificar inicialmente
    updateDeviceType();

    // Listener para mudanças de tamanho
    window.addEventListener('resize', updateDeviceType);
    
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
}

// Hook específico para tablets
export function useIsTablet(): boolean {
  const { isTablet } = useDeviceType();
  return isTablet;
}

// Hook que combina mobile e tablet (para componentes que devem aparecer em ambos)
export function useIsMobileOrTablet(): boolean {
  const { isMobile, isTablet } = useDeviceType();
  return isMobile || isTablet;
}

// Hook para detectar se deve mostrar navegação mobile-style (mobile + tablet)
export function useShouldShowMobileNav(): boolean {
  return useIsMobileOrTablet();
}

