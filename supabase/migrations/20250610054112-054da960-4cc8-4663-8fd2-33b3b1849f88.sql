-- Deletar todos os dados do usuário atual e tabela subscribers
DELETE FROM public.subscribers WHERE user_id = 'b6c4484f-6125-4009-ab27-af85d0362409';
DELETE FROM public.profiles WHERE user_id = 'b6c4484f-6125-4009-ab27-af85d0362409';
DELETE FROM public.favorites WHERE user_id = 'b6c4484f-6125-4009-ab27-af85d0362409';
DELETE FROM public.chat_messages WHERE user_id = 'b6c4484f-6125-4009-ab27-af85d0362409';
DELETE FROM public.bible_progress WHERE user_id = 'b6c4484f-6125-4009-ab27-af85d0362409';

-- Deletar o usuário da tabela de autenticação (por último)
DELETE FROM auth.users WHERE id = 'b6c4484f-6125-4009-ab27-af85d0362409';

-- Deletar a tabela subscribers completamente
DROP TABLE IF EXISTS public.subscribers;