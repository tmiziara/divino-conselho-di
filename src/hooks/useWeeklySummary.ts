import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getActivityLog, getLocalDateKey } from "@/lib/activityLog";
import { useStreaks } from "@/hooks/useStreaks";

interface WeeklySummary {
  daysActive: number;
  chaptersRead: number;
  planDaysCompleted: number;
  studiesCompleted: number;
  journalEntries: number;
  rangeLabel: string;
}

const buildDateKey = (date: Date) => getLocalDateKey(date);

const getLastNDaysKeys = (days: number) => {
  const result: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i += 1) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);
    result.push(buildDateKey(target));
  }
  return result;
};

export const useWeeklySummary = () => {
  const { user } = useAuth();
  const { current: currentStreak } = useStreaks();
  const [summary, setSummary] = useState<WeeklySummary>({
    daysActive: 0,
    chaptersRead: 0,
    planDaysCompleted: 0,
    studiesCompleted: 0,
    journalEntries: 0,
    rangeLabel: "",
  });

  useEffect(() => {
    const formatDate = (date: Date, includeYear: boolean) =>
      date.toLocaleDateString("pt-BR", includeYear
        ? { day: "2-digit", month: "short", year: "numeric" }
        : { day: "2-digit", month: "short" });

    const updateSummary = () => {
      const lastWeekKeys = getLastNDaysKeys(7);
      const entries = getActivityLog(user?.id);
      const recent = entries.filter((entry) => lastWeekKeys.includes(entry.dateKey));

      const uniqueDays = new Set(recent.map((entry) => entry.dateKey));
      const chaptersRead = recent
        .filter((entry) => entry.source === "bible")
        .reduce((sum, entry) => sum + entry.count, 0);
      const planDaysCompleted = recent
        .filter((entry) => entry.source === "plan")
        .reduce((sum, entry) => sum + entry.count, 0);
      const studiesCompleted = recent
        .filter((entry) => entry.source === "study")
        .reduce((sum, entry) => sum + entry.count, 0);
      const journalEntries = recent
        .filter((entry) => entry.source === "journal")
        .reduce((sum, entry) => sum + entry.count, 0);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      const includeYear = startDate.getFullYear() !== endDate.getFullYear();
      const rangeLabel = `${formatDate(startDate, includeYear)} - ${formatDate(endDate, includeYear)}`;

      setSummary({
        daysActive: uniqueDays.size,
        chaptersRead,
        planDaysCompleted,
        studiesCompleted,
        journalEntries,
        rangeLabel,
      });
    };

    updateSummary();
    window.addEventListener("activityLogUpdated", updateSummary as EventListener);
    return () => {
      window.removeEventListener("activityLogUpdated", updateSummary as EventListener);
    };
  }, [user?.id]);

  const encouragement = useMemo(() => {
    if (summary.daysActive >= 6) {
      return "Semana incrível! Continue firme com esse ritmo.";
    }
    if (summary.daysActive >= 3) {
      return "Ótimo progresso. Você está construindo constância.";
    }
    return "Cada passo conta. Que tal reservar um momento amanhã?";
  }, [summary.daysActive]);

  return {
    summary,
    currentStreak,
    encouragement,
  };
};
