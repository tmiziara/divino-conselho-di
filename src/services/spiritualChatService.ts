import { supabase } from '@/integrations/supabase/client';

export interface ChatResponse {
  response: string;
  credits?: number;
  error?: string;
}

export class SpiritualChatService {
  private static instance: SpiritualChatService;

  static getInstance(): SpiritualChatService {
    if (!SpiritualChatService.instance) {
      SpiritualChatService.instance = new SpiritualChatService();
    }
    return SpiritualChatService.instance;
  }

  // Enviar mensagem para IA sem salvar no Supabase
  async sendMessage(message: string, conversationHistory: any[] = []): Promise<ChatResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      // Obter perfil do usuário para verificar gênero
      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, credits')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // Verificar créditos
      if (profile.credits < 1) {
        return {
          response: '',
          error: 'Créditos insuficientes. Você precisa de pelo menos 1 crédito para enviar mensagens.',
          credits: profile.credits
        };
      }

      const userGender = profile.gender || 'masculino';
      const genderRef = userGender === 'feminino' ? 'irmã' : userGender === 'masculino' ? 'irmão' : 'irmão/irmã';

      // Preparar mensagens para a IA
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

      // Chamar função do Supabase que NÃO salva no banco
      const supabaseUrl = 'https://ssylplbgacuwkqkkhric.supabase.co';
      console.log('Chamando Edge Function:', `${supabaseUrl}/functions/v1/spiritual-chat-with-credits`);
      console.log('Payload:', { message, user_id: session.user.id });
      
      const response = await fetch(`${supabaseUrl}/functions/v1/spiritual-chat-with-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message,
          user_id: session.user.id,
          skip_save: true,
          conversationHistory: conversationHistory
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // Se for erro de créditos insuficientes
        if (data.error?.includes('Créditos insuficientes') || response.status === 402) {
          return {
            response: '',
            error: 'Créditos insuficientes. Você precisa de pelo menos 1 crédito para enviar mensagens.',
            credits: profile.credits
          };
        }

        // Se for erro da API OpenAI
        if (data.error?.includes('Erro na IA') || data.error?.includes('OpenAI')) {
          return {
            response: '',
            error: 'IA temporariamente indisponível. Tente novamente em alguns minutos. Seu crédito não foi consumido.',
            credits: profile.credits
          };
        }

        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      // Se a resposta foi bem-sucedida, consumir crédito
      if (data.response) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: profile.credits - 1 })
          .eq('user_id', session.user.id);

        if (updateError) {
          console.error('Erro ao atualizar créditos:', updateError);
        }

        return {
          response: data.response,
          credits: profile.credits - 1
        };
      }

      return {
        response: '',
        error: 'Resposta vazia da IA',
        credits: profile.credits
      };

    } catch (error: any) {
      console.error('Erro no serviço de chat:', error);
      return {
        response: '',
        error: error.message || 'Erro interno do servidor',
        credits: null
      };
    }
  }

  // Verificar créditos do usuário
  async getCredits(): Promise<number | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      return data?.credits || 0;
    } catch (error) {
      console.error('Erro ao obter créditos:', error);
      return null;
    }
  }

  // Assistir anúncio para ganhar créditos
  async watchAdForCredits(): Promise<{ success: boolean; credits?: number; error?: string }> {
    try {
      console.log('[SpiritualChatService] Iniciando watchAdForCredits');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('[SpiritualChatService] Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('[SpiritualChatService] Usuário autenticado:', session.user.id);

      // Método direto para adicionar créditos
      console.log('[SpiritualChatService] Adicionando créditos via método direto...');
      
      // Buscar perfil atual
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('[SpiritualChatService] Erro ao buscar perfil:', profileError);
        return { success: false, error: 'Erro ao buscar perfil do usuário' };
      }

      if (!profile) {
        console.log('[SpiritualChatService] Perfil não encontrado');
        return { success: false, error: 'Perfil não encontrado' };
      }

      console.log('[SpiritualChatService] Créditos atuais:', profile.credits);
      const newCredits = (profile.credits || 0) + 3;
      console.log('[SpiritualChatService] Novos créditos:', newCredits);

      // Atualizar créditos diretamente
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error('[SpiritualChatService] Erro ao atualizar créditos:', updateError);
        return { success: false, error: 'Erro ao atualizar créditos' };
      }

      console.log('[SpiritualChatService] Créditos atualizados com sucesso!');
      return { 
        success: true, 
        credits: newCredits
      };

    } catch (error: any) {
      console.error('[SpiritualChatService] Erro geral:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao processar anúncio' 
      };
    }
  }
}

export const spiritualChatService = SpiritualChatService.getInstance(); 