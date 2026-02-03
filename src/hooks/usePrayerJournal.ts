import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { recordActivity } from "@/lib/activityLog";

export interface PrayerJournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  promptId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const getIdentity = (userId?: string | null) => userId ?? "guest";

const getJournalKey = (userId?: string | null) =>
  `prayer_journal_v1_${getIdentity(userId)}`;

const safeParse = <T,>(value: string | null, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    return fallback;
  }
};

const createLocalId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `journal_${Math.random().toString(36).slice(2, 10)}`;
};

export const usePrayerJournal = () => {
  const { user } = useAuth();
  const { isEnglish } = useLanguage();
  const [entries, setEntries] = useState<PrayerJournalEntry[]>([]);

  useEffect(() => {
    const key = getJournalKey(user?.id);
    setEntries(safeParse<PrayerJournalEntry[]>(localStorage.getItem(key), []));
  }, [user?.id]);

  const saveEntries = useCallback(
    (next: PrayerJournalEntry[]) => {
      const key = getJournalKey(user?.id);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (error) {
        // Journal is local-only; keep UI usable if storage fails.
      }
      setEntries(next);
    },
    [user?.id]
  );

  const createEntry = useCallback(
    (payload: { title: string; content: string; promptId?: string; tags?: string[] }) => {
      const now = new Date().toISOString();
      const entry: PrayerJournalEntry = {
        id: createLocalId(),
        date: now,
        title: payload.title,
        content: payload.content,
        promptId: payload.promptId,
        tags: payload.tags,
        createdAt: now,
        updatedAt: now,
      };

      const next = [entry, ...entries];
      // Prayer journal entries are stored locally and never sent to the server.
      saveEntries(next);
      recordActivity({ userId: user?.id, source: "journal", count: 1 });
      return entry;
    },
    [entries, saveEntries, user?.id]
  );

  const updateEntry = useCallback(
    (entryId: string, updates: Partial<Omit<PrayerJournalEntry, "id" | "createdAt">>) => {
      const next = entries.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      });
      saveEntries(next);
    },
    [entries, saveEntries]
  );

  const deleteEntry = useCallback(
    (entryId: string) => {
      const next = entries.filter((entry) => entry.id !== entryId);
      saveEntries(next);
    },
    [entries, saveEntries]
  );

  const getEntryById = useCallback(
    (entryId: string) => entries.find((entry) => entry.id === entryId) || null,
    [entries]
  );

  const prompts = useMemo(
    () => {
      const tx = (pt: string, en: string) => (isEnglish ? en : pt);
      return [
        {
          id: "gratidao",
          label: tx("Pelo que você é grato hoje?", "What are you grateful for today?"),
        },
        {
          id: "preocupacao",
          label: tx("O que você quer entregar em oração?", "What do you want to surrender in prayer?"),
        },
        {
          id: "pedido",
          label: tx("Quem ou o que precisa das suas orações hoje?", "Who or what needs your prayers today?"),
        },
        {
          id: "resposta",
          label: tx("Como você percebeu a ação de Deus hoje?", "How did you notice God's action today?"),
        },
      ];
    },
    [isEnglish]
  );

  return {
    entries,
    prompts,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
  };
};
