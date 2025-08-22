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

      // 1. PRIMEIRO: Verificar se o usuário é premium
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', session.user.id)
        .single();

      if (subscriptionError) {
        console.log('Erro ao verificar assinatura:', subscriptionError);
        // Se não conseguir verificar assinatura, continuar com verificação de créditos
      }

      const isPremium = subscription?.subscribed && subscription?.subscription_tier === 'premium';
      console.log('Status premium no serviço:', {
        subscription: subscription,
        subscribed: subscription?.subscribed,
        tier: subscription?.subscription_tier,
        isPremium: isPremium
      });

      // 2. Obter perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, credits')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // 3. Verificar créditos APENAS para usuários gratuitos
      if (!isPremium && profile.credits < 1) {
        return {
          response: '',
          error: 'Créditos insuficientes. Você precisa de pelo menos 1 crédito para enviar mensagens.',
          credits: profile.credits
        };
      }

      // 4. Se for premium, não verificar créditos
      if (isPremium) {
        console.log('Usuário premium - pulando verificação de créditos local');
      }

      const userGender = profile.gender || 'masculino';
      const genderRef = userGender === 'feminino' ? 'irmã' : userGender === 'masculino' ? 'irmão' : 'irmão/irmã';

      // Preparar mensagens para a IA
      const messages = [
        {
          role: 'system',
          content: `Você é um pastor cristão com um jeito acolhedor, leve, simpático e nada formal. Sua missão é ouvir, dar conselhos baseados na Bíblia e ajudar as pessoas a refletirem, sem julgar.

Sempre trate a pessoa com carinho, usando "${genderRef}".

Fluxo de conversa:

    Quando a pessoa chega ou muda de assunto, faça apenas uma pergunta simples para entender melhor, como:

        "O que está no seu coração hoje?"

        "Quer me contar um pouco mais sobre isso?"

    Depois de receber a resposta, evite repetir perguntas semelhantes imediatamente. Em vez disso, reaja ao que ela disse, trazendo:

        Empatia e validação do sentimento.

        Uma reflexão bíblica relevante, de forma natural.

        Exemplos de vida ou histórias bíblicas que tragam esperança.

    Só volte a fazer outra pergunta de entendimento depois de pelo menos duas interações sem perguntas semelhantes, para manter a conversa natural.

Use a Bíblia de maneira próxima, como um amigo que conhece as Escrituras, e incentive a conversa aberta.

Se a pessoa preferir apenas desabafar, ouça e responda com fé e esperança, sem tentar "investigar demais" o que ela sente.

Evite formalidades e respostas automáticas. Nunca julgue — apenas acolha e ajude a pessoa a se sentir ouvida.`
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

      // 5. Se a resposta foi bem-sucedida, consumir crédito APENAS para usuários gratuitos
      if (data.response) {
        if (!isPremium) {
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
        } else {
          // Usuário premium - não consumir créditos
          console.log('Usuário premium - não consumindo créditos localmente');
          return {
            response: data.response,
            credits: null // null indica usuário premium
          };
        }
      }

      return {
        response: '',
        error: 'Resposta vazia da IA',
        credits: isPremium ? null : profile.credits
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

      // Registrar que o anúncio foi assistido (APENAS AQUI)
      this.recordAdWatched(session.user.id);

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

  // Verificar se o usuário pode assistir anúncio (timer de 15 minutos)
  canWatchAd(userId: string): { canWatch: boolean; remainingMinutes: number } {
    try {
      const lastAdWatched = this.getLastAdWatchedFromStorage(userId);
      console.log('[SpiritualChatService] Último anúncio assistido:', lastAdWatched);
      
      if (!lastAdWatched) {
        // Primeira vez assistindo anúncio
        console.log('[SpiritualChatService] Primeira vez assistindo anúncio');
        return { canWatch: true, remainingMinutes: 0 };
      }

      const lastWatched = new Date(lastAdWatched);
      const now = new Date();
      const timeDiff = now.getTime() - lastWatched.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      const requiredWait = 15; // 15 minutos

      console.log('[SpiritualChatService] Tempo desde último anúncio:', minutesDiff, 'minutos');
      console.log('[SpiritualChatService] Tempo necessário para espera:', requiredWait, 'minutos');

      if (minutesDiff >= requiredWait) {
        console.log('[SpiritualChatService] Usuário pode assistir anúncio');
        return { canWatch: true, remainingMinutes: 0 };
      } else {
        const remaining = requiredWait - minutesDiff;
        console.log('[SpiritualChatService] Usuário deve aguardar mais', remaining, 'minutos');
        return { canWatch: false, remainingMinutes: remaining };
      }

    } catch (error) {
      console.error('[SpiritualChatService] Erro ao verificar timer do anúncio:', error);
      return { canWatch: true, remainingMinutes: 0 }; // Em caso de erro, permitir assistir
    }
  }

  // Registrar que um anúncio foi assistido
  private recordAdWatched(userId: string): void {
    try {
      console.log('[SpiritualChatService] Registrando anúncio assistido para usuário:', userId);
      this.saveAdWatchedToStorage(userId);
      console.log('[SpiritualChatService] Anúncio assistido registrado com sucesso');
    } catch (error) {
      console.error('[SpiritualChatService] Erro ao registrar anúncio assistido:', error);
    }
  }

  // Obter tempo restante para assistir próximo anúncio
  getAdTimerInfo(userId: string): { canWatch: boolean; remainingMinutes: number; remainingSeconds: number } {
    try {
      const { canWatch, remainingMinutes } = this.canWatchAd(userId);
      
      if (canWatch) {
        return { canWatch: true, remainingMinutes: 0, remainingSeconds: 0 };
      }

      // Buscar o último anúncio assistido para calcular segundos restantes
      const lastAdWatched = this.getLastAdWatchedFromStorage(userId);
      
      if (!lastAdWatched) {
        return { canWatch: true, remainingMinutes: 0, remainingSeconds: 0 };
      }

      const lastWatched = new Date(lastAdWatched);
      const now = new Date();
      const timeDiff = now.getTime() - lastWatched.getTime();
      const totalSecondsDiff = Math.floor(timeDiff / 1000);
      const requiredWaitSeconds = 15 * 60; // 15 minutos em segundos
      
      if (totalSecondsDiff >= requiredWaitSeconds) {
        return { canWatch: true, remainingMinutes: 0, remainingSeconds: 0 };
      } else {
        const remainingSeconds = requiredWaitSeconds - totalSecondsDiff;
        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const finalRemainingSeconds = remainingSeconds % 60;
        return { 
          canWatch: false, 
          remainingMinutes, 
          remainingSeconds: finalRemainingSeconds 
        };
      }

    } catch (error) {
      console.error('[SpiritualChatService] Erro ao obter timer do anúncio:', error);
      return { canWatch: true, remainingMinutes: 0, remainingSeconds: 0 };
    }
  }

  // Métodos auxiliares para localStorage
  private getLastAdWatchedFromStorage(userId: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `ad_watched_${userId}`;
      return localStorage.getItem(key);
    }
    return null;
  }

  private saveAdWatchedToStorage(userId: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `ad_watched_${userId}`;
      localStorage.setItem(key, new Date().toISOString());
    }
  }
}

export const spiritualChatService = SpiritualChatService.getInstance(); 