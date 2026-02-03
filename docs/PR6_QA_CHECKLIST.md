# PR6 QA Checklist (Polish and Release)

Date: 2026-02-03  
Branch: `feat/i18n-pr6-polish-and-release-qa`

## 1) Language and Copy (PT-BR + EN)
- [ ] Home (`/`) reviewed in PT and EN.
- [ ] Notifications (`/notificacoes`) reviewed in PT and EN.
- [ ] Chat (`/chat`) reviewed in PT and EN.
- [ ] Profile + Settings (`/perfil`, `/configuracoes`) reviewed in PT and EN.
- [ ] Studies + Study Chapter (`/estudos`, `/estudo/:id`, `/estudo/:id/capitulo/:n`) reviewed in PT and EN.
- [ ] Reading plans (`/planos`, `/plano/:id`) reviewed in PT and EN.
- [ ] Verse of the day (`/versiculo-do-dia`) reviewed in PT and EN.
- [ ] Favorites (`/favoritos`) reviewed in PT and EN.
- [ ] Subscription/Checkout pages (`/assinatura`, `/success`, `/cancel`, `/comprar-creditos`) reviewed in PT and EN.
- [ ] Prayer journal (`/diario`, `/diario/nova`, `/diario/:entryId`) reviewed in PT and EN.
- [ ] No mojibake found in user-visible PT strings.

## 2) Core Flows
- [ ] First open follows device language fallback.
- [ ] Manual language switch works and persists after restart.
- [ ] Login flow works in both languages.
- [ ] Logout flow works in both languages.
- [ ] Delete account confirmation copy is correct in both languages.
- [ ] Push notification schedule create/edit/delete works.
- [ ] Guided notifications setup strings are correct in both languages.
- [ ] Premium gating copy is consistent with entitlements.

## 3) Build and Stability
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Android smoke test after `npm run android:sync`.
- [ ] Confirm no blocker regressions in PR5 areas.

## 4) Deferred Items (Post-PR note)
- [ ] Pricing localization by language (`R$` for PT, `$` for EN) and EN price tables.
