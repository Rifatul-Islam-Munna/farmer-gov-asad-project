# Farmer Government Platform — Executive Delivery Plan

## Branch Policy

- [x] Build active features directly on `development`.
- [x] Keep `main` stable.
- [ ] Remove duplicate repository content and unused branch names.
- [ ] Merge only after all verification gates pass.

## Completed Product Phases

- [x] Platform foundation: NestJS, MongoDB, JWT, Swagger, validation, Dio, secure session, green theme, and nested AutoRoute.
- [x] Authentication: five roles, registration, login, profile, logout, verification status, and protected workspaces.
- [x] Verification documents: validated backend upload and Flutter registration using backend URLs.
- [x] Goods and prices: searchable catalog, government/regional rates, trends, latest/history APIs, and Flutter price UI.
- [x] Farmer diagnosis: camera/gallery, fixed demo provider, treatment/safety results, and nearby medicine-stock lookup.
- [x] Farmer selling: listings, ownership, search, history, goods camera identification, cancellation, and atomic reservation.
- [x] Buyer deals: listing browser, offers, counteroffers, accept/reject, dual confirmation, and confirmed history.
- [x] Agent assistance: OTP farmer creation, delegated listing, expiry/attempt protection, ownership audit, and Flutter workspace.
- [x] Medicine sellers: catalog, shop location, inventory, nearby matching, and Flutter workspace.
- [x] Administration: pending-user review, approval/rejection, guidance, notices, and protected reference-data APIs.

## Remaining Product Work

- [ ] Notifications for offers, deals, OTP, approval, and delegated actions.
- [ ] Production SMS, AI detection, and object-storage adapters.
- [ ] Category filters, price-history chart, maps, device location, and richer listing media.
- [ ] Deal completion, cancellation, disputes, and moderation.
- [ ] Document preview, user suspension, reports, and audit viewer.
- [ ] Rate limiting, monitoring, backups, deployment, and rollback.

## Verification Gate

- [x] Windows and Linux/macOS verification scripts exist.
- [ ] Backend install, build, lint, unit tests, and E2E tests pass.
- [ ] Flutter install, Freezed/JSON/AutoRoute generation, analyze, and tests pass.
- [ ] Farmer, buyer, agent, medicine-seller, and admin smoke tests pass.

## Immediate Sequence

1. Run a verification script.
2. Fix every reported source, formatting, generation, analyze, and test issue.
3. Commit generated Dart output to `development`.
4. Perform all five role smoke tests.
5. Add notifications and production adapters.
6. Remove duplicate repository content and unused branches.
7. Merge to `main` only after verification passes.
