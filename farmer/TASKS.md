# Farmer Government Platform — Active Task Board

All work goes directly to `development`. Completed means committed. Build, lint, generation, analyze, and test passes remain unchecked until they actually run.

## Repository

- [x] Active Flutter app is `farmer/`.
- [x] Active development branch is `development`.
- [x] `main` remains stable.
- [ ] Delete extra branch names.
- [ ] Delete `farmer_app/`.

## Backend Foundation

- [x] MongoDB user schema and JWT authentication.
- [x] Register, login, profile, OTP verification, and logout routes.
- [x] Admin, agent, farmer, buyer, and medicine-seller roles.
- [x] Farmer land and role-specific profile fields.
- [x] Public admin creation blocked.
- [x] Access-token, role, and approval guards.
- [x] Profile and logout protected.
- [x] Approval guard checks current MongoDB status instead of stale JWT status.
- [x] New admin write endpoints use role and approval guards.
- [ ] Add ownership guards for user-owned resources.
- [ ] Backend build passes.
- [ ] Backend lint passes.

## Flutter Foundation

- [x] Requested packages, default fonts, environment, permissions, dependency injection, secure storage, cache, toast, and green theme.
- [x] Dio validation, timeouts, token headers, HTTP 401 handling, typed failures, and debug-only verbose logs.
- [x] Token, role, name, and approval status persisted.
- [ ] `flutter pub get` passes.

## Models

- [x] Freezed auth, profile, API error, page info, document, and location model sources.
- [x] Freezed goods category, agricultural good, and market-price model sources.
- [ ] Generate and commit every `.freezed.dart` file.
- [ ] Generate and commit every `.g.dart` file.

## Navigation and Initial UI

- [x] Nested AutoRoute Home, Market, Post, and Profile stacks.
- [x] Liverpool-style animated tab shell.
- [x] Splash, login, registration, Home, Market, Profile, and logout.
- [x] Green approval screen with guided icons and backend refresh.
- [x] Hide all application tabs until approval.
- [~] Approval routing is complete; approved role-specific shells remain.
- [~] Post screen remains a placeholder.

## Verification

- [x] Flutter smoke test replaces the counter test.
- [x] Linux/macOS and Windows verification scripts.
- [x] Scripts check backend before Flutter generation, analyze, and tests.
- [ ] Run one verification script.
- [ ] Fix all backend build and lint results.
- [ ] Fix all Flutter generation, analyze, and test results.

---

# Authentication Completion — In Progress

- [x] Access, role, and approval enforcement.
- [x] Approval state stored in backend token and Flutter session.
- [x] Profile refresh and pending/rejected review UI.
- [x] Status refresh, logout, and protected-tab blocking.
- [ ] Backend document upload and validation.
- [ ] Store uploaded references instead of local paths.
- [ ] Flutter upload progress, retry, and resubmission.
- [ ] Admin review and approval tools.
- [ ] Approved-user routing by role.
- [ ] Authentication and guard tests.

---

# Farmer Dashboard and Market Prices — In Progress

## Backend First

- [x] Goods category schema and module.
- [x] Searchable agricultural goods schema and module.
- [x] Seed demo categories and rice, potato, tomato, and onion.
- [x] Public goods category and search endpoints.
- [x] Admin-protected goods write endpoints.
- [x] Market-price schema and module.
- [x] Government, regional, current, and previous price fields.
- [x] Regional daily uniqueness rules.
- [x] Difference, percentage, and up/down/stable trend calculations.
- [x] Seed demo daily prices.
- [x] Latest-price endpoint.
- [x] Thirty-day price-history endpoint.
- [x] Admin-protected market-price write endpoint.
- [ ] Farmer-suggestion backend endpoint.
- [ ] Admin-notice backend endpoint.

## Farmer App Second

- [x] Green market banner with a demo image and safe agricultural fallback.
- [x] Agricultural goods and trend icons.
- [x] Typed goods catalog and market-price API clients.
- [x] Connect latest-price API.
- [x] Add pull-to-refresh.
- [x] Add loading, empty, error, and retry states.
- [x] Add goods-name search.
- [x] Show government and market prices.
- [x] Show percentage and up/down/stable trend cards.
- [x] Replace static demo price cards with backend data.
- [x] Add a temporary farmer suggestion card.
- [ ] Add category filter chips using the goods catalog API.
- [ ] Add a price-history details page using the history API.
- [ ] Replace the temporary suggestion with backend suggestion data.
- [ ] Add admin notices.

---

# Immediate Next Tasks

1. Run `scripts/verify-development.ps1` or `scripts/verify-development.sh`.
2. Fix all build, lint, generation, analyze, and test results.
3. Commit generated Freezed and JSON files to `development`.
4. Add category filters and a price-history details screen.
5. Add farmer-suggestion and admin-notice backend endpoints.
6. Continue document upload for authentication.
