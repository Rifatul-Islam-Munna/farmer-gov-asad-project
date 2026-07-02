# Farmer Government Platform — Active Task Board

All work goes directly to `development`. Completed means committed. Verification passes remain unchecked until commands actually run.

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
- [x] Farmer land field and role-specific profile fields.
- [x] Public admin creation blocked.
- [x] Reusable access-token guard.
- [x] Profile and logout protected by the access-token guard.
- [x] Reusable role guard and approval guard.
- [x] Approval status added to JWT payloads.
- [ ] Apply role, approval, and ownership guards to new domain modules.
- [ ] Backend build passes.
- [ ] Backend lint passes.

## Flutter Foundation

- [x] Requested packages and default fonts.
- [x] Environment, permissions, GetIt, secure storage, cache, toast, and green theme.
- [x] Dio URL validation, timeouts, JSON headers, token headers, and HTTP 401 handling.
- [x] Token, role, name, and approval status persisted.
- [x] Typed request failure, mapper, and interceptor.
- [x] Verbose network and notification logs are debug-only.
- [ ] `flutter pub get` passes.

## Models

- [x] Freezed user, authentication, profile, API error, page info, document, and location model sources.
- [ ] Generate and commit every `.freezed.dart` file.
- [ ] Generate and commit every `.g.dart` file.

## Navigation and Initial UI

- [x] Nested AutoRoute Home, Market, Post, and Profile stacks.
- [x] Liverpool-style animated tab shell.
- [x] Splash, login, registration, Home, Market, Profile, and logout.
- [x] Green approval screen with guided icons.
- [x] Backend status refresh from the approval screen.
- [x] Hide all application tabs until approval.
- [~] Approval routing is complete; role-specific approved shells remain.
- [~] Post screen is still a placeholder.

## Verification

- [x] Flutter smoke test replaces the counter test.
- [x] Linux/macOS verification script.
- [x] Windows verification script.
- [x] Scripts check backend first, then Flutter generation, analyze, and tests.
- [ ] Run one verification script.
- [ ] Fix every backend build or lint result.
- [ ] Fix every Flutter generation, analyze, or test result.

---

# Authentication Completion — In Progress

- [x] Access, role, and approval guards.
- [x] Approval state stored in backend token and Flutter session.
- [x] Profile refresh service.
- [x] Pending/rejected review screen.
- [x] Status refresh and logout actions.
- [x] Block protected tabs while review is incomplete.
- [ ] Backend document upload and validation.
- [ ] Store uploaded document references.
- [ ] Flutter upload progress and retry.
- [ ] Admin review and approval tools.
- [ ] Approved-user routing by role.
- [ ] Authentication and guard tests.

---

# Farmer Dashboard and Market Prices — Next Feature

## Backend First

- [ ] Goods category model and module.
- [ ] Searchable goods model and module.
- [ ] Market-price model and module.
- [ ] Government and regional price fields.
- [ ] Daily difference, percentage, and trend calculation.
- [ ] Latest-price and price-history endpoints.
- [ ] Farmer suggestions and admin notices.

## Farmer App Second

- [~] Green dashboard and demo price cards already exist.
- [ ] Freezed goods and market-price models.
- [ ] Connect latest-price API.
- [ ] Connect price-history API.
- [ ] Loading, empty, error, and retry states.
- [ ] Search and category filters.
- [ ] Trend details, suggestions, and notices.
- [ ] Replace demo cards with backend data.

## Immediate Order

1. Run `scripts/verify-development.ps1` or `scripts/verify-development.sh`.
2. Fix all verification results.
3. Commit generated model files to `development`.
4. Start the market-price backend module.
5. Connect the Farmer price screen only after the backend is ready.
