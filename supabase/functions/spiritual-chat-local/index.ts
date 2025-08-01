import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Função spiritual-chat-local iniciada');
    
    const { message, user_id, conversationHistory = [] } = await req.json();
    console.log('Dados recebidos:', { message, user_id, conversationHistoryLength: conversationHistory.length });
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY não configurada');
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Received message:', message, 'from user:', user_id);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile to check gender and credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gender, credits')
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      throw new Error('Perfil do usuário não encontrado');
    }

    if (!profile) {
      throw new Error('Perfil do usuário não encontrado');
    }

    console.log('Perfil encontrado:', { credits: profile.credits, gender: profile.gender });

    // Verificar créditos
    if (profile.credits < 1) {
      console.log('Créditos insuficientes:', profile.credits);
      return new Response(JSON.stringify({ 
        error: 'Créditos insuficientes. Você precisa de pelo menos 1 crédito para enviar mensagens.',
        credits: profile.credits
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userGender = profile.gender || 'masculino';
    const genderRef = userGender === 'feminino' ? 'irmã' : userGender === 'masculino' ? 'irmão' : 'irmão/irmã';

    // Construir histórico de conversa a partir dos dados enviados
    const messages = [
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
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Chamando OpenAI com', messages.length, 'mensagens');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(JSON.stringify({ 
        error: 'IA temporariamente indisponível. Tente novamente em alguns minutos. Seu crédito não foi consumido.',
        credits: profile.credits
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = data.choices[0].message.content;
    console.log('AI response:', aiResponse);

    // NÃO salvar no banco de dados - apenas retornar a resposta
    return new Response(JSON.stringify({ 
      response: aiResponse,
      credits: profile.credits // Retornar créditos atuais (serão atualizados pelo cliente)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in spiritual-chat-local function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 