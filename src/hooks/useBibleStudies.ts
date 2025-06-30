import { useState, useEffect, useCallback } from 'react';
import { localContent, LocalStudy, LocalChapter } from '@/lib/localContent';
import { simpleLicense } from '@/lib/simpleLicense';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { useToast } from './use-toast';

export interface BibleStudy {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  total_chapters: number;
  is_active: boolean;
  is_premium?: boolean;
  slug?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface BibleStudyChapter {
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

export interface UserStudyProgress {
  id: string;
  user_id: string;
  study_id: string;
  chapter_id: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useBibleStudies = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [studies, setStudies] = useState<BibleStudy[]>([]);
  const [chapters, setChapters] = useState<BibleStudyChapter[]>([]);
  const [progress, setProgress] = useState<UserStudyProgress[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para verificar se tem acesso premium
  const hasPremiumAccess = useCallback(() => {
    // Verificar se tem assinatura premium ativa
    if (subscription.subscribed && subscription.subscription_tier === 'premium') {
      return true;
    }
    
    // Fallback para o sistema de licenças local
    const localAccess = simpleLicense.hasAccess('premium_studies');
    
    return localAccess;
  }, [subscription.subscribed, subscription.subscription_tier]);

  // Buscar todos os estudos (baseado na licença)
  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true);
      
      // Sempre carregar todos os estudos para que todos possam ver
      const availableStudies = await localContent.getAllStudies();
      
      // Converter para o formato esperado
      const formattedStudies: BibleStudy[] = availableStudies.map(study => ({
        id: study.id,
        title: study.title,
        description: study.description,
        cover_image: study.cover_image,
        total_chapters: study.total_chapters,
        is_active: study.is_active,
        is_premium: study.is_premium,
        slug: study.slug,
        category: study.category,
        created_at: study.created_at,
        updated_at: study.updated_at
      }));
      
      setStudies(formattedStudies);
    } catch (error) {
      console.error('Error fetching studies:', error);
      // Não usar toast aqui para evitar dependência circular
    } finally {
      setLoading(false);
    }
  }, []); // Removido toast da dependência

  // Buscar capítulos de um estudo
  const fetchChapters = useCallback(async (studySlug: string) => {
    try {
      setLoading(true);
      
      // Buscar estudo local
      const study = await localContent.getStudyBySlug(studySlug);
      
      if (!study) {
        setChapters([]);
        return [];
      }
      
      // Verificar se é premium e se tem acesso
      if (study.is_premium && !hasPremiumAccess()) {
        // Não usar toast aqui para evitar dependência circular
        console.log('Premium access required for study:', study.title);
        setChapters([]);
        return [];
      }
      
      // Verificar se o estudo tem capítulos
      if (!study.chapters || study.chapters.length === 0) {
        setChapters([]);
        return [];
      }
      
      // Converter capítulos para o formato esperado
      const formattedChapters: BibleStudyChapter[] = study.chapters.map(chapter => ({
        id: chapter.id,
        study_id: chapter.study_id,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        main_verse: chapter.main_verse,
        main_verse_reference: chapter.main_verse_reference,
        reflective_reading: chapter.reflective_reading,
        reflection_question: chapter.reflection_question,
        chapter_prayer: chapter.chapter_prayer,
        practical_application: chapter.practical_application,
        created_at: chapter.created_at,
        updated_at: chapter.updated_at
      }));
      
      setChapters(formattedChapters);
      return formattedChapters;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setChapters([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [hasPremiumAccess]);

  // Buscar progresso do usuário (simplificado - local storage)
  const fetchProgress = async () => {
    if (!user) return;

    try {
      const stored = window.localStorage.getItem(`progress_${user.id}`);
      const progress = stored ? JSON.parse(stored) : [];
      setProgress(progress);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Buscar favoritos do usuário (simplificado - local storage)
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const stored = window.localStorage.getItem(`favorites_${user.id}`);
      const favorites = stored ? JSON.parse(stored) : [];
      setFavorites(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Marcar capítulo como concluído
  const markChapterAsCompleted = async (chapterId: string, studyId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seu progresso.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newProgress: UserStudyProgress = {
        id: `${user.id}_${chapterId}`,
        user_id: user.id,
        study_id: studyId,
        chapter_id: chapterId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Salvar no localStorage
      const stored = window.localStorage.getItem(`progress_${user.id}`);
      const progress = stored ? JSON.parse(stored) : [];
      const updatedProgress = [...progress.filter((p: UserStudyProgress) => p.chapter_id !== chapterId), newProgress];
      window.localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedProgress));
      
      setProgress(updatedProgress);
      
      toast({
        title: "Capítulo concluído!",
        description: "Seu progresso foi salvo.",
      });
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível salvar seu progresso.",
        variant: "destructive"
      });
    }
  };

  // Marcar capítulo como incompleto
  const markChapterAsIncomplete = async (chapterId: string) => {
    if (!user) return;

    try {
      const stored = window.localStorage.getItem(`progress_${user.id}`);
      const progress = stored ? JSON.parse(stored) : [];
      const updatedProgress = progress.filter((p: UserStudyProgress) => p.chapter_id !== chapterId);
      window.localStorage.setItem(`progress_${user.id}`, JSON.stringify(updatedProgress));
      
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error marking chapter as incomplete:', error);
    }
  };

  // Alternar favorito
  const toggleFavorite = async (chapterId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar favoritos.",
        variant: "destructive"
      });
      return;
    }

    try {
      const stored = window.localStorage.getItem(`favorites_${user.id}`);
      const favorites = stored ? JSON.parse(stored) : [];
      
      const isFavorite = favorites.includes(chapterId);
      let updatedFavorites: string[];
      
      if (isFavorite) {
        updatedFavorites = favorites.filter((id: string) => id !== chapterId);
        toast({
          title: "Removido dos favoritos",
          description: "Capítulo removido da sua lista de favoritos.",
        });
      } else {
        updatedFavorites = [...favorites, chapterId];
        toast({
          title: "Adicionado aos favoritos",
          description: "Capítulo adicionado à sua lista de favoritos.",
        });
      }
      
      window.localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro ao salvar favorito",
        description: "Não foi possível salvar o favorito.",
        variant: "destructive"
      });
    }
  };

  // Verificar se capítulo está concluído
  const isChapterCompleted = (chapterId: string) => {
    return progress.some(p => p.chapter_id === chapterId && p.is_completed);
  };

  // Verificar se capítulo é favorito
  const isChapterFavorite = (chapterId: string) => {
    return favorites.includes(chapterId);
  };

  // Obter progresso de um estudo
  const getStudyProgress = (studyId: string) => {
    const studyProgress = progress.filter(p => p.study_id === studyId);
    const completedChapters = studyProgress.filter(p => p.is_completed).length;
    return { completedChapters, totalChapters: studyProgress.length };
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchStudies();
      if (user) {
        await fetchProgress();
        await fetchFavorites();
      }
    };
    
    loadInitialData();
  }, [user?.id]); // Usar apenas user.id como dependência estável

  return {
    studies,
    chapters,
    progress,
    favorites,
    loading,
    fetchStudies,
    fetchChapters,
    fetchProgress,
    fetchFavorites,
    markChapterAsCompleted,
    markChapterAsIncomplete,
    toggleFavorite,
    isChapterCompleted,
    isChapterFavorite,
    getStudyProgress
  };
}; 