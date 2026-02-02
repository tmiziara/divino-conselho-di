# Product & Codebase Research (Conexao com Deus)

Date: 2026-01-25

## 1) Current Product Behavior (What the app does today)

- **Platform & stack**: Vite + React + React Router + Tailwind/Shadcn UI, wrapped in Capacitor for iOS/Android, with Cordova plugins mixed in for local notifications and sharing. Backend via Supabase (auth, tables, edge functions, Stripe billing). (`package.json`, `capacitor.config.ts`, `src/main.tsx`, `src/integrations/supabase/client.ts`)
- **Navigation & layout**: Top nav with a full menu (desktop + drawer) and a bottom nav on mobile/tablet. Global AdMob banner at bottom for free users. (`src/components/Navigation.tsx`, `src/components/MobileBottomNavigation.tsx`, `src/components/AdMobBanner.tsx`, `src/App.tsx`)
- **Authentication**: Supabase email/password. Login/signup in a modal, with plan selection at signup. Email verification redirect. (`src/components/AuthDialog.tsx`, `src/hooks/useAuth.tsx`)
- **Home**: Landing page with feature cards and a premium CTA. Logged-out users see “start journey” CTA. (`src/pages/Index.tsx`)
- **Bible reader**:
  - Free users can only read Genesis; all other books require login.
  - Premium-only Bible versions (AA/ACF) gated in UI.
  - Verse favorites stored in Supabase; last reading position stored locally.
  - Bible content loaded from local JSON files in `/public/data/bible/...`.
  (`src/components/BibleReader.tsx`, `src/hooks/useBibleData.ts`, `src/hooks/useBibleFavorites.ts`, `src/hooks/useBibleProgress.ts`, `public/data/bible/*`)
- **Bible search**: Server-side search against Supabase `versiculos` table; returns up to 100 results. (`src/hooks/useBibleSearch.ts`, `src/components/BibleSearch.tsx`)
- **Verse of the Day**:
  - Requires login.
  - Loads themed verses from `/public/data/versiculos_por_tema_com_texto.json`.
  - Generates a shareable image on-canvas and supports sharing on native.
  - Swipe/next/prev increments interstitial ad counters.
  (`src/pages/VersiculoDoDia.tsx`, `src/hooks/useVerseImage.ts`, `public/data/versiculos_por_tema_com_texto.json`)
- **Bible studies**:
  - Requires login.
  - Studies metadata + chapters are bundled locally (`/public/data/chapters_*.json`).
  - Chapter completion tracked in localStorage; favorites of study content partly in localStorage and partly in Supabase.
  - Premium gating is client-side (subscription + local license). (`src/pages/Studies.tsx`, `src/pages/Study.tsx`, `src/pages/StudyChapter.tsx`, `src/lib/localContent.ts`, `src/hooks/useBibleStudies.ts`)
- **Chat (Spiritual conversation)**:
  - Requires login.
  - Uses Supabase edge function `spiritual-chat-with-credits` for AI response.
  - Credits stored in Supabase profile; free users consume credits, premium users are unlimited.
  - Rewarded ads give +3 credits every 15 minutes; credits can be bought via Stripe checkout.
  - Chat history is stored locally (localStorage), not synced. (`src/pages/Chat.tsx`, `src/services/spiritualChatService.ts`, `src/pages/BuyCredits.tsx`)
- **Notifications**:
  - Uses Cordova local notifications (not Capacitor local notifications) for verses/prayer reminders.
  - Schedules are stored in localStorage; deep links open Verse of the Day or home.
  - No cloud sync of schedules. (`src/hooks/useNotifications.ts`, `src/pages/Notifications.tsx`, `src/App.tsx`)
- **Favorites**:
  - Verse favorites in Supabase; free users limited to 10 favorites.
  - Favorites screen reads from Supabase and supports sharing.
  (`src/pages/Favorites.tsx`, `src/hooks/useBibleFavorites.ts`)
- **Subscription management**:
  - Stripe checkout + customer portal via Supabase functions.
  - There are two subscription systems in code: a context provider and a hook; most screens use the hook, not the context. (`src/contexts/SubscriptionContext.tsx`, `src/hooks/useSubscription.ts`, `src/main.tsx`)
- **Ads**:
  - Banner ad always for free users; premium hides it.
  - Interstitials show after 5 verse navigations or completing a study chapter.
  - Rewarded ads in chat for credits.
  (`src/components/AdMobBanner.tsx`, `src/hooks/useAdManager.ts`, `src/pages/VersiculoDoDia.tsx`, `src/pages/StudyChapter.tsx`, `src/pages/Chat.tsx`, `ADS_IMPLEMENTATION.md`)

## 2) User Engagement Weaknesses (DAU + retention)

- **High gating on key daily loops**: Verse of the Day and Studies require login; Bible access is heavily limited for guests (Genesis only). This blocks casual daily use and reduces “try before login” value. (`src/pages/VersiculoDoDia.tsx`, `src/pages/Studies.tsx`, `src/components/BibleReader.tsx`)
- **No habit-building mechanics**: No streaks, reading plans, check-ins, goal tracking, or “continue where you left off” prompts surfaced in the UI. The data exists (last position), but it’s not used as a habit loop. (`src/hooks/useBibleProgress.ts`, `src/pages/Index.tsx`)
- **Notifications are opt-in and hidden**: Scheduling is fully manual inside Notifications. No onboarding step or contextual CTA to set reminders after reading a verse or study. (`src/pages/Notifications.tsx`, `src/hooks/useNotifications.ts`)
- **Limited social/viral loops**: Sharing exists, but it is not surfaced as a core loop or tied to progression (no “share streak,” “share today’s verse” prompts). (`src/pages/VersiculoDoDia.tsx`, `src/pages/StudyChapter.tsx`, `src/pages/Favorites.tsx`)
- **Fragmented content experience**: Bible, Verse of the Day, Studies, and Chat are separate with no “daily flow” orchestration or personalized recommendations that connect them.
- **Chat friction for free users**: Credits are required without a clear daily free allowance or visible progression to next credit. Users can get blocked quickly and leave. (`src/pages/Chat.tsx`, `src/services/spiritualChatService.ts`)
- **Progress not synced across devices**: Many engagement signals are localStorage only (chat history, study progress, notification schedules), reducing continuity and retention when users switch devices or reinstall. (`src/pages/Chat.tsx`, `src/hooks/useBibleStudies.ts`, `src/hooks/useNotifications.ts`)

## 3) Monetization Weaknesses (premium + ads)

- **Premium value mismatch in UI**: Plan copy promises “chat ilimitado” but implementation is credits-based; there is no daily free baseline defined in code. Some advertised features (e.g., groups, comments) do not exist. This harms conversion trust. (`src/pages/Subscription.tsx`, `src/components/AuthDialog.tsx`, `src/services/spiritualChatService.ts`)
- **Inconsistent plan naming and logic**: Code references “basic” tiers in access checks but only “free/premium” are presented in UI. This can create entitlements bugs and conversion confusion. (`src/hooks/useContentAccess.ts`, `src/hooks/useBibleStudies.ts`, `src/pages/Subscription.tsx`)
- **Paywall entry points are limited**: CTA is mostly on Home/Studies/Profile. There’s no dynamic, context-specific upsell where premium features are blocked (e.g., premium Bible versions, study lock screen, favorites limit reached). Some exist but are not consistent. (`src/components/BibleReader.tsx`, `src/pages/Studies.tsx`, `src/pages/Favorites.tsx`)
- **Ad strategy risks UX**: Interstitials every 5 verse swipes or every chapter completion can feel too aggressive, especially with a persistent bottom banner and bottom nav. This may reduce retention and session length. (`src/hooks/useAdManager.ts`, `src/components/AdMobBanner.tsx`, `src/components/MobileBottomNavigation.tsx`)
- **Rewarded ads only in chat**: There is no broader rewarded ad economy (e.g., unlock a premium study chapter, unlock premium Bible versions temporarily). This caps ad revenue potential.
- **Checkout flow opens an external browser**: On mobile, `window.open` to Stripe can increase drop-off vs. native IAP or in-app browser. (`src/pages/Subscription.tsx`, `src/pages/BuyCredits.tsx`)

## 4) Proven Engagement Patterns for Bible/Devotional Apps

- **Daily habit loop**: Streaks, “today’s reading,” and “continue yesterday’s plan” prompts.
- **Reading plans and journeys**: Multi-day plans with reminders, completion tracking, and milestones.
- **Personalized home feed**: Blend “Verse of the Day,” short devotionals, and recommended studies based on prior behavior.
- **Prayer journal + gratitude log**: Simple daily entries and revisits.
- **Push notification personalization**: Time-of-day suggestions, “verse theme” preferences, and “missed your streak” nudges.
- **Community or sharing incentives**: Share streak badges, favorite verses, or completed study milestones.
- **Audio and passive modes**: Daily audio devotionals or read-aloud Bible chapters.
- **Progress dashboards**: Weekly review, time spent, chapters completed, and encouragement messages.
- **Lightweight onboarding**: Ask for goals (peace, anxiety, relationships, purpose), preferred time, and reading pace.
- **Gentle reactivation flows**: “We saved your place in Romans 4” with one-tap resume.

## 5) Risks & Constraints in the Current Codebase

- **Duplicated subscription systems**: `SubscriptionProvider` + `useSubscription` hook are separate, with different caching logic. Many screens use the hook, which ignores the provider state. This can cause inconsistent entitlements. (`src/contexts/SubscriptionContext.tsx`, `src/hooks/useSubscription.ts`, `src/main.tsx`)
- **Client-side premium gating**: Premium Bible versions and studies are gated only in UI while full content is bundled in `public/`. This weakens content protection and enables bypass. (`src/components/BibleReader.tsx`, `src/lib/localContent.ts`, `public/data/*`)
- **Local-only state for key retention data**: Study progress, chat history, and notification schedules are not synced to Supabase. Reinstalls or device changes lose progress. (`src/hooks/useBibleStudies.ts`, `src/pages/Chat.tsx`, `src/hooks/useNotifications.ts`)
- **Potential broken routes**: Favorites screen links to `/subscription` while actual route is `/assinatura`. Settings uses `/logout` which is not defined. (`src/pages/Favorites.tsx`, `src/pages/Settings.tsx`, `src/App.tsx`)
- **Account deletion likely to fail**: `supabase.auth.admin.deleteUser` is called from client code; this requires service-role credentials and is typically not allowed in client apps. (`src/pages/Profile.tsx`)
- **Mixed Capacitor + Cordova plugin usage**: Local notifications rely on Cordova plugin, which can be fragile and harder to maintain alongside Capacitor upgrades. (`src/hooks/useNotifications.ts`, `package.json`)
- **Ad placement conflicts**: Banner ads at bottom + mobile bottom nav + fixed padding risk overlapping UI or reducing usable space on small devices. (`src/App.tsx`, `src/components/AdMobBanner.tsx`, `src/components/MobileBottomNavigation.tsx`)
- **No analytics instrumentation**: There is no event tracking or funnel analysis in code, which limits the ability to optimize DAU, retention, and conversion. (no analytics modules found in `src/`)
- **Performance constraints**: Loading full JSON Bible chapters and local studies can be heavy; caching is localStorage-based with limited eviction. (`src/hooks/useBibleData.ts`, `src/lib/localContent.ts`)

---

If you want, I can next propose a prioritized roadmap with experiments and “quick wins” for DAU, retention, premium conversion, and ad revenue without shipping code yet.
