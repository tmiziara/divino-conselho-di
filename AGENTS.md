# Conexao com Deus — AGENTS

Date: 2026-01-27
Location: C:\Users\Tiagin\Desktop\MizFlow\Conexao com Deus\divino-conselho-di

## Project snapshot (current state)
- Stack: Vite + React + React Router + Tailwind/Shadcn UI, Capacitor (iOS/Android), Cordova local notifications, Supabase backend.
- Phase status: Phases 1–4 shipped; Phase 5 shipped with fixes.
- Supabase migration `20260126123000_phase5_progress_sync.sql` has been applied in production (manual SQL Editor run). The `bible_progress.version` column exists.

## What Phase 5 added (current behavior)
- Cross-device sync (best-effort) for:
  - Bible progress (`bible_progress` + `version`).
  - Study progress (`user_study_progress`).
  - Notification schedules (`notification_schedules`).
  - Chat summaries (`chat_history_summaries`).
- Basic analytics events (`analytics_events`): `screen_view`, `study_complete`, `notification_enabled`, `subscription_start`.

## Phase 5 fixes already implemented in code
- `user_study_progress` uses UUID IDs (no composite `${userId}_${chapterId}`).
- `bible_progress.user_id` uses a unique constraint in migration to support upserts.
- Notification reset clears schedule meta and pushes empty schedules to Supabase to avoid rehydration.
- Chat summary sync is debounced and uses a stable messages ref to avoid off-by-one.
- Screen view analytics is throttled to avoid duplicate rapid inserts.

## Key files & flows
- Auth: `src/hooks/useAuth.tsx`, `src/components/AuthDialog.tsx`
- Subscription source of truth: `src/hooks/useSubscription.ts` (legacy `SubscriptionProvider` is not used)
- Bible progress: `src/hooks/useBibleProgress.ts`
- Study progress: `src/hooks/useBibleStudies.ts`, `src/hooks/useProgressSync.ts`
- Notifications: `src/hooks/useNotifications.ts`, `src/pages/Notifications.tsx`
- Chat: `src/pages/Chat.tsx`, `src/services/spiritualChatService.ts`
- Analytics: `src/lib/analytics.ts`
- Ads: `src/hooks/useAdManager.ts`, `src/components/AdMobBanner.tsx`
- Migration: `supabase/migrations/20260126123000_phase5_progress_sync.sql`

## Supabase tables touched by Phase 5
- `bible_progress` (added `version`, unique `user_id`)
- `notification_schedules`
- `analytics_events`
- `chat_history_summaries`

## Local dev commands
- `npm run dev`
- `npm run lint`
- `npm run build`
- Android: `npm run android`, `npm run android:sync`, `npm run android:build`

## Guardrails for changes
- Prefer additive database changes; avoid breaking existing columns/queries.
- Keep cross-device sync best-effort and non-blocking (no UX failure on sync errors).
- Avoid full reloads for navigation; use React Router.
- Ensure AdMob banner spacing stays above bottom nav (CSS vars in `src/index.css` and `src/App.tsx`).
- Use `useSubscription` for gating; keep plan copy consistent with actual entitlements.

## Known product constraints
- Bible and study content is bundled locally in `public/`.
- Local notifications are Cordova-based (not Capacitor Local Notifications).
- Chat history full logs are local-only; only summaries sync.

## Docs reference (summary)
- Product research: `docs/RESEARCH.md`
- Roadmap: `docs/ROADMAP.md`
- Phase reviews/reports: `docs/PHASE_*_REVIEW.md`, `docs/PHASE_*_REPORT.md`
- Overall summary: `docs/RESUME.md`
