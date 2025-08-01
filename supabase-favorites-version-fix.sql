-- Script para corrigir o sistema de favoritos e identificar versões
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna version já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' AND column_name = 'version'
    ) THEN
        -- Adicionar coluna version se não existir
        ALTER TABLE public.favorites ADD COLUMN version TEXT;
        RAISE NOTICE 'Coluna version adicionada à tabela favorites';
    ELSE
        RAISE NOTICE 'Coluna version já existe na tabela favorites';
    END IF;
END $$;

-- 2. Criar índice para a coluna version (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'favorites' AND indexname = 'idx_favorites_version'
    ) THEN
        CREATE INDEX idx_favorites_version ON public.favorites(version);
        RAISE NOTICE 'Índice idx_favorites_version criado';
    ELSE
        RAISE NOTICE 'Índice idx_favorites_version já existe';
    END IF;
END $$;

-- 3. Atualizar favoritos existentes que não têm versão definida
-- Para favoritos do tipo 'verse', definir versão padrão como 'nvi'
UPDATE public.favorites 
SET version = 'nvi' 
WHERE version IS NULL 
AND type = 'verse';

-- 4. Verificar se há favoritos duplicados (mesmo versículo em versões diferentes)
-- Esta query mostra favoritos que podem ter problemas
SELECT 
    book, 
    chapter, 
    verse, 
    version,
    COUNT(*) as count,
    array_agg(id) as favorite_ids
FROM public.favorites 
WHERE type = 'verse' 
GROUP BY book, chapter, verse, version
HAVING COUNT(*) > 1
ORDER BY book, chapter, verse, version;

-- 5. Criar uma view para facilitar consultas de favoritos por versão
CREATE OR REPLACE VIEW favorites_by_version AS
SELECT 
    f.id,
    f.user_id,
    f.type,
    f.title,
    f.content,
    f.reference,
    f.book,
    f.chapter,
    f.verse,
    f.version,
    f.created_at,
    -- Adicionar label da versão
    CASE 
        WHEN f.version = 'nvi' THEN 'NVI'
        WHEN f.version = 'pt_aa' THEN 'AA'
        WHEN f.version = 'pt_acf' THEN 'ACF'
        WHEN f.version = 'pt_ara' THEN 'ARA'
        WHEN f.version = 'pt_arc' THEN 'ARC'
        WHEN f.version = 'pt_bb' THEN 'BB'
        WHEN f.version = 'pt_bv' THEN 'BV'
        WHEN f.version = 'pt_ntlh' THEN 'NTLH'
        WHEN f.version = 'pt_ol' THEN 'OL'
        WHEN f.version = 'pt_tb' THEN 'TB'
        WHEN f.version = 'pt_vfa' THEN 'VFA'
        ELSE UPPER(f.version)
    END as version_label
FROM public.favorites f
WHERE f.type = 'verse';

-- 6. Criar função para verificar se um versículo é favorito
CREATE OR REPLACE FUNCTION is_verse_favorite(
    p_user_id UUID,
    p_book TEXT,
    p_chapter INTEGER,
    p_verse INTEGER,
    p_version TEXT DEFAULT 'nvi'
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.favorites 
        WHERE user_id = p_user_id 
        AND book = p_book 
        AND chapter = p_chapter 
        AND verse = p_verse 
        AND version = p_version
        AND type = 'verse'
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Criar função para adicionar favorito com versão
CREATE OR REPLACE FUNCTION add_verse_favorite(
    p_user_id UUID,
    p_book TEXT,
    p_chapter INTEGER,
    p_verse INTEGER,
    p_title TEXT,
    p_content TEXT,
    p_reference TEXT,
    p_version TEXT DEFAULT 'nvi'
)
RETURNS UUID AS $$
DECLARE
    v_favorite_id UUID;
BEGIN
    -- Verificar se já existe um favorito para este versículo nesta versão
    IF is_verse_favorite(p_user_id, p_book, p_chapter, p_verse, p_version) THEN
        RAISE EXCEPTION 'Versículo já está nos favoritos para esta versão';
    END IF;
    
    -- Inserir novo favorito
    INSERT INTO public.favorites (
        user_id, type, title, content, reference, 
        book, chapter, verse, version
    ) VALUES (
        p_user_id, 'verse', p_title, p_content, p_reference,
        p_book, p_chapter, p_verse, p_version
    ) RETURNING id INTO v_favorite_id;
    
    RETURN v_favorite_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar função para remover favorito com versão
CREATE OR REPLACE FUNCTION remove_verse_favorite(
    p_user_id UUID,
    p_book TEXT,
    p_chapter INTEGER,
    p_verse INTEGER,
    p_version TEXT DEFAULT 'nvi'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.favorites 
    WHERE user_id = p_user_id 
    AND book = p_book 
    AND chapter = p_chapter 
    AND verse = p_verse 
    AND version = p_version
    AND type = 'verse';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para garantir que versículos tenham versão
CREATE OR REPLACE FUNCTION ensure_verse_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for um versículo e não tiver versão, definir como 'nvi'
    IF NEW.type = 'verse' AND (NEW.version IS NULL OR NEW.version = '') THEN
        NEW.version := 'nvi';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_ensure_verse_version'
    ) THEN
        CREATE TRIGGER trigger_ensure_verse_version
        BEFORE INSERT OR UPDATE ON public.favorites
        FOR EACH ROW
        EXECUTE FUNCTION ensure_verse_version();
        RAISE NOTICE 'Trigger trigger_ensure_verse_version criado';
    ELSE
        RAISE NOTICE 'Trigger trigger_ensure_verse_version já existe';
    END IF;
END $$;

-- 10. Query para verificar o status atual dos favoritos
SELECT 
    'Status dos Favoritos' as info,
    COUNT(*) as total_favorites,
    COUNT(CASE WHEN type = 'verse' THEN 1 END) as verse_favorites,
    COUNT(CASE WHEN type = 'study' THEN 1 END) as study_favorites,
    COUNT(CASE WHEN version IS NOT NULL THEN 1 END) as with_version,
    COUNT(CASE WHEN version IS NULL THEN 1 END) as without_version
FROM public.favorites;

-- 11. Query para mostrar favoritos por versão
SELECT 
    version,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM public.favorites 
WHERE type = 'verse' 
GROUP BY version 
ORDER BY count DESC;

-- 12. Limpar favoritos duplicados (opcional - descomente se necessário)
/*
DELETE FROM public.favorites 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, book, chapter, verse, version 
                   ORDER BY created_at DESC
               ) as rn
        FROM public.favorites 
        WHERE type = 'verse'
    ) t 
    WHERE t.rn > 1
);
*/

-- Mensagem de conclusão
SELECT 'Script de correção de favoritos executado com sucesso!' as status; 