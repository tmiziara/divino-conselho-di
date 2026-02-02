-- Update favorites table to allow 'study' type
ALTER TABLE public.favorites 
DROP CONSTRAINT IF EXISTS favorites_type_check;

ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_type_check 
CHECK (type = ANY (ARRAY['verse'::text, 'psalm'::text, 'message'::text, 'study'::text])); 