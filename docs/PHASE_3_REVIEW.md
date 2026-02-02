# Phase 3 Review

Date: 2026-01-25

## Findings (ordered by severity)

### High
- **Bug / Entitlement leak**: Premium Bible versions are allowed while subscription status is still loading, so free users can select AA/ACF without a prompt and keep reading after loading finishes. `canUsePremium` treats `subscriptionLoading` as true access, and there is no re-check to downgrade later.  
  - `src/components/BibleReader.tsx:128-137`, `src/components/BibleReader.tsx:244-254`

### Medium
- **Bug / Tier mismatch**: Premium access checks are inconsistent across Phase 3 screens. `useContentAccess` and `useBibleStudies` treat `basic` as premium access, but Studies/CategoryStudies/BibleReader/Subscription UI only allow `premium`, so a `basic` user could see upgrade prompts or locked content despite having access.  
  - `src/hooks/useContentAccess.ts:11-28`, `src/hooks/useBibleStudies.ts:60-79`, `src/pages/Studies.tsx:25-32`, `src/pages/CategoryStudies.tsx:26-29`, `src/components/BibleReader.tsx:66-137`, `src/pages/Subscription.tsx:105-113`
- **Edge case / Paywall bypass**: The 24h Bible premium trial is stored in localStorage with no user binding; guests can start the trial and access premium versions without logging in. This likely bypasses intended gating.  
  - `src/components/BibleReader.tsx:87-126`, `src/components/BibleReader.tsx:128-137`
- **Edge case / Trial expiry not enforced**: Once a premium Bible version is active, there is no guard to force downgrade when the 24h trial expires or a premium subscription is removed. The trial is checked only when changing versions.  
  - `src/components/BibleReader.tsx:103-137`

### Low
- **UX regression / Missing lock signal**: `CategoryCard` receives `hasPremiumAccess` but does not use it, so category tiles do not visually indicate premium locks even when the list view uses paywalls.  
  - `src/components/CategoryCard.tsx:6-64`
- **UX regression / Upsell noise for paid users**: Studies and CategoryStudies compute `hasPremiumAccess` strictly from `premium`, so `basic` (if still present in data) will see upgrade banners and premium locks, which can feel inconsistent/confusing.  
  - `src/pages/Studies.tsx:25-39`, `src/pages/CategoryStudies.tsx:26-29`

## Performance Risks
- No obvious Phase 3 performance regressions found. The only added cost is a per-selection Supabase count in favorites, which is a necessary remote check and should be acceptable for typical use.  
  - `src/hooks/useBibleFavorites.ts:57-71`
