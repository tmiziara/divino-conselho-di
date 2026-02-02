-- Add gender field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outros')) DEFAULT 'masculino';