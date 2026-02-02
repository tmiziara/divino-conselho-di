import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { recordActivity } from "@/lib/activityLog";
import { useStreaks } from "@/hooks/useStreaks";

export interface ReadingPlanItem {
  dayNumber: number;
  title: string;
  book: string;
  chapter: number;
  verseRange?: string;
  reflection?: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  items: ReadingPlanItem[];
}

interface PlanProgressEntry {
  planId: string;
  dayNumber: number;
  completedAt: string;
}

interface PlanState {
  activePlanId: string | null;
  startedAt: string | null;
}

const PLANS_URL = "/data/reading_plans.json";

const safeParse = <T,>(value: string | null, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    return fallback;
  }
};

const getIdentity = (userId?: string | null) => userId ?? "guest";

const getProgressKey = (userId?: string | null) =>
  `reading_plan_progress_v1_${getIdentity(userId)}`;

const getStateKey = (userId?: string | null) =>
  `reading_plan_state_v1_${getIdentity(userId)}`;

const getLocalDayUtc = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export const useReadingPlans = () => {
  const { user } = useAuth();
  const { registerCompletion, awardBadge } = useStreaks();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<PlanProgressEntry[]>([]);
  const [state, setState] = useState<PlanState>({ activePlanId: null, startedAt: null });

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch(PLANS_URL);
        if (!response.ok) {
          setPlans([]);
          return;
        }
        const data = (await response.json()) as ReadingPlan[];
        setPlans(data || []);
      } catch (error) {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const progressKey = getProgressKey(user?.id);
    const stateKey = getStateKey(user?.id);
    setProgress(safeParse<PlanProgressEntry[]>(localStorage.getItem(progressKey), []));
    setState(safeParse<PlanState>(localStorage.getItem(stateKey), { activePlanId: null, startedAt: null }));
  }, [user?.id]);

  const saveProgress = useCallback((entries: PlanProgressEntry[]) => {
    const progressKey = getProgressKey(user?.id);
    try {
      localStorage.setItem(progressKey, JSON.stringify(entries));
    } catch (error) {
      // Keep reading plans usable even if storage fails.
    }
    setProgress(entries);
  }, [user?.id]);

  const saveState = useCallback((nextState: PlanState) => {
    const stateKey = getStateKey(user?.id);
    try {
      localStorage.setItem(stateKey, JSON.stringify(nextState));
    } catch (error) {
      // Keep reading plans usable even if storage fails.
    }
    setState(nextState);
  }, [user?.id]);

  const activePlan = useMemo(() => {
    if (!state.activePlanId) return null;
    return plans.find((plan) => plan.id === state.activePlanId) || null;
  }, [plans, state.activePlanId]);

  const startPlan = useCallback((planId: string) => {
    const startedAt = new Date().toISOString();
    const filteredProgress = progress.filter((entry) => entry.planId !== planId);
    if (filteredProgress.length !== progress.length) {
      saveProgress(filteredProgress);
    }
    saveState({ activePlanId: planId, startedAt });
  }, [progress, saveProgress, saveState]);

  const getDayNumberForToday = useCallback(() => {
    if (!state.startedAt) return 1;
    const started = new Date(state.startedAt);
    const diffMs = getLocalDayUtc(new Date()) - getLocalDayUtc(started);
    const diffDays = Math.floor(diffMs / 86400000);
    return diffDays + 1;
  }, [state.startedAt]);

  const getTodayPlanItem = useCallback((planId: string) => {
    const plan = plans.find((candidate) => candidate.id === planId);
    if (!plan) return null;

    const dayNumber = getDayNumberForToday();
    if (dayNumber < 1 || dayNumber > plan.durationDays) return null;

    const item = plan.items.find((entry) => entry.dayNumber === dayNumber);
    return item ? { item, dayNumber } : null;
  }, [plans, getDayNumberForToday]);

  const isDayCompleted = useCallback((planId: string, dayNumber: number) => {
    return progress.some((entry) => entry.planId === planId && entry.dayNumber === dayNumber);
  }, [progress]);

  const completeDay = useCallback((planId: string, dayNumber: number) => {
    if (isDayCompleted(planId, dayNumber)) return;

    const updated = [...progress, {
      planId,
      dayNumber,
      completedAt: new Date().toISOString(),
    }];

    // Reading Plan completion should be 1-tap and irreversible for the day
    // to avoid confusion and build a consistent "done today" feedback loop.
    saveProgress(updated);

    // Record activity for weekly summary + streak tracking.
    recordActivity({ userId: user?.id, source: "plan", count: 1 });
    registerCompletion();

    const plan = plans.find((candidate) => candidate.id === planId);
    if (plan && updated.filter((entry) => entry.planId === planId).length >= plan.durationDays) {
      // Reward the first completed plan badge.
      awardBadge("plan_1");
    }
  }, [progress, isDayCompleted, saveProgress, user?.id, plans, registerCompletion, awardBadge]);

  const getCompletedDays = useCallback((planId: string) => {
    return progress.filter((entry) => entry.planId === planId).map((entry) => entry.dayNumber);
  }, [progress]);

  const isPlanCompleted = useCallback((planId: string) => {
    const plan = plans.find((candidate) => candidate.id === planId);
    if (!plan) return false;
    const completedDays = getCompletedDays(planId);
    return completedDays.length >= plan.durationDays;
  }, [plans, getCompletedDays]);

  return {
    plans,
    loading,
    progress,
    activePlan,
    startPlan,
    completeDay,
    getTodayPlanItem,
    getDayNumberForToday,
    isDayCompleted,
    getCompletedDays,
    isPlanCompleted,
  };
};
