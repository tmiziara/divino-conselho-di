# Phase 4 Review

Date: 2026-01-25

## Findings (ordered by severity)

### High
- None found.

### Medium
- **Bug / Rewarded preview button can be shown while ad is not ready**: The premium study chapter lock screen always shows the “Ver anúncio e liberar prévia” button, but it only fails after click when `isRewardedReady` is false. This can feel broken and generates an error toast instead of a disabled state.  
  - `src/pages/StudyChapter.tsx:146-182`, `src/pages/StudyChapter.tsx:435-456`
- **Edge case / Session storage unavailable**: `useAdManager` now relies on `sessionStorage`. If it’s disabled (private mode / restricted WebView), session cooldown logic silently falls back to in‑memory values for that runtime only, which can make cooldowns inconsistent across page reloads.  
  - `src/hooks/useAdManager.ts:123-141`, `src/hooks/useAdManager.ts:153-188`

### Low
- **UX regression / Banner padding mismatch**: Banner height is fixed at 60px, while AdMob adaptive banner height can differ by device. This can cause either extra blank space or residual overlap on some screens.  
  - `src/components/AdMobBanner.tsx:21-196`, `src/index.css:45-55`
- **UX regression / Combined padding shifts**: App-level padding now uses CSS variables; if any screen also applies its own bottom padding (e.g., custom containers), content can feel overly padded on smaller screens.  
  - `src/App.tsx:246-252`, `src/index.css:51-55`, `src/index.css:318-328`

## Performance Risks
- **Potential extra renders from banner layout effect**: `AdMobBanner` writes CSS variables on state changes (`isVisible`, `isLoading`, `error`). This is low-cost but will trigger layout recalculation on mobile devices.  
  - `src/components/AdMobBanner.tsx:180-197`
