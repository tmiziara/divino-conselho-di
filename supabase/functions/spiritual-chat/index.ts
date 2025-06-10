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
    const { message, userId } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Received message:', message, 'from user:', userId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save user message to database
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: message,
        is_from_ai: false
      });

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
    }

    // Get user profile to check gender
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', userId)
      .single();

    const userGender = profile?.gender || 'masculino';
    const genderRef = userGender === 'feminino' ? 'irmã' : userGender === 'masculino' ? 'irmão' : 'irmão/irmã';

    // Get last 5 messages for conversation memory
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('message, is_from_ai')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build conversation history
    const conversationHistory = [];
    if (recentMessages && recentMessages.length > 0) {
      // Reverse to get chronological order and take last 5 exchanges
      const messages = recentMessages.reverse().slice(-10);
      for (const msg of messages) {
        conversationHistory.push({
          role: msg.is_from_ai ? 'assistant' : 'user',
          content: msg.message
        });
      }
    }

    // Call OpenAI API
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
          ...conversationHistory,
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
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const aiResponse = data.choices[0].message.content;
    console.log('AI response:', aiResponse);

    // Save AI response to database
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message: aiResponse,
        is_from_ai: true
      });

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError);
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in spiritual-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});