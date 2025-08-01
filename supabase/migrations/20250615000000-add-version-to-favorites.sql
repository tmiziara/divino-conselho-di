-- Add version column to favorites table
ALTER TABLE public.favorites ADD COLUMN version TEXT;

-- Create index for version column
CREATE INDEX idx_favorites_version ON public.favorites(version);

-- Update existing favorites to have default version 'nvi'
UPDATE public.favorites SET version = 'nvi' WHERE version IS NULL AND type = 'verse'; 