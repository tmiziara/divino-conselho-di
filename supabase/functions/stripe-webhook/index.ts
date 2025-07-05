// Torna a função acessível publicamente (necessário para o Stripe)
export const config = {
  runtime: "edge",
  region: "auto",
  auth: false
};
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// Inicializa Supabase
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
// Inicializa Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16"
});
// Mapeamento de preços (price_id → créditos)
const prices = {
  "price_1RgcY8HJuC7LGsOOv49lureq": 5,
  "price_1RgnAcHJuC7LGsOOB28e3bcF": 10,
  "price_1RgnAcHJuC7LGsOOM66jiB8c": 25
};
// Servidor
serve(async (req)=>{
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400
    });
  }
  console.log("🔔 Recebido evento do Stripe:", event.type);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("🧾 Sessão recebida:", session);
    const email = session.customer_email;
    let credits = 0;
    // Tenta recuperar créditos com line_items (se disponíveis)
    if (session.line_items && session.line_items.data) {
      for (const item of session.line_items.data){
        const priceId = item.price.id;
        const quantity = item.quantity ?? 1;
        if (prices[priceId]) {
          credits += prices[priceId] * quantity;
        }
      }
    }
    // Fallback: usa amount_total (seguro)
    if (credits === 0 && session.amount_total) {
      const total = Number(session.amount_total);
      if (total === 500) credits = 5;
      else if (total === 1000) credits = 10;
      else if (total === 2250) credits = 25;
      else console.warn("💰 Valor não reconhecido:", total);
    }
    if (email && credits > 0) {
      const { data: profile, error } = await supabase.from("profiles").select("id, credits").eq("email", email).single();
      if (error) {
        console.error("❌ Erro ao buscar usuário:", error);
      } else if (profile) {
        const { error: updateError } = await supabase.from("profiles").update({
          credits: (profile.credits || 0) + credits
        }).eq("id", profile.id);
        if (updateError) {
          console.error("❌ Erro ao atualizar créditos:", updateError);
        } else {
          console.log(`✅ Créditos atualizados para ${email}: +${credits}`);
        }
      } else {
        console.error("❌ Usuário não encontrado para o e-mail:", email);
      }
    } else {
      console.error("❌ E-mail ou créditos inválidos:", email, credits);
    }
  }
  return new Response("ok", {
    status: 200
  });
});
