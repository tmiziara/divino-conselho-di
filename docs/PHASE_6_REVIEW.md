# Phase 6 Review

Date: 2026-01-30

## Potential bugs
- [High] Plan day calculation uses elapsed hours since `startedAt`, so the "today" day only advances after 24h, not at local midnight; users who start late in the day can be blocked from completing the next calendar day. `src/hooks/useReadingPlans.ts:117`
- [Medium] Grace day usage is preserved even when a streak breaks (daysDiff > 2), which can prevent a grace day later in the same week after a reset. `src/hooks/useStreaks.ts:106-129`
- [Medium] Weekly summary does not recompute when new activity is logged while the screen is open (effect only depends on `user?.id`), so counts can appear stale. `src/hooks/useWeeklySummary.ts:40-67`
- [Medium] "Abrir Bíblia" in plan detail calls `saveProgress`, which records activity + streak even if the user only previews the chapter without reading. `src/pages/ReadingPlanDetail.tsx:118`, `src/hooks/useBibleProgress.ts:50-70`
- [Low] Starting a plan does not clear existing progress for that plan, so restarting a plan can show already-completed days and award completion immediately. `src/hooks/useReadingPlans.ts:112-170`

## Edge cases
- Day number calculation relies on `Math.floor(diffMs / 86400000)` and can shift around daylight saving time changes (23/25-hour days), potentially skipping/duplicating plan days. `src/hooks/useReadingPlans.ts:117-123`
- Streak day difference uses `Math.round` on ms delta between date keys; DST can produce 0 or 2 day deltas for adjacent dates. `src/hooks/useStreaks.ts:33-36`
- If a plan’s `durationDays` does not match the actual `items` length (data mismatch), `getTodayPlanItem` returns null and Home behaves like no active plan. `src/hooks/useReadingPlans.ts:130-135`, `src/pages/Index.tsx:964-987`

## Performance risks
- Activity log grows without pruning; `recordActivity` reads/parses the full log and appends on each event (O(n)), and weekly summary scans the full log. This can slow down over time and risk localStorage quota errors. `src/lib/activityLog.ts:48-76`, `src/hooks/useWeeklySummary.ts:41-58`

## UX regressions
- Home "Plano do dia" hides an active plan once its duration has passed (no `todayPlanItem`), showing a CTA to pick a plan while the Plans list still says "Plano ativo". This is inconsistent and confusing. `src/pages/Index.tsx:964-987`, `src/pages/ReadingPlans.tsx:54-83`
- Mobile bottom nav now has 7 items on phones, which can shrink tap targets and labels on small screens. `src/components/MobileBottomNavigation.tsx:22-30`
- Weekly summary range label uses raw `YYYY-MM-DD` keys instead of localized dates, which reads as technical rather than user-friendly. `src/hooks/useWeeklySummary.ts:59`, `src/pages/WeeklySummary.tsx:27-36`
