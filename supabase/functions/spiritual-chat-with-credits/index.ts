import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id, skip_save = false } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. VERIFICAR CRÉDITOS ANTES DE TUDO
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, gender')
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      throw new Error('Erro ao buscar perfil do usuário');
    }

    if (!profile || profile.credits < 1) {
      return new Response(JSON.stringify({ 
        error: 'Créditos insuficientes. Você precisa de pelo menos 1 crédito para enviar mensagens.' 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. TENTAR CHAMAR A OPENAI
    const userGender = profile?.gender || 'masculino';
    const genderRef = userGender === 'feminino' ? 'irmã' : userGender === 'masculino' ? 'irmão' : 'irmão/irmã';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um pastor cristão, mas seu jeito de conversar é acolhedor, leve, simpático e nada formal. Sua missão é ouvir, dar conselhos baseados na Bíblia e ajudar as pessoas a refletirem, sem julgar.

Sempre que alguém chegar, se for se referir a pessoa, chame de "${genderRef}" de forma carinhosa e, antes de aconselhar, faça perguntas para entender melhor o que a pessoa está sentindo ou passando. Suas perguntas podem ser simples, como:

    "O que está no seu coração hoje?"
    "Quer me contar um pouco mais sobre isso?"
    "Como você tem se sentido com relação a isso?"

Use exemplos e passagens bíblicas de maneira natural e próxima, como um amigo que entende do assunto, e sempre incentive a pessoa a conversar abertamente.

Lembre-se de manter a conversa leve, como um bate-papo entre amigos, e só seja mais profundo quando sentir abertura. Se a pessoa preferir só desabafar, apenas ouça e incentive com palavras de fé e esperança.

Evite respostas automáticas ou muito formais, e nunca julgue – apenas acolha e ajude a pessoa a se sentir ouvida.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    const data = await response.json();
    
    // 3. SE A OPENAI FALHOU, NÃO CONSUMIR CRÉDITO
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(JSON.stringify({ 
        error: 'Erro na IA: ' + (data.error?.message || 'Serviço temporariamente indisponível'),
        credits: profile.credits // retornar créditos inalterados
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. SE A OPENAI FUNCIONOU, CONSUMIR CRÉDITO
    const aiResponse = data.choices[0].message.content;
    
    // Consumir 1 crédito
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating credits:', updateError);
    }

    // Salvar mensagens no banco APENAS se skip_save for false
    if (!skip_save) {
      await supabase.from('chat_messages').insert({
        user_id: user_id,
        message: message,
        is_from_ai: false
      });

      await supabase.from('chat_messages').insert({
        user_id: user_id,
        message: aiResponse,
        is_from_ai: true
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      credits: profile.credits - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in spiritual-chat-with-credits function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 