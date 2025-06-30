import { localStorage, LocalLicense } from './localStorage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos de funcionalidades
export type Feature = 
  | 'premium_studies'
  | 'premium_verses'
  | 'spiritual_chat'
  | 'advanced_analytics'
  | 'offline_access'
  | 'export_data';

// Interface para conteúdo premium
export interface PremiumContent {
  studies: any[];
  verses: any[];
  chatHistory: any[];
}

// Classe principal para gerenciar acesso ao conteúdo
export class ContentAccessManager {
  private static instance: ContentAccessManager;
  
  private constructor() {}
  
  static getInstance(): ContentAccessManager {
    if (!ContentAccessManager.instance) {
      ContentAccessManager.instance = new ContentAccessManager();
    }
    return ContentAccessManager.instance;
  }

  // Verificar se tem acesso a uma funcionalidade
  async canAccess(feature: Feature): Promise<boolean> {
    // 1. Verificação local rápida
    if (localStorage.hasAccess(feature)) {
      return true;
    }

    // 2. Se não tem licença local, verificar com servidor
    if (!localStorage.getLicense()) {
      return await this.validateWithServer();
    }

    // 3. Se precisa validar com servidor
    if (localStorage.needsServerValidation()) {
      return await this.validateWithServer();
    }

    return false;
  }

  // Validar licença com servidor
  private async validateWithServer(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Buscar status da assinatura (usando tabela subscribers)
      const { data: subscription, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .eq('subscribed', true)
        .single();

      if (error || !subscription) {
        localStorage.clearLicense();
        return false;
      }

      // Atualizar licença local
      const license: Omit<LocalLicense, 'validationKey'> = {
        userId: user.id,
        subscriptionStatus: subscription.subscribed ? 'active' : 'expired',
        expiresAt: subscription.subscription_end || new Date().toISOString(),
        features: this.getFeaturesForTier(subscription.subscription_tier),
        lastValidated: new Date().toISOString()
      };

      localStorage.setLicense(license);
      return true;

    } catch (error) {
      console.error('Error validating with server:', error);
      return false;
    }
  }

  // Obter funcionalidades baseadas no tier da assinatura
  private getFeaturesForTier(tier: string): string[] {
    switch (tier) {
      case 'premium':
        return ['premium_studies', 'premium_verses', 'spiritual_chat', 'offline_access'];
      case 'basic':
        return ['premium_studies', 'premium_verses'];
      case 'free':
      default:
        return [];
    }
  }

  // Carregar conteúdo premium com verificação
  async loadPremiumContent(contentType: string): Promise<any> {
    // Verificar acesso
    if (!await this.canAccess('premium_studies')) {
      throw new Error('Subscription required');
    }

    // 1. Tentar carregar do cache local
    const cached = localStorage.getCacheItem(`premium_${contentType}`);
    if (cached) {
      return cached;
    }

    // 2. Tentar carregar do conteúdo premium local
    const localContent = localStorage.getPremiumContent(contentType);
    if (localContent) {
      // Salvar no cache para acesso rápido
      localStorage.setCacheItem(`premium_${contentType}`, localContent, 24);
      return localContent;
    }

    // 3. Baixar do servidor
    const serverContent = await this.downloadFromServer(contentType);
    
    // 4. Salvar localmente (criptografado)
    localStorage.setPremiumContent(contentType, serverContent);
    
    // 5. Salvar no cache
    localStorage.setCacheItem(`premium_${contentType}`, serverContent, 24);
    
    return serverContent;
  }

  // Baixar conteúdo do servidor
  private async downloadFromServer(contentType: string): Promise<any> {
    try {
      let data;
      
      switch (contentType) {
        case 'studies':
          const { data: studies } = await supabase
            .from('bible_studies')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          data = studies;
          break;

        case 'verses':
          // Buscar versículos da tabela versiculos
          const { data: verses } = await supabase
            .from('versiculos')
            .select('*')
            .limit(100);
          data = verses;
          break;

        case 'chatHistory':
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: chatHistory } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(50);
            data = chatHistory;
          } else {
            data = [];
          }
          break;

        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }

      return data || [];

    } catch (error) {
      console.error(`Error downloading ${contentType}:`, error);
      throw new Error(`Failed to load ${contentType}`);
    }
  }

  // Carregar estudo específico
  async loadStudy(studyId: string): Promise<any> {
    try {
      // 1. Verificar se é estudo premium (assumindo que todos são premium por enquanto)
      const isPremium = true; // await this.isPremiumStudy(studyId);
      
      if (isPremium && !await this.canAccess('premium_studies')) {
        throw new Error('Subscription required');
      }

      // 2. Tentar carregar do cache
      const cached = localStorage.getCacheItem(`study_${studyId}`);
      if (cached) {
        return cached;
      }

      // 3. Baixar do servidor
      const study = await this.downloadStudy(studyId);
      
      // 4. Salvar no cache
      localStorage.setCacheItem(`study_${studyId}`, study, 24);
      
      return study;

    } catch (error) {
      console.error('Error loading study:', error);
      throw error;
    }
  }

  // Verificar se é estudo premium
  private async isPremiumStudy(studyId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('bible_studies')
        .select('is_active')
        .eq('id', studyId)
        .single();

      // Por enquanto, todos os estudos ativos são considerados premium
      return data?.is_active || false;
    } catch (error) {
      console.error('Error checking study premium status:', error);
      return false;
    }
  }

  // Baixar estudo específico
  private async downloadStudy(studyId: string): Promise<any> {
    try {
      // Buscar estudo
      const { data: study, error: studyError } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('id', studyId)
        .single();

      if (studyError) throw studyError;

      // Buscar capítulos
      const { data: chapters, error: chaptersError } = await supabase
        .from('bible_study_chapters')
        .select('*')
        .eq('study_id', studyId)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;

      return {
        ...study,
        chapters: chapters || []
      };

    } catch (error) {
      console.error('Error downloading study:', error);
      throw new Error('Failed to load study');
    }
  }

  // Pré-carregar conteúdo essencial
  async preloadEssentialContent(): Promise<void> {
    try {
      // Carregar versículos básicos (sempre disponíveis)
      const basicVerses = [
        { reference: 'João 3:16', text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' },
        { reference: 'Salmos 23:1', text: 'O Senhor é o meu pastor, nada me faltará.' },
        { reference: 'Filipenses 4:13', text: 'Posso todas as coisas naquele que me fortalece.' },
        { reference: 'Jeremias 29:11', text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.' },
        { reference: 'Romanos 8:28', text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' }
      ];

      localStorage.setPublicContent({ basicVerses });

      // Se tem assinatura, pré-carregar estudos
      if (await this.canAccess('premium_studies')) {
        await this.loadPremiumContent('studies');
      }

    } catch (error) {
      console.error('Error preloading content:', error);
    }
  }

  // Limpar cache expirado
  clearExpiredCache(): void {
    // O próprio sistema de cache já remove itens expirados
    // Esta função pode ser usada para limpeza manual se necessário
  }

  // Obter estatísticas de uso
  getUsageStats(): any {
    const license = localStorage.getLicense();
    
    return {
      hasLicense: !!license,
      licenseStatus: license?.subscriptionStatus,
      expiresAt: license?.expiresAt,
      features: license?.features || [],
      lastValidated: license?.lastValidated
    };
  }
}

// Instância singleton
export const contentAccess = ContentAccessManager.getInstance(); 