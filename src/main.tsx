import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "@/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { BrowserRouter } from "react-router-dom";

// Disable service workers inside the native app to avoid stale caches.
if (typeof window !== 'undefined') {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
  if (isNative && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      {/* Single source of truth for assinatura: useSubscription hook */}
      <App />
    </AuthProvider>
  </BrowserRouter>
);
