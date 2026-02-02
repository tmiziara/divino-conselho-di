# Handout — Phase 6 Testing & Resume

## Current goal
- You will test Phase 6 features and report bugs. No new coding until test feedback.

## What Phase 6 adds
- Reading plans (local JSON + local progress).
- Streaks + badges (based on daily activity).
- Weekly summary (computed from activity log).
- Prayer journal (local-only entries).
- Home now shows daily plan + streak preview.
- Activity log ties Bible reading + study completion + plan day completion + journal to streaks/summary.

## New/updated routes
- `/planos` (plans list)
- `/plano/:planId` (plan detail)
- `/resumo-semanal` (weekly summary)
- `/diario` (journal list)
- `/diario/nova` (new entry)
- `/diario/:entryId` (entry detail/edit)

## Files added/changed (Phase 6)
- `public/data/reading_plans.json`
- `src/lib/activityLog.ts`
- `src/hooks/useStreaks.ts`
- `src/hooks/useWeeklySummary.ts`
- `src/hooks/useReadingPlans.ts`
- `src/hooks/usePrayerJournal.ts`
- `src/pages/ReadingPlans.tsx`
- `src/pages/ReadingPlanDetail.tsx`
- `src/pages/WeeklySummary.tsx`
- `src/pages/PrayerJournalList.tsx`
- `src/pages/PrayerJournalNew.tsx`
- `src/pages/PrayerJournalEntry.tsx`
- `src/pages/Index.tsx`
- `src/App.tsx`
- `src/components/Navigation.tsx`
- `src/components/MobileBottomNavigation.tsx`
- `src/hooks/useBibleProgress.ts`
- `src/hooks/useBibleStudies.ts`

## Local storage keys (Phase 6)
- `reading_plan_progress_v1_${userId|guest}`
- `reading_plan_state_v1_${userId|guest}`
- `reading_streak_v1_${userId|guest}`
- `badges_v1_${userId|guest}`
- `activity_log_v1_${userId|guest}`
- `prayer_journal_v1_${userId|guest}`

## How streaks work
- Increment when:
  - Bible chapter is opened (saveProgress)
  - Plan day marked completed
  - Study chapter completed
  - Journal entry created
- One “grace day” per week: missing one day won’t break streak.
- Badges: streak_3, streak_7, streak_30, plan_1.

## Manual steps to test on device
1. `npm run dev`
2. `npm run build`
3. `npx cap sync android`
4. If black screen appears, uninstall app and reinstall after sync.

## Test checklist (Phase 6)
1. **Plans list (`/planos`)**
   - Loads plans with titles + descriptions.
   - “Iniciar plano” sets it as active.
2. **Plan detail (`/plano/:planId`)**
   - Shows days list.
   - “Abrir Bíblia” jumps to correct book/chapter.
   - “Marcar como concluído” works only for today (and earlier days), not future days.
   - Badge “Plano ativo” appears if active.
3. **Home**
   - Shows “Plano do dia” section:
     - If active plan: shows correct day + title + reference.
     - If no active plan: CTA to plans.
   - Streak label updates.
4. **Weekly summary (`/resumo-semanal`)**
   - Days active increments after using Bible/plan/study/journal.
   - Counts match expected totals.
5. **Prayer journal**
   - New entry creation saved.
   - Edit and delete work.
   - Entries persist after app restart.

## Known risks / areas to watch
- **Streak duplication**: Ensure daily streak doesn’t increase twice for same day.
- **Activity duplication**: Bible saveProgress triggers on chapter load; make sure it doesn’t spam counts.
- **Plan day gating**: Confirm future days can’t be marked complete.
- **Navigation labels**: Verify “Diário” and “Diário de Oração” display correctly (no “?”).
- **Home accents**: Check Portuguese accents on Home still render correctly.

## Where to report bugs
- Provide: screen, steps, expected vs actual, and logs if any.
