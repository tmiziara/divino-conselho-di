import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { BrowserRouter } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

console.log("App inicializado");

async function preloadAndRender() {
  // Pré-carregar usuário
  const { data: { session } } = await supabase.auth.getSession();
  let initialSubscription = undefined;
  if (session?.user) {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data) {
        initialSubscription = {
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || "free",
          subscription_end: data.subscription_end || null,
        };
      }
    } catch (e) {
      // ignora erro
    }
  }
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider initialSubscription={initialSubscription}>
          <App />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

preloadAndRender();
