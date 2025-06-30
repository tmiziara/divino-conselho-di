// Tipos
export interface LocalStudy {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  total_chapters: number;
  is_active: boolean;
  is_premium: boolean;
  slug?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  chapters: LocalChapter[];
}

export interface LocalChapter {
  id: string;
  study_id: string;
  chapter_number: number;
  title: string;
  main_verse: string;
  main_verse_reference: string;
  reflective_reading: string;
  reflection_question: string;
  chapter_prayer: string;
  practical_application: string;
  created_at: string;
  updated_at: string;
}

export interface LocalVerse {
  reference: string;
  text: string;
  category: string;
}

// Classe para gerenciar conteúdo local
export class LocalContentManager {
  private static instance: LocalContentManager;
  private studies: LocalStudy[] = [];
  private chapters: LocalChapter[] = [];
  private verses: LocalVerse[] = [];
  private loaded = false;
  
  private constructor() {}
  
  static getInstance(): LocalContentManager {
    if (!LocalContentManager.instance) {
      LocalContentManager.instance = new LocalContentManager();
    }
    return LocalContentManager.instance;
  }

  // Carregar conteúdo dos arquivos JSON
  private async loadContent() {
    if (this.loaded) {
      // Remover o console.log para evitar spam
      return;
    }
    
    try {
      console.log('Loading local content...');
      
      // Carregar estudos
      console.log('Fetching bible_studies.json...');
      const studiesResponse = await fetch('/data/bible_studies.json');
      if (!studiesResponse.ok) {
        throw new Error(`Failed to load studies: ${studiesResponse.status}`);
      }
      const studiesData = await studiesResponse.json();
      console.log('Studies loaded:', studiesData.length);
      
      // Carregar capítulos
      console.log('Fetching bible_study_chapters.json...');
      const chaptersResponse = await fetch('/data/bible_study_chapters.json');
      if (!chaptersResponse.ok) {
        throw new Error(`Failed to load chapters: ${chaptersResponse.status}`);
      }
      const chaptersData = await chaptersResponse.json();
      console.log('Chapters loaded:', chaptersData.length);
      
      // Organizar estudos com seus capítulos
      this.studies = studiesData.map((study: any) => ({
        ...study,
        is_premium: study.is_premium || false, // Usar a propriedade do JSON
        slug: study.slug || study.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), // Fallback para slug baseado no título
        chapters: chaptersData.filter((chapter: any) => chapter.study_id === study.id)
      }));
      
      this.chapters = chaptersData;
      this.loaded = true;
      
      console.log('Local content loaded successfully:', {
        studies: this.studies.length,
        chapters: this.chapters.length
      });
      
    } catch (error) {
      console.error('Error loading local content:', error);
      // Não deixar o app travar - definir como carregado mesmo com erro
      this.loaded = true;
      this.studies = [];
      this.chapters = [];
      console.log('Set fallback empty data to prevent infinite loops');
    }
  }

  // Obter todos os estudos (públicos e premium)
  async getAllStudies(): Promise<LocalStudy[]> {
    await this.loadContent();
    return this.studies.filter(study => study.is_active);
  }

  // Obter estudos públicos (não premium)
  async getPublicStudies(): Promise<LocalStudy[]> {
    await this.loadContent();
    return this.studies.filter(study => study.is_active && !study.is_premium);
  }

  // Obter estudos premium
  async getPremiumStudies(): Promise<LocalStudy[]> {
    await this.loadContent();
    return this.studies.filter(study => study.is_active && study.is_premium);
  }

  // Obter estudo por ID
  async getStudyById(studyId: string): Promise<LocalStudy | null> {
    await this.loadContent();
    return this.studies.find(study => study.id === studyId) || null;
  }

  // Obter estudo por slug (título convertido)
  async getStudyBySlug(slug: string): Promise<LocalStudy | null> {
    await this.loadContent();
    
    // Primeiro, tentar encontrar por slug exato
    const foundBySlug = this.studies.find(study => study.slug === slug);
    if (foundBySlug) {
      return foundBySlug;
    }
    
    // Se não encontrar por slug, tentar por título (compatibilidade)
    const searchTitle = decodeURIComponent(slug).replace(/-/g, ' ').toLowerCase();
    
    // Busca simples e direta
    const foundStudy = this.studies.find(study => {
      const studyTitle = study.title.toLowerCase();
      
      // Correspondência exata
      if (studyTitle === searchTitle) {
        return true;
      }
      
      // Correspondência parcial
      if (studyTitle.includes(searchTitle) || searchTitle.includes(studyTitle)) {
        return true;
      }
      
      return false;
    });
    
    return foundStudy || null;
  }

  // Obter capítulo específico
  async getChapter(studyId: string, chapterNumber: number): Promise<LocalChapter | null> {
    await this.loadContent();
    const study = await this.getStudyById(studyId);
    if (!study) return null;
    
    return study.chapters.find(chapter => chapter.chapter_number === chapterNumber) || null;
  }

  // Obter versículos básicos (sempre disponíveis)
  getBasicVerses(): LocalVerse[] {
    return this.verses;
  }

  // Obter versículos por categoria
  getVersesByCategory(category: string): LocalVerse[] {
    return this.verses.filter(verse => verse.category === category);
  }

  // Verificar se estudo é premium
  async isStudyPremium(studyId: string): Promise<boolean> {
    const study = await this.getStudyById(studyId);
    return study?.is_premium || false;
  }

  // Obter estatísticas
  async getStats() {
    await this.loadContent();
    return {
      totalStudies: this.studies.length,
      publicStudies: (await this.getPublicStudies()).length,
      premiumStudies: (await this.getPremiumStudies()).length,
      totalVerses: this.verses.length,
      totalChapters: this.studies.reduce((total, study) => total + study.chapters.length, 0)
    };
  }
}

// Instância singleton
export const localContent = LocalContentManager.getInstance(); 