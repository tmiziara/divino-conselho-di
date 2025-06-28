import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface BibleStudy {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  total_chapters: number;
  is_active: boolean;
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
  const { toast } = useToast();
  const [studies, setStudies] = useState<BibleStudy[]>([]);
  const [chapters, setChapters] = useState<BibleStudyChapter[]>([]);
  const [progress, setProgress] = useState<UserStudyProgress[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar todos os estudos
  const fetchStudies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudies(data || []);
    } catch (error) {
      console.error('Error fetching studies:', error);
      toast({
        title: "Erro ao carregar estudos",
        description: "Não foi possível carregar os estudos bíblicos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar capítulos de um estudo
  const fetchChapters = async (studySlug: string) => {
    try {
      setLoading(true);
      console.log('fetchChapters called with studySlug:', studySlug);
      console.log('User agent:', navigator.userAgent);
      console.log('Is mobile:', /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
      
      // Converter o slug de volta para o título
      const title = decodeURIComponent(studySlug).replace(/-/g, ' ');
      console.log('Decoded title:', title);
      
      // Primeiro buscar o estudo pelo título
      const { data: studyData, error: studyError } = await supabase
        .from('bible_studies')
        .select('id')
        .eq('is_active', true)
        .ilike('title', `%${title}%`)
        .single();

      console.log('Study search result:', { studyData, studyError });

      if (studyError) {
        console.error('Study search error:', studyError);
        throw studyError;
      }
      
      if (!studyData) {
        console.error('No study found for title:', title);
        throw new Error('Estudo não encontrado');
      }

      console.log('Found study ID:', studyData.id);

      // Agora buscar os capítulos usando o ID do estudo
      const { data, error } = await supabase
        .from('bible_study_chapters')
        .select('*')
        .eq('study_id', studyData.id)
        .order('chapter_number', { ascending: true });

      console.log('Chapters search result:', { data, error, count: data?.length });

      if (error) {
        console.error('Chapters search error:', error);
        throw error;
      }
      
      console.log('Setting chapters:', data);
      setChapters(data || []);
      
      // Retornar o ID do estudo para que o componente possa usar
      return studyData.id;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setChapters([]); // Garantir que chapters seja um array vazio em caso de erro
      toast({
        title: "Erro ao carregar capítulos",
        description: "Não foi possível carregar os capítulos do estudo.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar progresso do usuário
  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Buscar favoritos do usuário
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_study_favorites')
        .select('chapter_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(fav => fav.chapter_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Marcar capítulo como concluído
  const markChapterAsCompleted = async (chapterId: string, studyId: string) => {
    console.log('markChapterAsCompleted called with:', { chapterId, studyId, userId: user?.id });
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para salvar seu progresso.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Inserting progress record...');
      const { error } = await supabase
        .from('user_study_progress')
        .upsert({
          user_id: user.id,
          study_id: studyId,
          chapter_id: chapterId,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Progress saved successfully');
      toast({
        title: "Progresso salvo!",
        description: "Capítulo marcado como concluído.",
      });

      // Atualizar estado local
      await fetchProgress();
    } catch (error) {
      console.error('Error marking chapter as completed:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível salvar seu progresso.",
        variant: "destructive"
      });
      throw error; // Re-throw para que o componente possa tratar
    }
  };

  // Adicionar/remover favorito
  const toggleFavorite = async (chapterId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar capítulos.",
        variant: "destructive"
      });
      return;
    }

    try {
      const isFavorite = favorites.includes(chapterId);

      if (isFavorite) {
        // Remover favorito
        const { error } = await supabase
          .from('user_study_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== chapterId));
        toast({
          title: "Favorito removido",
          description: "Capítulo removido dos favoritos.",
        });
      } else {
        // Adicionar favorito
        const { error } = await supabase
          .from('user_study_favorites')
          .insert({
            user_id: user.id,
            chapter_id: chapterId
          });

        if (error) throw error;

        setFavorites(prev => [...prev, chapterId]);
        toast({
          title: "Favorito adicionado",
          description: "Capítulo adicionado aos favoritos.",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erro ao favoritar",
        description: "Não foi possível atualizar favoritos.",
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

  // Buscar progresso de um estudo específico
  const getStudyProgress = (studyId: string) => {
    const studyProgress = progress.filter(p => p.study_id === studyId);
    const completedChapters = studyProgress.filter(p => p.is_completed).length;
    const totalChapters = chapters.filter(c => c.study_id === studyId).length;
    
    return {
      completed: completedChapters,
      total: totalChapters,
      percentage: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
    };
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchStudies();
    if (user) {
      fetchProgress();
      fetchFavorites();
    }
  }, [user]);

  return {
    studies,
    chapters,
    progress,
    favorites,
    loading,
    fetchStudies,
    fetchChapters,
    markChapterAsCompleted,
    toggleFavorite,
    isChapterCompleted,
    isChapterFavorite,
    getStudyProgress
  };
}; 