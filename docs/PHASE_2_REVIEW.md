# Phase 2 Review

Date: 2026-01-25
Scope: `src/App.tsx`, `src/lib/notificationEngagement.ts`, `src/pages/Index.tsx`, `src/pages/Notifications.tsx`, `src/pages/Settings.tsx`, `src/pages/StudyChapter.tsx`, `src/pages/VersiculoDoDia.tsx`

## Potential Bugs
- `src/lib/notificationEngagement.ts`, `src/App.tsx` — The “missed you” notification uses deeplink `conexaodeus://home`, but App deep-link handling only routes `/versiculo-do-dia`, `/notificacoes`, and `/biblia`. Tapping the reminder likely does nothing. 
- `src/pages/Index.tsx` — The guided notification prompt is computed in a `useEffect` with an empty dependency array. If onboarding is completed after initial render, the prompt may never appear in that session.
- `src/pages/Notifications.tsx` — Guided setup can prefill `theme` from URL with values not in `THEMES`. If the theme doesn’t exist, the Select may show an empty value and scheduling can fail (no verse found).

## Edge Cases
- `src/pages/Notifications.tsx` — `allDays` is rebuilt on each render and is in the guided-setup effect dependency list; while `guided=1`, the effect runs every render and resets the form, causing flicker or a stuck UI if the user tries to edit fields.
- `src/pages/Index.tsx` — If the user already created schedules before onboarding (or via another entry point), the guided prompt can still appear because the check only runs once and doesn’t re-evaluate when schedules change.

## Performance Risks
- `src/App.tsx`, `src/lib/notificationEngagement.ts` — On every route change, the app writes localStorage and cancels/reschedules the “missed you” notification. On mobile devices this can add unnecessary work on navigation.
- `src/pages/Settings.tsx` — Opening Settings now initializes `useNotifications`, which can trigger permission checks and device detection on every visit, adding overhead to a simple screen.

## UX Regressions
- `src/pages/Settings.tsx` — Visiting Settings may prompt notification permission or show system toasts (battery optimization guidance) because `useNotifications` initializes there, which is unexpected for a settings view.
- `src/pages/Notifications.tsx` — Guided setup preselects “all days” by default. Users expecting a lighter setup (e.g., weekdays only) might perceive this as too aggressive or spammy.

