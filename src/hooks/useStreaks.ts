import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLocalDateKey, getWeekKey } from "@/lib/activityLog";

interface StreakState {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
  graceUsedOn: string | null;
}

const getIdentity = (userId?: string | null) => userId ?? "guest";

const getStreakKey = (userId?: string | null) =>
  `reading_streak_v1_${getIdentity(userId)}`;

const getBadgesKey = (userId?: string | null) =>
  `badges_v1_${getIdentity(userId)}`;

const safeParse = <T,>(value: string | null, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    return fallback;
  }
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const getUtcDayMs = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year || 0, (month || 1) - 1, day || 1);
};

const diffInDays = (fromKey: string, toKey: string) => {
  const diffMs = getUtcDayMs(toKey) - getUtcDayMs(fromKey);
  return Math.floor(diffMs / 86400000);
};

export const useStreaks = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakState>({
    current: 0,
    longest: 0,
    lastCompletedDate: null,
    graceUsedOn: null,
  });
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const streakKey = getStreakKey(user?.id);
    const badgesKey = getBadgesKey(user?.id);
    setStreak(
      safeParse<StreakState>(localStorage.getItem(streakKey), {
        current: 0,
        longest: 0,
        lastCompletedDate: null,
        graceUsedOn: null,
      })
    );
    setBadges(safeParse<string[]>(localStorage.getItem(badgesKey), []));
  }, [user?.id]);

  const saveStreak = useCallback(
    (next: StreakState) => {
      const streakKey = getStreakKey(user?.id);
      try {
        localStorage.setItem(streakKey, JSON.stringify(next));
      } catch (error) {
        // Streak is optional; keep UX functional if storage fails.
      }
      setStreak(next);
    },
    [user?.id]
  );

  const saveBadges = useCallback(
    (next: string[]) => {
      const badgesKey = getBadgesKey(user?.id);
      try {
        localStorage.setItem(badgesKey, JSON.stringify(next));
      } catch (error) {
        // Ignore storage errors to keep the UI responsive.
      }
      setBadges(next);
    },
    [user?.id]
  );

  const awardBadge = useCallback(
    (badgeId: string) => {
      if (badges.includes(badgeId)) return;
      saveBadges(Array.from(new Set([...badges, badgeId])));
    },
    [badges, saveBadges]
  );

  const registerCompletion = useCallback(() => {
    const todayKey = getLocalDateKey();
    const lastDate = streak.lastCompletedDate;

    if (lastDate === todayKey) {
      return;
    }

    let nextCurrent = 1;
    let nextGrace: string | null = null;

    if (lastDate) {
      const daysDiff = diffInDays(lastDate, todayKey);
      if (daysDiff === 1) {
        nextCurrent = streak.current + 1;
        nextGrace = streak.graceUsedOn;
      } else if (daysDiff === 2) {
        const graceAlreadyUsed =
          streak.graceUsedOn && getWeekKey(parseDateKey(streak.graceUsedOn)) === getWeekKey();
        if (!graceAlreadyUsed) {
          // Grace day allows a single missed day without breaking streak.
          nextCurrent = streak.current + 1;
          nextGrace = todayKey;
        }
      }
    }

    const nextLongest = Math.max(streak.longest, nextCurrent);
    const nextState: StreakState = {
      current: nextCurrent,
      longest: nextLongest,
      lastCompletedDate: todayKey,
      graceUsedOn: nextGrace,
    };

    saveStreak(nextState);

    // Award streak badges when thresholds are reached.
    const eligibleBadges: string[] = [];
    if (nextCurrent >= 3) eligibleBadges.push("streak_3");
    if (nextCurrent >= 7) eligibleBadges.push("streak_7");
    if (nextCurrent >= 30) eligibleBadges.push("streak_30");
    if (eligibleBadges.length > 0) {
      saveBadges(Array.from(new Set([...badges, ...eligibleBadges])));
    }
  }, [badges, saveBadges, saveStreak, streak]);

  const badgeLabels = useMemo(() => {
    return {
      streak_3: "3 dias de constância",
      streak_7: "7 dias seguidos",
      streak_30: "30 dias de fé",
      plan_1: "1 plano concluído",
    } as Record<string, string>;
  }, []);

  return {
    current: streak.current,
    longest: streak.longest,
    lastCompletedDate: streak.lastCompletedDate,
    badges,
    badgeLabels,
    registerCompletion,
    awardBadge,
  };
};
