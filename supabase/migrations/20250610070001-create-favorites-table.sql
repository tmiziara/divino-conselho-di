-- Create favorites table for verses and study content
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('verse', 'study', 'psalm', 'message')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  reference TEXT,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites (users can only see and manage their own favorites)
CREATE POLICY "favorites_select" ON public.favorites
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "favorites_insert" ON public.favorites
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_update" ON public.favorites
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "favorites_delete" ON public.favorites
FOR DELETE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_type ON public.favorites(type);
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at);
CREATE INDEX idx_favorites_version ON public.favorites(version); 