export type ActivitySource = "bible" | "plan" | "study" | "journal";

export interface ActivityEntry {
  id: string;
  dateKey: string;
  source: ActivitySource;
  count: number;
  createdAt: string;
  uniqueKey?: string;
}

const pad = (value: number) => value.toString().padStart(2, "0");

export const getLocalDateKey = (date: Date = new Date()) => {
  // Use local date parts to avoid timezone surprises in streak/summary.
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getWeekKey = (date: Date = new Date()) => {
  // ISO-ish week key for grace-day tracking (YYYY-WW).
  const temp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
  const yearStart = new Date(temp.getFullYear(), 0, 1);
  const week = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${temp.getFullYear()}-${pad(week)}`;
};

const getIdentity = (userId?: string | null) => userId ?? "guest";

const getActivityKey = (userId?: string | null) =>
  `activity_log_v1_${getIdentity(userId)}`;

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
  return `local_${Math.random().toString(36).slice(2, 10)}`;
};

export const getActivityLog = (userId?: string | null) => {
  const key = getActivityKey(userId);
  return safeParse<ActivityEntry[]>(localStorage.getItem(key), []);
};

export const recordActivity = (params: {
  userId?: string | null;
  source: ActivitySource;
  count?: number;
  uniqueKey?: string;
}) => {
  const { userId, source, count = 1, uniqueKey } = params;
  const key = getActivityKey(userId);
  const entries = getActivityLog(userId);
  const dateKey = getLocalDateKey();

  if (uniqueKey) {
    const alreadyRecorded = entries.some(
      (entry) =>
        entry.dateKey === dateKey &&
        entry.source === source &&
        entry.uniqueKey === uniqueKey
    );
    if (alreadyRecorded) {
      return entries;
    }
  }

  const nextEntry: ActivityEntry = {
    id: createLocalId(),
    dateKey,
    source,
    count,
    createdAt: new Date().toISOString(),
    uniqueKey,
  };

  const nextEntries = [...entries, nextEntry];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffKey = getLocalDateKey(cutoff);
  const trimmedEntries = nextEntries
    .filter((entry) => entry.dateKey >= cutoffKey)
    .slice(-1000);
  try {
    localStorage.setItem(key, JSON.stringify(trimmedEntries));
    window.dispatchEvent(new CustomEvent("activityLogUpdated", { detail: trimmedEntries }));
  } catch (error) {
    // Keep activity log best-effort to avoid blocking UI actions.
  }

  return trimmedEntries;
};
