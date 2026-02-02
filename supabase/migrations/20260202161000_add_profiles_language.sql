-- PR2: persist app language preference in profiles.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language TEXT;

ALTER TABLE public.profiles
  ALTER COLUMN language SET DEFAULT 'pt';

UPDATE public.profiles
SET language = 'pt'
WHERE language IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_language_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_language_check
      CHECK (language IN ('pt', 'en'));
  END IF;
END $$;
