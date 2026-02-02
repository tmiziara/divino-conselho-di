-- Deletar todos os dados do usuário a7c79dfe-1fe0-4423-a3d2-e711602b784f

-- Deletar dados relacionados ao usuário
DELETE FROM public.subscribers WHERE user_id = 'a7c79dfe-1fe0-4423-a3d2-e711602b784f';
DELETE FROM public.profiles WHERE user_id = 'a7c79dfe-1fe0-4423-a3d2-e711602b784f';
DELETE FROM public.favorites WHERE user_id = 'a7c79dfe-1fe0-4423-a3d2-e711602b784f';
DELETE FROM public.chat_messages WHERE user_id = 'a7c79dfe-1fe0-4423-a3d2-e711602b784f';
DELETE FROM public.bible_progress WHERE user_id = 'a7c79dfe-1fe0-4423-a3d2-e711602b784f';

-- Deletar o usuário da tabela de autenticação (por último)
DELETE FROM auth.users WHERE id = 'a7c79dfe-1fe0-4423-a3d2-e711602b784f';