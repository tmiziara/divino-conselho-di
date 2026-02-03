# HANDOUT — i18n Progress & Next Steps

Date: 2026-02-03
Project: `divino-conselho-di`
Current branch: `feat/i18n-pr4-full-coverage-and-language-save`

## 1) Goal of this workstream
Deliver full bilingual support (PT-BR + EN) across the app, including:
- language detection on first open,
- manual language switch in app,
- optional language persistence in user profile,
- full UI translation (no hardcoded PT strings in translated scope),
- PT-BR copy with correct accents (no mojibake like `Portug?us`).

---

## 2) What was implemented (chronological by PR)

### PR1 — infra (`feat/i18n-pr1-infra`)
Commit: `961a7d8`
- Added base i18n structure for PT/EN.
- Added language helpers/hooks (`useLanguage`) and basic locale files.
- Enabled app to render translated labels via bilingual helpers.

### PR2 — language preference (`feat/i18n-pr2-language-preference`)
Commit: `61e9b0f`
- Added language selector in profile/settings flow.
- Added profile language persistence path (`profiles.language`) in app flow.
- Added default behavior to use device language when user did not explicitly choose one.

### PR3A — core nav and basic pages (`feat/i18n-pr3-core-nav`)
Commit: `3cb2b07`
- Localized core navigation labels.
- Localized `NotFound` page.

### PR3B — home + privacy pass (`feat/i18n-pr3-home-privacy`)
Commits:
- `c3ea7cc` — localized home highlights and privacy policy pass
- `1b31a2e` — normalized locale names and PT-BR labels
- `5f73083` — finished Home cards translation + PT-BR copy fixes

Key outcomes in PR3B:
- Home cards/stat blocks now render PT/EN through `tx(...)`.
- Multiple hardcoded PT texts in `src/pages/Index.tsx` converted to bilingual rendering.
- PT-BR labels normalized (e.g. `Português (Brasil)`, `Inglês (EUA)`).
- Mojibake/encoding issues addressed in current scope (Home + locale labels).
- Build passes after changes.

### PR4 (in progress) — persistence hardening + stability (`feat/i18n-pr4-full-coverage-and-language-save`)
Commits:
- `3fb7ae2` — language persistence hardening (update-first flow) in `App` + `Profile`, plus RLS migration for `profiles`
- `09d7c50` — removed BOM from migration file for Supabase CLI compatibility
- `6c7e7a3` — fixed language flicker/race on app open and profile language switch

Key outcomes so far in PR4:
- Added migration `supabase/migrations/20260202193000_profiles_language_rls.sql`.
- Applied remote migrations successfully (local and remote migration history aligned).
- Stabilized language hydration/persist cycle to prevent repeated language toggling.

---

## 3) Current git state
- Branch: `feat/i18n-pr4-full-coverage-and-language-save`
- Last commit: `6c7e7a3`
- Branch pushed to remote: yes
- Note: untracked English Bible folders exist and are intentional for future use:
  - `public/data/bible/ESV/`
  - `public/data/bible/NASB1995/`
  - `public/data/bible/NIV/`
  - `public/data/bible/NKJV/`

---

## 4) Files most relevant to this i18n work

### Core i18n
- `src/i18n/index.ts`
- `src/hooks/useLanguage.ts`
- `src/i18n/locales/pt/common.json`
- `src/i18n/locales/en/common.json`

### Language preference / profile persistence
- `src/App.tsx` (language load/save lifecycle)
- `src/pages/Profile.tsx` (language selector UI)
- `src/integrations/supabase/types.ts` (profiles.language typing)
- `supabase/migrations/20260202161000_add_profiles_language.sql` (language column migration)
- `supabase/migrations/20260202193000_profiles_language_rls.sql` (RLS + policy hardening)

### Pages in PR3 scope
- `src/pages/Index.tsx`
- `src/pages/PrivacyPolicy.tsx`
- `src/components/Navigation.tsx`
- `src/components/MobileBottomNavigation.tsx`
- `src/pages/NotFound.tsx`

---

## 5) Known gaps / pending items

### A) Language persistence backend issue
- Status: **addressed in PR4**.
- Migration and RLS hardening applied; update-first profile write flow implemented.
- Need final QA on real devices/accounts to confirm no edge-case regressions.

### B) i18n coverage is not 100% app-wide yet
- Home improved significantly, but there are still pages/components with hardcoded PT strings.
- Need complete sweep so *all* visible strings are bilingual.

### C) PT-BR quality pass still needed globally
- Some areas may still contain accent/encoding artifacts from legacy text.
- Need final pass to guarantee PT-BR copy quality.

### D) New issue under investigation (not fixed yet)
- Android logcat spam while app is open:
  - `Capacitor/Console ... Line 334 - Msg: undefined` repeating continuously.
- This likely comes from repeated `console` output in bundled JS (line refers to bundle, not source TSX).
- Next action: map source and remove/guard noisy logging path.

### E) English Bible datasets (docs -> app) not integrated yet
- Source files currently in `docs/ESV`, `docs/NASB1995`, `docs/NIV`, `docs/NKJV`.
- App reader expects per-book JSON in `public/data/bible/{version}/{abbrev}.json` with this schema:
  - `{ "abbrev": "...", "chapters": string[][], "name": "..." }`
- Current docs are mostly in a different nested structure (`Book -> chapter -> verse`) and are not directly consumable by `useBibleData`.
- Some `*_books` files show mojibake/encoding artifacts; avoid using them as canonical input.

---

## 6) Remaining PRs from the plan

### PR4 — `feat/i18n-pr4-full-coverage-and-language-save`
**Objective:** finish i18n coverage and fix profile language persistence.

**Scope**
1. Backend persistence hardening (`profiles.language`, migration/RLS/profile upsert). **Done (first part).**
2. Full UI sweep for remaining hardcoded PT strings.
3. Global PT-BR normalization (accents/encoding).
4. Validation: first-open language, manual switch, reopen app, login/logout, `npm run build`.
5. Investigate and fix logcat spam (`Msg: undefined`, bundle line 334).
6. Document and prepare English Bible ingestion pipeline (without shipping reader/search changes yet).

**Acceptance**
- No visible hardcoded PT strings in covered UI.
- Language save in profile works (no error toast).
- Device-language fallback works on first run.
- No continuous `Capacitor/Console ... Msg: undefined` spam in Android logcat.

### Best implementation approach for English Bible files (recommended)
1. Use `docs/*/*_bible.json` as canonical source (not `*_books`).
2. Create a conversion script (e.g. `scripts/convert_bible_docs_to_app_format.py`) that:
   - parses `Book -> chapter -> verse`,
   - converts to app schema (`abbrev`, `chapters`, `name`),
   - writes one file per book into `public/data/bible/{version}/`.
3. Reuse current `public/data/bible/nvi` filenames as source-of-truth for abbrev mapping (66 exact codes).
4. Normalize output to UTF-8 and validate no mojibake.
5. Add automated validation checks in script:
   - 66 output files per version,
   - non-empty `chapters`,
   - expected keys present in all files.
6. After data is generated, update app in a separate PR:
   - add English versions in `BibleReader` (`BIBLE_VERSIONS`),
   - adapt book label maps by UI language,
   - decide premium/free gating for EN versions,
   - update Bible search strategy (currently Supabase `versiculos`; does not yet support local multi-version EN search).

### PR5 — `feat/i18n-pr5-secondary-screens`
**Objective:** translate all secondary/less-used pages and flows not finalized in PR4.

**Scope**
1. Translate remaining pages/components (chat-related UI copy, studies/reading plan details, premium/paywall copy, settings/help text, edge states, empty states, toasts).
2. Standardize translation pattern (no mixed hardcoded + tx in same block).
3. QA pass specifically for navigation-driven screen-by-screen coverage.

**Acceptance**
- Full screen-by-screen bilingual coverage for app navigation map.
- No mixed-language screen caused by missing translation wiring.

### PR6 — `feat/i18n-pr6-polish-and-release-qa`
**Objective:** final polish before merge/release.

**Scope**
1. PT-BR copy review (terminology consistency, natural phrasing, accents).
2. EN copy review (clarity and consistency with product tone).
3. Regression checks (onboarding, notifications, subscription, deep links, auth dialogs).
4. Final build + optional lint + manual smoke test checklist.

**Acceptance**
- No visible mojibake/encoding artifacts.
- Core journeys pass in both languages.
- Branch ready for merge with documented QA evidence.

---

## 7) Suggested execution checklist for next Codex session
1. `git checkout feat/i18n-pr4-full-coverage-and-language-save`
2. `git pull`
3. Finish remaining PR4 scope:
   - full i18n sweep,
   - PT-BR normalization pass,
   - logcat spam root-cause fix.
4. Open/merge PR4.
5. Continue with PR5 then PR6 using the same flow (branch -> implement -> validate -> push).
6. For each PR: run `npm run build`, then commit in logical chunks and push.

---

## 8) Commands frequently used in this stream
- `git status -sb`
- `git log --oneline --decorate -n 12`
- `rg -n "..." src -S`
- `npm run build`

---

## 9) Important product note
User requirement is explicit:
- The app must have a complete English version,
- Portuguese must be PT-BR with proper accents,
- language can auto-follow device on first run,
- user can manually override language in app settings/profile.

This should remain the guiding requirement for PR4+.
