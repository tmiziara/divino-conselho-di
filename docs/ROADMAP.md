# Phased Improvement Plan (Conexao com Deus)

Date: 2026-01-25

This roadmap is incremental, safe, and shippable phase‑by‑phase, written for a non‑programmer. Each phase is designed to improve engagement, retention, premium conversion, and ad revenue without breaking the existing app.

---

## Phase 1 — Activation & Habit Basics (Low Risk, Quick Wins)

**Goal**
Increase daily active users (DAU) and short‑term retention by making the daily loop obvious and easy.

**Features to implement**
- **“Daily Home” panel on the Home screen** with 3 clear actions: Verse of the Day, Continue Bible reading, and Resume last Study.
- **Lightweight onboarding prompts** (2–3 questions): preferred time for reminders, top interest (e.g., peace, anxiety, relationships), and reading pace. Save locally.
- **Contextual reminders CTA**: After a user reads a verse or completes a study chapter, show a simple prompt to enable notifications.
- **“Continue reading” button** that uses the last saved Bible position.
- **Soft sign‑up nudges** instead of hard blocks (e.g., allow Verse of the Day to preview 1–2 items before login).

**Expected impact (engagement & revenue)**
- **Engagement**: +10–20% DAU uplift from clearer daily loop; +5–10% D7 retention from “continue” path.
- **Revenue**: Neutral to slightly positive from longer sessions (more ad impressions).

**Technical risk level**
**Low** — Mostly UI changes and reuse of existing data (last reading position already stored). No backend migrations required.

---

## Phase 2 — Smart Notification Growth (Low–Medium Risk)

**Goal**
Increase retention and reactivation by making notifications valuable and easy to set up.

**Features to implement**
- **Guided notification setup** after onboarding or first content completion (verse/study).
- **Theme‑based notification templates** (auto, peace, hope, etc.) pre‑filled.
- **“Missed you” reminder** after 3–5 days of inactivity (local‑only initially).
- **Notification health check** inside Settings (simple status + “test notification” button).

**Expected impact (engagement & revenue)**
- **Engagement**: +8–15% D7 and D30 retention due to improved reminders.
- **Revenue**: Increased session frequency; moderate ad revenue uplift.

**Technical risk level**
**Low–Medium** — Uses existing local notification system; requires careful UX to avoid spam.

---

## Phase 3 — Premium Conversion Lift (Medium Risk)

**Goal**
Increase premium conversion by clarifying value and placing upsells at key moments.

**Features to implement**
- **Fix plan messaging** so UI matches actual features (chat credits vs. unlimited; remove features not in product).
- **Contextual paywalls**:
  - Bible versions: show a premium explanation and “Try 24h free” (manual or time‑based).
  - Favorites limit: upgrade prompt when user hits 10.
  - Studies: premium preview + lock screen for premium content.
- **Single, consistent subscription source** for UI (remove conflicting states).

**Expected impact (engagement & revenue)**
- **Engagement**: Small positive (less confusion).
- **Revenue**: +10–25% conversion rate improvement from targeted paywalls and trustworthy messaging.

**Technical risk level**
**Medium** — Requires changes in subscription logic and UI gating. Must verify entitlement flows carefully.

---

## Phase 4 — Ad Monetization Without UX Damage (Medium Risk)

**Goal**
Increase ad revenue while protecting user experience and retention.

**Features to implement**
- **Ad frequency tuning** (reduce interstitials in sensitive moments; add cool‑downs per session).
- **Introduce optional rewarded ads** outside chat (e.g., “unlock 1 premium verse image” or “unlock 1 premium study chapter preview”).
- **Banner placement safety**: ensure banner does not overlap bottom nav and content.

**Expected impact (engagement & revenue)**
- **Engagement**: Neutral or slight positive if interstitials become less intrusive.
- **Revenue**: +10–20% ad ARPDAU from more rewarded opportunities and better session length.

**Technical risk level**
**Medium** — Ad changes require careful testing to avoid broken layouts or aggressive frequency.

---

## Phase 5 — Progress & Cross‑Device Continuity (Medium–High Risk)

**Goal**
Boost long‑term retention by preserving progress across devices and reinstallations.

**Features to implement**
- **Sync key data to Supabase**: study progress, chat history summaries, and notification schedules (optional).
- **“Resume where you left off” across devices** for Bible and studies.
- **Basic analytics events** (view screen, complete study, enable notifications, subscribe) to measure real impact.

**Expected impact (engagement & revenue)**
- **Engagement**: +10–20% D30 retention; improved trust and continuity.
- **Revenue**: Indirect boost from higher retention and more premium trials.

**Technical risk level**
**Medium–High** — Requires backend schema changes and migration strategy; needs privacy consideration.

---

## Phase 6 — Advanced Retention Loops (High Risk, Larger Build)

**Goal**
Create strong long‑term engagement loops comparable to top devotional apps.

**Features to implement**
- **Reading plans** (multi‑day journeys with milestones).
- **Streaks and badges** for daily reading.
- **Weekly summary** with progress highlights.
- **Prayer journal** with prompts.

**Expected impact (engagement & revenue)**
- **Engagement**: +20–40% D30 retention if executed well.
- **Revenue**: Better conversion from more committed users.

**Technical risk level**
**High** — New content structure, more data storage, and careful UX.

---

# Recommended Order (Safe to Ship Incrementally)

1. Phase 1 (Activation & Habit Basics)
2. Phase 2 (Smart Notifications)
3. Phase 3 (Premium Conversion Lift)
4. Phase 4 (Ad Monetization)
5. Phase 5 (Sync & Analytics)
6. Phase 6 (Advanced Loops)

---

If you want, I can turn Phase 1 into a concrete task list with screen‑by‑screen wireframe descriptions and acceptance criteria.
