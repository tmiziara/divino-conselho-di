-- Phase 5 (additive): cross-device progress + analytics tables.

-- Ensure updated_at helper exists for triggers.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bible progress: add version for cross-device resume.
ALTER TABLE public.bible_progress
  ADD COLUMN IF NOT EXISTS version TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
    WHERE c.conrelid = 'public.bible_progress'::regclass
      AND c.contype = 'u'
      AND array_length(c.conkey, 1) = 1
      AND a.attname = 'user_id'
  ) THEN
    ALTER TABLE public.bible_progress
      ADD CONSTRAINT bible_progress_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Notification schedules (optional sync).
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  schedules JSONB,
  prayer_schedules JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_schedules_select"
  ON public.notification_schedules
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notification_schedules_insert"
  ON public.notification_schedules
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notification_schedules_update"
  ON public.notification_schedules
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notification_schedules_delete"
  ON public.notification_schedules
  FOR DELETE
  USING (user_id = auth.uid());

CREATE TRIGGER update_notification_schedules_updated_at
  BEFORE UPDATE ON public.notification_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Analytics events (basic).
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_events_select"
  ON public.analytics_events
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "analytics_events_insert"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Chat history summaries (lightweight sync).
CREATE TABLE IF NOT EXISTS public.chat_history_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_messages INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_history_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_history_summaries_select"
  ON public.chat_history_summaries
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "chat_history_summaries_insert"
  ON public.chat_history_summaries
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_history_summaries_update"
  ON public.chat_history_summaries
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE TRIGGER update_chat_history_summaries_updated_at
  BEFORE UPDATE ON public.chat_history_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
