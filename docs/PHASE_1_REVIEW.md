# Phase 1 Review

Date: 2026-01-25
Scope: `src/pages/Index.tsx`, `src/pages/VersiculoDoDia.tsx`, `src/pages/StudyChapter.tsx`

## Potential Bugs
- `src/pages/VersiculoDoDia.tsx:58-151` — If the verses JSON loads as an empty array, `getRandomIndex(0)` returns `NaN`, so `currentIndex` becomes `NaN` and the UI shows "NaN de 0" while `currentVerse` is `undefined`; this can cascade into image generation and navigation state behaving unexpectedly.
- `src/pages/VersiculoDoDia.tsx:180-236` — `localStorage` access is unguarded in event handlers (`navigateVerse`, `generateRandomVerse`). In environments where `localStorage` throws (Safari private mode / storage disabled), these handlers will throw and break navigation.
- `src/pages/Index.tsx:222-237` — `localStorage` writes for onboarding are unguarded; if storage is unavailable, the onboarding flow can throw and remain stuck open.

## Edge Cases
- `src/pages/VersiculoDoDia.tsx:58-151` — When the fetch fails, `loading` flips to false but `verses` remains empty; the page renders with a broken index/length display and no retry or error messaging besides the image error card.
- `src/pages/Index.tsx:190-219` — `loadResumeStudy` assumes `progress_${user.id}` contains a valid array; malformed data is caught, but there is no cleanup of bad data, so the resume feature silently never shows up until storage is cleared.
- `src/pages/VersiculoDoDia.tsx:39-43, 401-428` — Triggering the guest limit sets both `showGuestLimit` and `showAuth` to true, so users can see the soft nudge card and the auth modal at the same time, which can feel like a broken flow on small screens.

## Performance Risks
- `src/pages/VersiculoDoDia.tsx:180-236` — Every navigation/random action triggers image regeneration (canvas draw + background load). The new guest-limit logic adds extra state updates (guest views + CTA checks) per swipe, which could amplify jank on low-end devices.

## UX Regressions
- `src/pages/VersiculoDoDia.tsx:208-236, 376-397` — The “contextual reminder CTA (once)” is only persisted when “Agora não” is clicked; choosing “Ativar lembretes” doesn’t set the localStorage key, so the CTA can reappear repeatedly, contradicting the “once” intent.
- `src/pages/StudyChapter.tsx:111-112, 543-558` — Same pattern as above: accepting “Ativar lembretes” doesn’t persist dismissal, so the CTA can appear again after future completions.
- `src/pages/VersiculoDoDia.tsx:39-43, 401-428` — The guest login prompt appears both as a modal and as an in-page card, which is likely more aggressive than before and can be perceived as a regression in flow clarity.
