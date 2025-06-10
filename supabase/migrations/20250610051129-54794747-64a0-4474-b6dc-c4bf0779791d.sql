-- Deletar todos os dados do usuário 4d0b283c-07a6-4564-9501-8d412f3304ed

-- Deletar dados relacionados ao usuário
DELETE FROM public.subscribers WHERE user_id = '4d0b283c-07a6-4564-9501-8d412f3304ed';
DELETE FROM public.profiles WHERE user_id = '4d0b283c-07a6-4564-9501-8d412f3304ed';
DELETE FROM public.favorites WHERE user_id = '4d0b283c-07a6-4564-9501-8d412f3304ed';
DELETE FROM public.chat_messages WHERE user_id = '4d0b283c-07a6-4564-9501-8d412f3304ed';
DELETE FROM public.bible_progress WHERE user_id = '4d0b283c-07a6-4564-9501-8d412f3304ed';

-- Deletar o usuário da tabela de autenticação (por último)
DELETE FROM auth.users WHERE id = '4d0b283c-07a6-4564-9501-8d412f3304ed';