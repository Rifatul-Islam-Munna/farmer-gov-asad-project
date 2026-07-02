# Farmer Government Platform — Task Tracker

All active work must be committed directly to `development`.

## Branch Rules

- [x] Use `development` for all active feature work.
- [x] Keep `main` as the stable branch.
- [x] Commit generated AutoRoute output to `development`.
- [ ] Delete every other branch.
- [ ] Delete the accidental `farmer_app/` folder.

## Completed Foundation

### Backend

- [x] MongoDB user schema.
- [x] JWT setup.
- [x] Register, login, OTP, profile, and logout routes.
- [x] Roles: admin, agent, farmer, buyer, medicine seller.
- [x] Farmer land amount.
- [x] Document fields.
- [x] Business name, shop name, address, verification status.
- [x] Role-specific DTO validation.
- [x] Role-specific persistence.
- [ ] Run backend build.
- [ ] Run backend ESLint.
- [ ] Add role and ownership guards.

### Flutter Setup

- [x] Add requested runtime and development packages.
- [x] Use default fonts.
- [x] Add `.env` and `.env.example`.
- [x] Add Android internet, camera, image, location, and notification permissions.
- [x] Initialize GetIt, SharedPreferences, secure storage, CachedQuery, CachedStorage, and optional OneSignal.
- [x] Add AppToast and green agricultural theme.
- [ ] Run `flutter pub get`.

### Networking and Session

- [x] Add `.env` Dio URL, validation, timeouts, JSON headers, and PrettyDioLogger.
- [x] Inject secure `access_token`.
- [x] Clear session and redirect on HTTP 401.
- [x] Store token, role, and name.
- [x] Add server-backed logout.
- [ ] Add typed API failures.
- [ ] Disable verbose logs in release.

### Models

- [x] Add Freezed User, auth response, login request, and registration request sources.
- [ ] Generate and commit every `.freezed.dart` file.
- [ ] Generate and commit every `.g.dart` file.
- [ ] Add API error, pagination, document, and location models.

### Navigation

- [x] Add global router and root router.
- [x] Add nested Home, Marketplace, Post, and Profile stacks.
- [x] Add Liverpool-style animated `AutoTabsScaffold`.
- [x] Reset each tab stack on tab change.
- [x] Commit `app_router.gr.dart` directly to `development`.
- [ ] Regenerate AutoRoute and compare output.
- [ ] Add authentication guard and role-aware redirects.

### Initial UI

- [x] Agricultural splash screen.
- [x] Backend-connected login page.
- [x] Role-aware registration page.
- [x] Farmer land field.
- [x] Buyer, agent, and medicine-seller document UI.
- [x] Medicine-seller shop and address fields.
- [x] Farmer home foundation.
- [x] Demo Marketplace and price screen.
- [x] Profile and logout.
- [~] Post tab placeholder.

### Verification

- [x] Replace default counter test.
- [ ] Run code generation.
- [ ] Run `flutter analyze` and `flutter test`.
- [ ] Run backend build and ESLint.
- [ ] Fix every reported issue.

---

# Authentication Completion

- [ ] Reject public admin registration explicitly.
- [ ] Add role and verification guards.
- [ ] Add document-upload module with MIME and size validation.
- [ ] Store uploaded document references.
- [ ] Add verification-pending response and UI.
- [ ] Add multipart upload and progress in Flutter.
- [ ] Route users by role.
- [ ] Add auth, storage, and Dio tests.

# Farmer Dashboard and Market Prices

- [~] Dashboard and demo price UI.
- [ ] Goods catalog and categories.
- [ ] Government and regional market-price schemas.
- [ ] Price comparison, trends, and history.
- [ ] Farmer suggestions and admin notices.
- [ ] Loading, empty, error, search, and filter UI.

# Demo Crop and Insect Diagnosis

- [ ] Diagnosis backend module, DTOs, provider interface, and fixed demo provider.
- [ ] Treatment, medicine, file validation, Swagger, and tests.
- [ ] Freezed diagnosis models.
- [ ] Camera/gallery capture, preview, multipart upload, progress, results, and retry.
- [ ] Nearby medicine-seller results.

# Medicine Sellers

- [ ] Medicine catalog, seller profile, location, and inventory.
- [ ] Stock, quantity, package size, and price.
- [ ] Inventory CRUD and nearby search.
- [ ] Diagnosis-to-inventory matching.
- [ ] Seller dashboard and inventory UI.

# Goods Detection and Listings

- [ ] Goods categories, schema, indexes, admin CRUD, and public search.
- [ ] Demo goods-identification provider and DTOs.
- [ ] Listing schema, ownership, goods snapshot, images, quantity, grade, date, location, and prices.
- [ ] Create, draft, publish, cancel, history, search, and filters.
- [~] Post placeholder.
- [ ] Complete typed listing form, review, publish, and history.

# Buyer Marketplace and Deals

- [~] Demo Marketplace UI.
- [ ] Backend search, pagination, filters, details, and contact action.
- [ ] Offers, counteroffers, buyer/farmer acceptance, dual confirmation, overselling protection, and audit history.
- [ ] Offer and deal UI.

# Agent OTP Workflows

- [ ] OTP schema, purpose, expiry, attempts, resend, and consumed state.
- [ ] Development provider and production SMS interface.
- [ ] Create farmer through OTP.
- [ ] Post for farmer through OTP.
- [ ] Agent audit history and Flutter OTP screens.

# Notifications

- [ ] Notification model and device registration.
- [ ] Offer, deal, OTP, and delegated-post notifications.
- [ ] In-app list and read state.

# Admin and Moderation

- [ ] User/document review and account approval.
- [ ] Goods, prices, suggestions, and notice management.
- [ ] Listing, report, and dispute moderation.
- [ ] Audit history.

# Security and Production

- [ ] Verify hashing and environment secrets.
- [ ] Add role, ownership, document, and upload protection.
- [ ] Add OTP, login, and upload rate limits.
- [ ] Prevent query injection and overselling.
- [ ] Remove sensitive logs and disable demo/verbose production behavior.
- [ ] Configure production database, storage, SMS, and notifications.

---

# Immediate Next Tasks

- [ ] Delete all branches except `main` and `development`.
- [ ] Delete `farmer_app/`.
- [ ] Run `flutter pub get`.
- [ ] Generate Freezed and JSON files.
- [ ] Regenerate AutoRoute.
- [ ] Run Flutter analyze and tests.
- [ ] Run backend build and ESLint.
- [ ] Fix every error.
- [ ] Build document upload.
- [ ] Add role-aware redirects.
