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
  private chaptersByStudy: Map<string, LocalChapter[]> = new Map();
  private loadedStudies = false;
  private loadedChapters = false;
  private verses: LocalVerse[] = [];
  
  private constructor() {}
  
  static getInstance(): LocalContentManager {
    if (!LocalContentManager.instance) {
      LocalContentManager.instance = new LocalContentManager();
    }
    return LocalContentManager.instance;
  }

  // Carregar apenas os metadados dos estudos
  private async loadStudies() {
    if (this.loadedStudies) return;
    try {
      console.time('FetchStudiesJSON');
      const studiesResponse = await fetch('/data/bible_studies.json');
      if (!studiesResponse.ok) throw new Error(`Failed to load studies: ${studiesResponse.status}`);
      const studiesDataText = await studiesResponse.text();
      console.timeEnd('FetchStudiesJSON');
      console.time('ParseStudiesJSON');
      const studiesData = JSON.parse(studiesDataText);
      console.timeEnd('ParseStudiesJSON');
      this.studies = studiesData.map((study: any) => ({
        ...study,
        is_premium: study.is_premium || false,
        slug: study.slug || study.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        // chapters: [] // Não carregar capítulos aqui
      }));
      this.loadedStudies = true;
    } catch (error) {
      console.error('Error loading studies:', error);
      this.studies = [];
      this.loadedStudies = true;
    }
  }

  // Carregar todos os capítulos (usado apenas para cache, se necessário)
  private async loadAllChapters() {
    if (this.loadedChapters) return;
    try {
      const chaptersResponse = await fetch('/data/bible_study_chapters.json');
      if (!chaptersResponse.ok) throw new Error(`Failed to load chapters: ${chaptersResponse.status}`);
      const chaptersData = await chaptersResponse.json();
      // Indexar capítulos por study_id
      this.chaptersByStudy = new Map();
      chaptersData.forEach((chapter: any) => {
        if (!this.chaptersByStudy.has(chapter.study_id)) {
          this.chaptersByStudy.set(chapter.study_id, []);
        }
        this.chaptersByStudy.get(chapter.study_id)!.push(chapter);
      });
      this.loadedChapters = true;
    } catch (error) {
      console.error('Error loading chapters:', error);
      this.chaptersByStudy = new Map();
      this.loadedChapters = true;
    }
  }

  // Obter todos os estudos (apenas metadados)
  async getAllStudies(): Promise<LocalStudy[]> {
    await this.loadStudies();
    return this.studies.filter(study => study.is_active);
  }

  // Obter capítulos de um estudo sob demanda (agora busca arquivo separado)
  async getChaptersByStudyId(studyId: string): Promise<LocalChapter[]> {
    // Cache simples em memória
    if (!this.chaptersByStudy.has(studyId)) {
      try {
        console.time(`FetchChaptersJSON_${studyId}`);
        const response = await fetch(`/data/chapters_${studyId}.json`);
        if (!response.ok) throw new Error('Capítulos não encontrados para o estudo');
        const chaptersText = await response.text();
        console.timeEnd(`FetchChaptersJSON_${studyId}`);
        console.time(`ParseChaptersJSON_${studyId}`);
        const chapters = JSON.parse(chaptersText);
        console.timeEnd(`ParseChaptersJSON_${studyId}`);
        this.chaptersByStudy.set(studyId, chapters);
      } catch (error) {
        console.error('Erro ao buscar capítulos do estudo', studyId, error);
        this.chaptersByStudy.set(studyId, []);
      }
    }
    return this.chaptersByStudy.get(studyId) || [];
  }

  // Obter estudo por ID (sem capítulos)
  async getStudyById(studyId: string): Promise<LocalStudy | null> {
    await this.loadStudies();
    return this.studies.find(study => study.id === studyId) || null;
  }

  // Obter estudo por slug (sem capítulos)
  async getStudyBySlug(slug: string): Promise<LocalStudy | null> {
    await this.loadStudies();
    const foundBySlug = this.studies.find(study => study.slug === slug);
    if (foundBySlug) return foundBySlug;
    const searchTitle = decodeURIComponent(slug).replace(/-/g, ' ').toLowerCase();
    const foundStudy = this.studies.find(study => {
      const studyTitle = study.title.toLowerCase();
      if (studyTitle === searchTitle) return true;
      if (studyTitle.includes(searchTitle) || searchTitle.includes(studyTitle)) return true;
      return false;
    });
    return foundStudy || null;
  }

  // Obter capítulos de um estudo por slug
  async getChaptersByStudySlug(slug: string): Promise<LocalChapter[]> {
    const study = await this.getStudyBySlug(slug);
    if (!study) return [];
    return this.getChaptersByStudyId(study.id);
  }

  // Obter capítulo específico
  async getChapter(studyId: string, chapterNumber: number): Promise<LocalChapter | null> {
    const chapters = await this.getChaptersByStudyId(studyId);
    return chapters.find(chapter => chapter.chapter_number === chapterNumber) || null;
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
    await this.loadStudies();
    return {
      totalStudies: this.studies.length,
      totalVerses: this.verses.length,
      totalChapters: this.studies.reduce((total, study) => total + study.total_chapters, 0)
    };
  }
}

// Instância singleton
export const localContent = LocalContentManager.getInstance(); 