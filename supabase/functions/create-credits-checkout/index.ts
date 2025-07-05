import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // IDs reais dos preços do Stripe
    const priceIds = [
      "price_1RgcY8HJuC7LGsOOv49lureq",   // R$ 5,00 - 5 créditos
      "price_1RgnAcHJuC7LGsOOB28e3bcF",  // R$ 10,00 - 10 créditos
      "price_1RgnAcHJuC7LGsOOM66jiB8c"   // R$ 22,50 - 25 créditos
    ];

    // Cria a sessão de checkout com múltiplos itens opcionais
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: priceIds.map(price => ({
        price,
        quantity: 1
      })),
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `conexaodeus://success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `conexaodeus://cancel`,
      locale: "pt-BR"
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error creating credits checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
}); 