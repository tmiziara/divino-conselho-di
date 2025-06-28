-- Script para verificar o conteúdo dos capítulos
-- Execute este script no SQL Editor do Supabase

-- Verificar todos os capítulos do estudo
SELECT 
    chapter_number,
    title,
    LEFT(reflective_reading, 200) || '...' as reflective_reading_preview,
    LEFT(chapter_prayer, 200) || '...' as chapter_prayer_preview,
    LEFT(practical_application, 200) || '...' as practical_application_preview
FROM bible_study_chapters 
WHERE study_id = (
    SELECT id FROM bible_studies 
    WHERE title = 'Vencendo a Ansiedade com Fé'
)
ORDER BY chapter_number;

-- Verificar o conteúdo completo do capítulo 1
SELECT 
    chapter_number,
    title,
    reflective_reading,
    chapter_prayer,
    practical_application
FROM bible_study_chapters 
WHERE study_id = (
    SELECT id FROM bible_studies 
    WHERE title = 'Vencendo a Ansiedade com Fé'
) AND chapter_number = 1; 