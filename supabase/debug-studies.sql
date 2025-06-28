-- Script para debugar os dados dos estudos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar todos os estudos ativos
SELECT 
  id,
  title,
  description,
  total_chapters,
  is_active,
  created_at
FROM bible_studies 
WHERE is_active = true
ORDER BY created_at DESC;

-- 2. Verificar todos os capítulos
SELECT 
  id,
  study_id,
  chapter_number,
  title,
  main_verse_reference,
  created_at
FROM bible_study_chapters
ORDER BY study_id, chapter_number;

-- 3. Verificar estudos com seus capítulos
SELECT 
  s.id as study_id,
  s.title as study_title,
  s.total_chapters,
  COUNT(c.id) as actual_chapters,
  s.is_active
FROM bible_studies s
LEFT JOIN bible_study_chapters c ON s.id = c.study_id
WHERE s.is_active = true
GROUP BY s.id, s.title, s.total_chapters, s.is_active
ORDER BY s.created_at DESC;

-- 4. Testar busca por título (como o código faz)
SELECT 
  id,
  title,
  description
FROM bible_studies
WHERE is_active = true
  AND title ILIKE '%vencendo%ansiedade%';

-- 5. Verificar se há estudos com títulos similares
SELECT 
  id,
  title,
  LOWER(title) as lower_title,
  LOWER(REPLACE(title, ' ', '-')) as slug_title
FROM bible_studies
WHERE is_active = true; 