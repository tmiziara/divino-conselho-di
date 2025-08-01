-- Script SIMPLES para corrigir favoritos e identificar versões
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna version se não existir
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS version TEXT;

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_favorites_version ON public.favorites(version);

-- 3. Atualizar favoritos existentes sem versão
UPDATE public.favorites 
SET version = 'nvi' 
WHERE version IS NULL 
AND type = 'verse';

-- 4. Verificar status atual
SELECT 
    'Favoritos com versão:' as status,
    COUNT(*) as total,
    COUNT(CASE WHEN version IS NOT NULL THEN 1 END) as com_versao,
    COUNT(CASE WHEN version IS NULL THEN 1 END) as sem_versao
FROM public.favorites 
WHERE type = 'verse';

-- 5. Mostrar distribuição por versão
SELECT 
    version,
    COUNT(*) as quantidade
FROM public.favorites 
WHERE type = 'verse' 
GROUP BY version 
ORDER BY quantidade DESC;

-- 6. Verificar duplicatas (mesmo versículo em versões diferentes)
SELECT 
    book, chapter, verse, version, COUNT(*) as duplicatas
FROM public.favorites 
WHERE type = 'verse' 
GROUP BY book, chapter, verse, version
HAVING COUNT(*) > 1
ORDER BY book, chapter, verse;

-- Concluído!
SELECT 'Script básico executado com sucesso!' as resultado; 