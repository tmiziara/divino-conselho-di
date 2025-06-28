-- Script para verificar se as atualizações foram aplicadas
-- Execute este script no Supabase SQL Editor para verificar

-- Verificar o comprimento do texto atualizado para cada capítulo
SELECT 
  chapter_number,
  title,
  LENGTH(reflective_reading) as text_length,
  LEFT(reflective_reading, 100) as preview
FROM public.bible_study_chapters 
WHERE study_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY chapter_number;

-- Verificar se há conteúdo significativo
SELECT 
  chapter_number,
  title,
  CASE 
    WHEN LENGTH(reflective_reading) > 1000 THEN '✅ Conteúdo completo'
    WHEN LENGTH(reflective_reading) > 500 THEN '⚠️ Conteúdo médio'
    ELSE '❌ Conteúdo curto'
  END as status
FROM public.bible_study_chapters 
WHERE study_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY chapter_number; 