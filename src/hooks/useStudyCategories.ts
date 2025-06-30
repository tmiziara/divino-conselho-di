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
  const categorizedStudies = useMemo(() => {
    const categoriesMap = new Map<string, StudyCategory>();
    
    // Inicializar todas as categorias
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
    
    // Ordenar categorias: Completos e Em Progresso primeiro, depois as outras
    const orderedCategories: StudyCategory[] = [];
    
    // Adicionar Completos e Em Progresso primeiro
    const completos = categoriesMap.get('completos');
    const emProgresso = categoriesMap.get('em-progresso');
    
    if (completos && completos.count > 0) orderedCategories.push(completos);
    if (emProgresso && emProgresso.count > 0) orderedCategories.push(emProgresso);
    
    // Adicionar outras categorias que têm estudos
    categories.forEach(cat => {
      if (cat.id !== 'completos' && cat.id !== 'em-progresso') {
        const category = categoriesMap.get(cat.id);
        if (category && category.count > 0) {
          orderedCategories.push(category);
        }
      }
    });
    
    return orderedCategories;
  }, [studies, progress]);
  
  return categorizedStudies;
}; 