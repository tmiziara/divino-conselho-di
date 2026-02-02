# Phase 6 Plan ? Advanced Retention Loops (No Code Yet)

Date: 2026-01-28
Scope: Reading Plans, Streaks & Badges, Weekly Summary, Prayer Journal

## 1) Goals (from ROADMAP)
- Reading plans (multi-day journeys with milestones)
- Streaks and badges for daily reading
- Weekly summary with progress highlights
- Prayer journal with prompts

## 2) Research Notes (practical guidance)
- Keep streaks motivating, not punitive: allow recovery (e.g., grace day) and avoid pressure-heavy UX.
- Favor intrinsic motivation (progress, consistency) over points/leaderboards.
- Prayer journaling should be privacy-first, local by default; optional export later.
- Weekly summary should be lightweight and motivational: ?what you did? + ?next gentle step.?

## 3) Architecture Fit (current codebase)
- Local-first storage (consistent with existing progress and notification state).
- Hooks in `src/hooks/` for state + storage.
- Pages in `src/pages/` for new screens.
- Reuse existing UI patterns (Cards, Buttons, Shadcn components).
- Optional future sync can reuse Phase 5 pattern via Supabase tables (not in Phase 6).

## 4) Data Model (local-only for Phase 6)
### 4.1 Reading Plans
Store in local JSON (new file) + local progress
- `public/data/reading_plans.json`
  - id, title, description, durationDays, items[]
  - items[]: dayNumber, title, book, chapter, verseRange, optional reflection

Progress (localStorage key):
- `reading_plan_progress_v1_${userId}` -> array of { planId, dayNumber, completedAt }

### 4.2 Streaks & Badges
- `reading_streak_v1_${userId}` -> { current, longest, lastCompletedDate, graceUsedOn? }
- `badges_v1_${userId}` -> [ "streak_3", "streak_7", "streak_30", "plan_1" ]

### 4.3 Weekly Summary
- Computed weekly from existing progress + plan completions; no storage needed.
- Optional cache: `weekly_summary_cache_v1_${userId}_${weekKey}`

### 4.4 Prayer Journal
- `prayer_journal_v1_${userId}` -> array of entries
  - id, date, title, content, promptId?, tags[], createdAt, updatedAt

## 5) New Hooks (local-only)
### 5.1 `useReadingPlans.ts`
- load plans from JSON
- read/write progress from localStorage
- helper: `getTodayPlanItem(planId)` and `completeDay(planId, dayNumber)`

### 5.2 `useStreaks.ts`
- update streak when a plan day or Bible chapter is completed
- grant badges at milestone thresholds
- expose `current`, `longest`, `badges`

### 5.3 `useWeeklySummary.ts`
- compute last 7 days activity
- metrics: daysActive, chaptersRead, planDaysCompleted, studiesCompleted

### 5.4 `usePrayerJournal.ts`
- CRUD for entries
- optional prompts list (local array)

## 6) UI / Pages
### 6.1 New Pages
- `/planos` (Reading Plans list)
- `/plano/:planId` (Plan detail + daily checklist)
- `/resumo-semanal` (Weekly Summary)
- `/diario` (Prayer Journal list)
- `/diario/nova` (Create entry)
- `/diario/:entryId` (Entry detail/edit)

### 6.2 Home Updates
Add a lightweight ?Daily Plan? card on Home:
- Next plan item
- Streak badge chip
- CTA to weekly summary

## 7) UX Behavior (comments / explanations)
```ts
// Reading Plan completion should be 1-tap and irreversible for the day
// to avoid confusion and build a consistent ?done today? feedback loop.
```
```ts
// Streak increments only when a plan day or Bible chapter is completed.
// If user misses a day, streak resets unless grace day is available.
```
```ts
// Weekly summary is derived from local progress, not from server analytics.
// This keeps it private and reliable offline.
```
```ts
// Prayer journal entries are stored locally and never sent to the server.
// This is a privacy-first feature with optional export later.
```

## 8) Routing & Navigation
- Add routes in `src/App.tsx`
- Add entry points in `Navigation` and `MobileBottomNavigation`

## 9) Implementation Order (no code yet)
1) Add reading plans JSON + hook
2) Add plan pages and completion UI
3) Add streak + badges hook and integrate with plan completion
4) Add weekly summary page
5) Add prayer journal pages + hook
6) Update Home with plan + streak preview

## 10) Manual Steps (when we implement)
- `npm run dev`
- `npm run build`
- `npx cap sync android` (for device test)

