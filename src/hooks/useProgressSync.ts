import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BIBLE_PROGRESS_KEY = "bible_reading_position";
const NOTIFICATION_SCHEDULES_KEY = "notification_schedules";
const PRAYER_SCHEDULES_KEY = "prayer_schedules";
const NOTIFICATION_META_KEY = "notification_schedules_meta";

interface LocalBibleProgress {
  book: string;
  chapter: number;
  verse?: number;
  version?: string;
  updated_at?: string;
}

interface LocalStudyProgress {
  id?: string;
  user_id: string;
  study_id: string;
  chapter_id: string;
  is_completed: boolean;
  completed_at?: string;
  updated_at?: string;
  created_at?: string;
}

const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeParse = <T,>(value: string | null, fallback: T): T => {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
};

const saveLocalBibleProgress = (position: LocalBibleProgress) => {
  try {
    localStorage.setItem(BIBLE_PROGRESS_KEY, JSON.stringify(position));
    // Phase 5: broadcast to update home/reader across tabs/devices.
    window.dispatchEvent(new CustomEvent("bibleProgressUpdated", { detail: position }));
  } catch (error) {
    // Ignore storage errors to keep UX functional.
  }
};

const syncBibleProgress = async (userId: string) => {
  try {
    const localProgress = safeParse<LocalBibleProgress>(
      localStorage.getItem(BIBLE_PROGRESS_KEY),
      null
    );
    const localUpdatedAt = toTimestamp(localProgress?.updated_at);

    const { data, error } = await supabase
      .from("bible_progress")
      .select("book, chapter, verse, version, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return;

    const remoteUpdatedAt = toTimestamp(data?.updated_at);

    if (data && remoteUpdatedAt > localUpdatedAt) {
      saveLocalBibleProgress({
        book: data.book,
        chapter: data.chapter,
        verse: data.verse ?? 1,
        version: data.version ?? "nvi",
        updated_at: data.updated_at,
      });
      return;
    }

    if (localProgress && (!data || localUpdatedAt > remoteUpdatedAt)) {
      // Phase 5: keep Supabase in sync with newest local progress.
      await supabase.from("bible_progress").upsert(
        {
          user_id: userId,
          book: localProgress.book,
          chapter: localProgress.chapter,
          verse: localProgress.verse ?? 1,
          version: localProgress.version ?? "nvi",
          updated_at: localProgress.updated_at ?? new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }
  } catch (error) {
    // Best-effort sync only.
  }
};

const mergeStudyProgress = (
  localProgress: LocalStudyProgress[],
  remoteProgress: LocalStudyProgress[]
) => {
  const mergedMap = new Map<string, LocalStudyProgress>();

  for (const item of localProgress) {
    mergedMap.set(item.chapter_id, item);
  }

  for (const item of remoteProgress) {
    const existing = mergedMap.get(item.chapter_id);
    if (!existing) {
      mergedMap.set(item.chapter_id, item);
      continue;
    }

    const existingUpdated = toTimestamp(existing.updated_at || existing.completed_at);
    const incomingUpdated = toTimestamp(item.updated_at || item.completed_at);

    if (incomingUpdated >= existingUpdated) {
      mergedMap.set(item.chapter_id, item);
    }
  }

  return Array.from(mergedMap.values());
};

const syncStudyProgress = async (userId: string) => {
  try {
    const localKey = `progress_${userId}`;
    const localProgress = safeParse<LocalStudyProgress[]>(
      localStorage.getItem(localKey),
      []
    );

    const { data, error } = await supabase
      .from("user_study_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) return;

    const remoteProgress = data ?? [];
    const merged = mergeStudyProgress(localProgress, remoteProgress);

    try {
      localStorage.setItem(localKey, JSON.stringify(merged));
      // Phase 5: broadcast progress updates to home/study screens.
      window.dispatchEvent(new CustomEvent("studyProgressUpdated", { detail: merged }));
    } catch (error) {
      // Ignore local storage errors.
    }

    const remoteMap = new Map(
      remoteProgress.map((item) => [item.chapter_id, item])
    );
    const toUpsert = merged.filter((item) => {
      const remoteItem = remoteMap.get(item.chapter_id);
      if (!remoteItem) return true;
      return (
        toTimestamp(item.updated_at || item.completed_at) >
        toTimestamp(remoteItem.updated_at || remoteItem.completed_at)
      );
    });

    if (toUpsert.length > 0) {
      // Phase 5: upsert newer local progress into Supabase.
      await supabase.from("user_study_progress").upsert(toUpsert, {
        onConflict: "user_id,chapter_id",
      });
    }
  } catch (error) {
    // Best-effort sync only.
  }
};

const syncNotificationSchedules = async (userId: string) => {
  try {
    const localSchedules = safeParse<Record<string, unknown>[]>(
      localStorage.getItem(NOTIFICATION_SCHEDULES_KEY),
      []
    );
    const localPrayerSchedules = safeParse<Record<string, unknown>[]>(
      localStorage.getItem(PRAYER_SCHEDULES_KEY),
      []
    );
    const localMeta = safeParse<{ updated_at?: string }>(
      localStorage.getItem(NOTIFICATION_META_KEY),
      {}
    );
    const localUpdatedAt = toTimestamp(localMeta.updated_at);

    const { data, error } = await supabase
      .from("notification_schedules")
      .select("schedules, prayer_schedules, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return;

    const remoteUpdatedAt = toTimestamp(data?.updated_at);

    if (data && remoteUpdatedAt > localUpdatedAt) {
      localStorage.setItem(
        NOTIFICATION_SCHEDULES_KEY,
        JSON.stringify(data.schedules ?? [])
      );
      localStorage.setItem(
        PRAYER_SCHEDULES_KEY,
        JSON.stringify(data.prayer_schedules ?? [])
      );
      localStorage.setItem(
        NOTIFICATION_META_KEY,
        JSON.stringify({ updated_at: data.updated_at })
      );
      // Phase 5: notify hooks to refresh schedules from storage.
      window.dispatchEvent(new CustomEvent("notificationSchedulesUpdated"));
      return;
    }

    if (localUpdatedAt > remoteUpdatedAt) {
      await supabase.from("notification_schedules").upsert(
        {
          user_id: userId,
          schedules: localSchedules,
          prayer_schedules: localPrayerSchedules,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }
  } catch (error) {
    // Best-effort sync only.
  }
};

export const useProgressSync = (userId?: string | null) => {
  useEffect(() => {
    if (!userId) return;

    // Phase 5: sync cross-device progress once per login session.
    void syncBibleProgress(userId);
    void syncStudyProgress(userId);
    void syncNotificationSchedules(userId);
  }, [userId]);
};
