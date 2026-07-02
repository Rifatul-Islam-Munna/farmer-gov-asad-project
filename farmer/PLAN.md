# Farmer Government Platform — Product and Technical Plan

## Branch Policy

- [x] All active feature work is committed directly to `development`.
- [x] `main` remains the stable branch.
- [x] Generated AutoRoute output is committed directly to `development`.
- [ ] Remove every branch except `main` and `development`.
- [ ] Remove the accidental `farmer_app/` directory.
- [ ] Merge `development` into `main` only after backend and Flutter checks pass.

## Status Legend

- [x] Completed and committed to `development`.
- [~] Started or partially implemented.
- [ ] Not started.
- [!] Requires executable verification.

---

# 1. Completed Foundation

## 1.1 Documentation and Project Structure

- [x] Use the existing Flutter project at `farmer/`.
- [x] Keep the NestJS backend at `backend/`.
- [x] Create the `development` branch.
- [x] Add `farmer/PLAN.md`.
- [x] Add `farmer/TASKS.md`.
- [x] Add Farmer setup and verification commands to `farmer/README.md`.
- [~] Remove the accidental `farmer_app/` folder.
- [~] Keep only `main` and `development` branches.

## 1.2 Backend Authentication and Users

- [x] Use MongoDB/Mongoose for users.
- [x] Support `admin`, `agent`, `farmer`, `buyer`, and `medicineSeller`.
- [x] Add farmer land amount.
- [x] Add document fields for buyer, agent, and medicine seller.
- [x] Add business name, shop name, address, and verification status.
- [x] Add role-specific DTO validation.
- [x] Persist role-specific registration fields.
- [x] Keep register, login, OTP verification, profile, and logout routes.
- [!] Run backend build and ESLint in an environment with package access.

## 1.3 Flutter Application Foundation

- [x] Add the requested Flutter package list.
- [x] Use Flutter default fonts.
- [x] Add `.env` and `.env.example`.
- [x] Initialize GetIt.
- [x] Register SharedPreferences.
- [x] Register FlutterSecureStorage.
- [x] Initialize CachedQuery and CachedStorage.
- [x] Add optional OneSignal initialization through `.env`.
- [x] Add global AppToast messenger key.
- [x] Add green agricultural theme.
- [x] Add Android internet, camera, image, location, and notification permissions.
- [!] Run Flutter package installation, generation, analyze, and tests.

## 1.4 Networking and Session

- [x] Add `.env`-configured Dio base URL.
- [x] Add connect, send, and receive timeouts.
- [x] Add JSON headers.
- [x] Add PrettyDioLogger.
- [x] Inject `access_token` from secure storage.
- [x] Clear the session on HTTP 401.
- [x] Redirect to login on HTTP 401.
- [x] Prevent repeated simultaneous HTTP 401 redirects.
- [x] Save token, role, and user name.
- [x] Add server-backed logout with guaranteed local cleanup.

## 1.5 Freezed and JSON Models

- [x] Add `UserModel`.
- [x] Add `AuthResponseModel`.
- [x] Add `LoginRequestModel`.
- [x] Add `RegisterRequestModel`.
- [x] Add JsonSerializable-compatible conversion methods.
- [ ] Generate and commit all `.freezed.dart` and `.g.dart` files.

## 1.6 AutoRoute and Initial Screens

- [x] Add global router instance.
- [x] Add nested AutoRoute configuration.
- [x] Commit generated AutoRoute definitions directly to `development`.
- [x] Add Liverpool-style animated `AutoTabsScaffold`.
- [x] Add independent Home, Marketplace, Post, and Profile stacks.
- [x] Add agricultural splash screen.
- [x] Add backend-connected login page.
- [x] Add role-aware registration page.
- [x] Add farmer land field.
- [x] Add buyer, agent, and medicine-seller document UI.
- [x] Add medicine-seller shop and address fields.
- [x] Add Farmer home dashboard foundation.
- [x] Add demo Marketplace and price page.
- [x] Add Profile and logout page.
- [~] Keep the Post tab as a safe placeholder until the listing backend is implemented.

---

# 2. Product Vision

The platform connects farmers, buyers, agents, medicine sellers, and administrators.

Farmers will:

1. Photograph crop insects or diseases and receive diagnosis and treatment suggestions.
2. Create agricultural goods listings with quantity, government reference price, and minimum price.
3. Monitor current and previous market prices and receive practical suggestions.

Buyers will search listings, negotiate offers, and confirm deals.

Agents will create farmer accounts and post on behalf of farmers only after farmer OTP authorization.

Medicine sellers will publish location and inventory so farmers can find nearby treatment products.

---

# 3. User Roles

## Admin

- Manage users and verification.
- Review documents.
- Manage goods and categories.
- Manage government and market prices.
- Moderate listings and deals.
- Manage pest, disease, medicine, and pesticide data.
- View analytics and audit history.

Admin registration must not be public.

## Farmer

Required information:

- Name.
- Mobile number.
- Password or OTP access.
- Land amount.
- Optional location.

Capabilities:

- Crop and insect diagnosis.
- Treatment suggestions.
- Nearby medicine seller discovery.
- Goods listing creation.
- Market-price monitoring.
- Buyer offer management.
- Deal confirmation.

## Buyer

Required information:

- Name.
- Mobile number.
- Password.
- Identity or business documents.
- Optional business details and location.

Capabilities:

- Search and filter listings.
- View listing, quantity, price, and farmer information.
- Submit offers and counteroffers.
- Contact farmers.
- Confirm final deals.

## Agent

Required information:

- Name.
- Mobile number.
- Password.
- Identity or authorization documents.
- Service location.

Capabilities:

- Create farmer accounts through OTP.
- Search farmers.
- Post on behalf of farmers through OTP.
- View activity and audit history.

## Medicine Seller

Required information:

- Name.
- Mobile number.
- Password.
- Shop name.
- Shop address and location.
- Identity or business documents.

Capabilities:

- Manage shop profile.
- Manage medicine and pesticide inventory.
- Maintain stock and price.
- Receive farmer inquiries.
- Appear in nearby seller recommendations.

---

# 4. Farmer Home Features

## Crop and Insect Detection

1. Capture or select an image.
2. Upload through a typed DTO.
3. Show detected pest or disease.
4. Show confidence, symptoms, and risk.
5. Show medicine or pesticide suggestions.
6. Show safety instructions.
7. Show nearby sellers with stock.

The first provider will be a demo. Every valid image may return the same controlled diagnosis. The provider must remain replaceable without changing the Flutter UI.

## Sell Agricultural Goods

The farmer can:

- Search a good manually.
- Capture an image for demo identification.
- Enter quantity.
- Select grade.
- Enter harvest date and location.
- View government price.
- View market price.
- Set minimum price.
- Review and publish.

## Market Prices and Suggestions

The farmer can view:

- Current price.
- Previous price.
- Difference and percentage movement.
- Up, down, or stable indicator.
- Government reference rate.
- Regional rate.
- Farmer suggestions and admin notices.

---

# 5. Marketplace and Deals

Listing statuses:

- `draft`
- `pendingOtp`
- `published`
- `reserved`
- `sold`
- `expired`
- `cancelled`
- `rejected`

Offer statuses:

- `pending`
- `countered`
- `acceptedByBuyer`
- `acceptedByFarmer`
- `confirmed`
- `rejected`
- `cancelled`
- `expired`

A deal is confirmed only when buyer and farmer accept the same quantity and price.

The platform must retain the original listing, offers, counteroffers, confirmations, and audit history.

---

# 6. Agent OTP Workflows

## Create Farmer

1. Agent enters farmer information.
2. Backend validates the phone number.
3. Backend creates a pending request.
4. OTP goes to the farmer.
5. Agent enters the farmer-provided OTP.
6. Backend verifies it.
7. Farmer account is created.
8. Agent action is audited.

## Post for Farmer

1. Agent prepares the listing.
2. Agent selects a farmer.
3. Backend creates a pending delegated request.
4. OTP goes to the farmer.
5. Agent enters the farmer-provided OTP.
6. Backend verifies authorization.
7. Listing is owned by the farmer.
8. Assisting agent ID is stored.

---

# 7. Demo Provider Strategy

## Diagnosis Provider

- Accept an image.
- Return a typed diagnosis.
- Demo returns one fixed diagnosis and treatment.
- Future provider may use an internal model or third-party API.

## Goods Identification Provider

- Accept an image.
- Return a good and confidence score.
- Demo returns one fixed good.
- Farmer can correct the result.

## OTP Provider

- Development provider may log a demo OTP.
- Production provider will use an SMS gateway.
- Production responses must not expose OTP values.

## Market Price Provider

- Initial data is managed in MongoDB by admin.
- Future data may come from an approved external source.

---

# 8. Backend Architecture

Planned NestJS modules:

- `auth`
- `users`
- `documents`
- `otp`
- `farmers`
- `agents`
- `buyers`
- `medicine-sellers`
- `goods`
- `goods-categories`
- `market-prices`
- `listings`
- `offers`
- `deals`
- `diagnosis`
- `goods-detection`
- `medicines`
- `seller-inventory`
- `locations`
- `notifications`
- `audit-logs`
- `admin`

Standards:

- MongoDB/Mongoose.
- DTO validation.
- Role and ownership guards.
- JWT access tokens.
- OTP expiration and attempt limits.
- File validation.
- Audit logging.
- Pagination and filtering.
- Consistent errors and responses.
- Swagger documentation.

---

# 9. Flutter Architecture

Only `farmer/` is the active Flutter app.

```text
farmer/lib/
  core/
    navigation/
    network/
    router/
    storage/
    theme/
    utils/
  features/
    auth/
    home/
    diagnosis/
    marketplace/
    market_prices/
    buyer/
    agent/
    medicine_seller/
    notifications/
    profile/
```

Every API model must use Freezed and JsonSerializable.

AutoRoute must preserve independent nested stacks and reset a tab stack to its root when switching tabs.

---

# 10. Delivery Phases

## Phase 0 — Foundation

- [x] Backend roles and registration fields.
- [x] Flutter packages and initialization.
- [x] Environment, Dio, storage, and theme.
- [x] Model source files.
- [x] Nested AutoRoute source and generated definitions.
- [x] Splash, login, registration, Home, Marketplace, Profile, and shell.
- [ ] Generate Freezed and JSON output.
- [ ] Run backend and Flutter executable checks.
- [ ] Remove duplicate folder and extra branches.

## Phase 1 — Authentication Completion

- [~] Login and registration API integration.
- [x] Logout integration.
- [ ] Document upload API.
- [ ] Verification-pending flow.
- [ ] Role-based shell redirects.
- [ ] Backend role guards.

## Phase 2 — Farmer Dashboard and Prices

- [~] Farmer dashboard.
- [~] Demo prices and Marketplace.
- [ ] Market-price backend.
- [ ] Farmer suggestions API.

## Phase 3 — Diagnosis

- [ ] Diagnosis backend and DTOs.
- [ ] Demo provider.
- [ ] Camera/gallery flow.
- [ ] Result UI.
- [ ] Nearby seller matching.

## Phase 4 — Listings

- [~] Post tab placeholder.
- [ ] Goods catalog backend.
- [ ] Demo goods identification.
- [ ] Full listing form.
- [ ] Listing history.

## Phase 5 — Buyer Marketplace and Deals

- [ ] Marketplace search backend.
- [ ] Listing details.
- [ ] Offers and counteroffers.
- [ ] Dual confirmation.
- [ ] Deal history.

## Phase 6 — Agent

- [ ] Create farmer through OTP.
- [ ] Search farmers.
- [ ] Post through OTP.
- [ ] Agent audit history.

## Phase 7 — Medicine Seller

- [ ] Seller onboarding completion.
- [ ] Inventory backend and UI.
- [ ] Location and nearby matching.

## Phase 8 — Administration and Production

- [ ] Admin tools.
- [ ] Production SMS.
- [ ] Production AI providers.
- [ ] Approved price provider.
- [ ] Notifications.
- [ ] Deployment hardening.

---

# 11. Definition of Done

A feature is complete only when:

- Backend schema, DTO, service, controller, authorization, and Swagger are complete.
- Flutter models use Freezed and JsonSerializable.
- Generated files are committed to `development`.
- API and UI responsibilities are separated.
- Loading, success, empty, and error states exist.
- Backend permissions are enforced.
- Navigation is connected.
- Validation is implemented.
- Backend build and lint pass.
- Flutter generation, analyze, and tests pass.
- `PLAN.md` and `TASKS.md` are updated on `development`.

---

# 12. Next Work Chunk

1. Generate and commit Freezed and JsonSerializable output on `development`.
2. Run and fix backend build and ESLint.
3. Run and fix Flutter analyze and tests.
4. Remove `farmer_app/`.
5. Remove every branch except `main` and `development`.
6. Build document upload.
7. Add role-aware shell redirects.
