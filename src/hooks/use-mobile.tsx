import * as React from "react"
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMobileFeatures() {
  const [isNative, setIsNative] = React.useState(false);
  const [deviceInfo, setDeviceInfo] = React.useState<any>(null);
  const [networkStatus, setNetworkStatus] = React.useState<any>(null);

  React.useEffect(() => {
    const checkNative = async () => {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);
        setIsNative(true);
        
        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#3b82f6' });
        
        // Listen to network changes
        Network.addListener('networkStatusChange', (status) => {
          setNetworkStatus(status);
        });
        
        // Get initial network status
        const status = await Network.getStatus();
        setNetworkStatus(status);
      } catch (error) {
        setIsNative(false);
      }
    };
    
    checkNative();
  }, []);

  const hapticFeedback = React.useCallback(async (style: ImpactStyle = ImpactStyle.Light) => {
    if (isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Haptics not available');
      }
    }
  }, [isNative]);

  const hideKeyboard = React.useCallback(async () => {
    if (isNative) {
      try {
        await Keyboard.hide();
      } catch (error) {
        console.log('Keyboard hide not available');
      }
    }
  }, [isNative]);

  const showKeyboard = React.useCallback(async () => {
    if (isNative) {
      try {
        await Keyboard.show();
      } catch (error) {
        console.log('Keyboard show not available');
      }
    }
  }, [isNative]);

  const exitApp = React.useCallback(async () => {
    if (isNative) {
      try {
        await App.exitApp();
      } catch (error) {
        console.log('Exit app not available');
      }
    }
  }, [isNative]);

  return {
    isNative,
    deviceInfo,
    networkStatus,
    hapticFeedback,
    hideKeyboard,
    showKeyboard,
    exitApp
  };
}
