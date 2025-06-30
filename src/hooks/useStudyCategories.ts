import { useMemo } from 'react';
import { BibleStudy } from './useBibleStudies';
import { categories, CategoryConfig } from '@/lib/categories';

export interface StudyCategory {
  id: string;
  name: string;
  studies: BibleStudy[];
  count: number;
  config: CategoryConfig;
}

export const useStudyCategories = (studies: BibleStudy[], progress: any[]) => {
  // Inicializar todas as categorias, inclusive completos e em-progresso
  const categoriesMap = new Map<string, StudyCategory>();

  categories.forEach(cat => {
    categoriesMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      studies: [],
      count: 0,
      config: cat
    });
  });

  // Categorizar estudos
  studies.forEach(study => {
    // Verificar se o estudo está completo
    const studyProgress = progress.filter(p => p.study_id === study.id);
    const completedChapters = studyProgress.filter(p => p.is_completed).length;
    const isComplete = completedChapters === study.total_chapters && study.total_chapters > 0;
    const isInProgress = completedChapters > 0 && !isComplete;

    // Determinar categoria
    let categoryId = study.category || 'vida-espiritual'; // fallback
    if (isComplete) {
      categoryId = 'completos';
    } else if (isInProgress) {
      categoryId = 'em-progresso';
    }

    // Adicionar estudo à categoria
    const category = categoriesMap.get(categoryId);
    if (category) {
      category.studies.push(study);
      category.count = category.studies.length;
    }
  });

  // Retornar todas as categorias, mesmo as vazias, na ordem do array categories
  const allCats = categories.map(cat => categoriesMap.get(cat.id)).filter(Boolean);
  // Log para depuração
  console.log('useStudyCategories - categories IDs:', categories.map(cat => cat.id));
  console.log('useStudyCategories - allCats:', JSON.stringify(allCats));
  return allCats;
}; 