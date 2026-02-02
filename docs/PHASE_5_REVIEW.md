# Phase 5 Review

## Potential bugs
- `src/hooks/useBibleStudies.ts`: `markChapterAsCompleted` now upserts to `user_study_progress` with `id: "${user.id}_${chapterId}"`. The table schema uses UUID for `id`, so this insert/upsert can fail or reject the row. This also propagates into `src/hooks/useProgressSync.ts` because local entries with non-UUID `id` will be upserted and can fail there too.
- `src/hooks/useProgressSync.ts` + `src/hooks/useBibleProgress.ts`: both use `upsert(..., { onConflict: 'user_id' })` on `bible_progress`. If `bible_progress.user_id` is not UNIQUE in production, Supabase will throw `no unique constraint` errors and progress won?t sync.
- `src/hooks/useNotifications.ts`: `resetAllNotifications` clears `notification_system_state` but not the new `notification_schedules_meta`. A reset can be followed by a sync that rehydrates old schedules from Supabase, which breaks the expected reset behavior.
- `supabase/migrations/20260126123000_phase5_progress_sync.sql`: uses `update_updated_at_column()` triggers. If that function is missing in the production DB, the migration will fail.

## Edge cases
- `src/hooks/useProgressSync.ts`: schedule sync relies on the local `notification_schedules_meta.updated_at`. If local storage is cleared (or only schedules are cleared), the sync may pull old server schedules back unexpectedly.
- `src/pages/Chat.tsx`: chat summary uses `messages.length` based on the in-memory `messages` array (which can be stale if multiple sends happen quickly). Summary counts/previews can lag or be off by one.
- `src/hooks/useProgressSync.ts`: merge logic uses `chapter_id` as the key. If data corruption causes duplicated `chapter_id` across studies (shouldn?t happen, but possible if the wrong IDs are stored locally), merge behavior will be unpredictable.

## Performance risks
- `src/App.tsx`: `trackEvent('screen_view')` fires a Supabase insert on every route change. This can add network overhead and may be noisy for users who navigate frequently.
- `src/pages/Chat.tsx`: `syncChatSummary` upserts on each message. In long sessions this can add noticeable network chatter.
- `src/hooks/useNotifications.ts`: every local schedule change triggers an upsert. Frequent toggles can cause repeated writes without batching.

## UX regressions
- `src/hooks/useNotifications.ts`: after a ?Reset notifications?, old schedules may reappear due to leftover `notification_schedules_meta` and subsequent cross-device sync.
- `src/pages/Chat.tsx`: if the summary upsert fails (e.g., RLS, schema mismatch), there is no visible feedback. Not a blocker, but it can hide sync failures from users.

## Next steps (not implemented yet)
- Fix Phase 5 issues found in this review (see Potential bugs / UX regressions).
- Ensure Supabase migration is applied after app release (additive only).
- Verify RLS policies and unique constraints for `bible_progress` and new tables.

