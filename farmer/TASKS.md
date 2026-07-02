# Farmer Government Platform — Implementation Task Tracker

This file is the authoritative implementation checklist for the Farmer Government Platform.

## Working Rules

- Work only in the existing `farmer/` Flutter project.
- Do not create another Flutter application folder.
- Development work must be performed on the `development` branch unless a dedicated feature branch is intentionally created from it.
- Implement features in small, reviewable code chunks.
- Mark a task complete only after its code is committed and verified.
- All API request and response models must use Freezed and JsonSerializable.
- Demo integrations must still use production-ready interfaces, DTOs, repositories, and API endpoints.
- Role authorization must be enforced by the backend, not only hidden in the Flutter UI.
- Update this file in the same commit or immediately after completing a task.

---

# 0. Current Verified Progress

- [x] Identify the real Flutter application at `farmer/`.
- [x] Confirm that the existing `farmer/` project contains the Android Flutter project.
- [x] Stop treating the accidental `farmer_app/` directory as the real application.
- [x] Create the `development` branch from the current repository state.
- [x] Create `farmer/PLAN.md`.
- [x] Create `farmer/TASKS.md`.
- [ ] Review and approve the product and technical plan before feature implementation.

---

# 1. Repository Cleanup and Branch Strategy

## 1.1 Cleanup

- [ ] Inspect every file currently inside the accidental `farmer_app/` directory.
- [ ] Confirm that no required source code exists only in `farmer_app/`.
- [ ] Move any reusable concepts into the real `farmer/` project through reviewed commits.
- [ ] Delete the accidental `farmer_app/` directory from `development`.
- [ ] Verify that the repository contains only one Flutter app for this product.
- [ ] Confirm the backend remains in `backend/`.
- [ ] Confirm Flutter remains in `farmer/`.

## 1.2 Branch Workflow

- [x] Create `development` branch.
- [ ] Protect `main` from direct feature development.
- [ ] Use `development` as the integration branch.
- [ ] Create focused branches when needed, for example:
  - [ ] `feature/auth-foundation`
  - [ ] `feature/farmer-dashboard`
  - [ ] `feature/demo-diagnosis`
  - [ ] `feature/marketplace-listing`
  - [ ] `feature/buyer-deals`
  - [ ] `feature/agent-otp`
  - [ ] `feature/medicine-seller`
- [ ] Merge completed feature branches into `development`.
- [ ] Merge `development` into `main` only after verification.

---

# 2. Flutter Package and Project Configuration

## 2.1 Replace Default `pubspec.yaml` Dependencies

Add and verify each supplied package in `farmer/pubspec.yaml`.

### Runtime Packages

- [ ] `freezed_annotation: ^3.1.0`
- [ ] `json_annotation: ^4.11.0`
- [ ] `shared_preferences: ^2.5.4`
- [ ] `flutter_secure_storage: ^10.0.0`
- [ ] `animations: ^2.1.1`
- [ ] `cached_network_image: ^3.4.1`
- [ ] `permission_handler: ^12.0.1`
- [ ] `qr_flutter: ^4.1.0`
- [ ] `mobile_scanner: ^7.2.0`
- [ ] `logger: ^2.6.2`
- [ ] `url_launcher: ^6.3.2`
- [ ] `intl: ^0.20.2`
- [ ] `auto_route: ^11.1.0`
- [ ] `get_it: ^9.2.1`
- [ ] `dartz: ^0.10.1`
- [ ] `dio: ^5.9.2`
- [ ] `pretty_dio_logger: ^1.4.0`
- [ ] `cached_query: ^3.5.1`
- [ ] `cached_query_flutter: ^3.3.6`
- [ ] `cached_storage: ^3.2.6`
- [ ] `flutter_stripe: ^12.4.0`
- [ ] `image_picker: ^1.2.0`
- [ ] `dotted_border: ^3.1.0`
- [ ] `path_provider: ^2.1.5`
- [ ] `screenshot: ^3.0.0`
- [ ] `share_plus: ^12.0.2`
- [ ] `material_symbols_icons: ^4.2928.1`
- [ ] `signals: ^6.3.0`
- [ ] `onesignal_flutter: ^5.5.3`
- [ ] `flutter_dotenv: ^6.0.1`
- [ ] `package_info_plus: ^9.0.1`

### Development Packages

- [ ] `flutter_lints: ^6.0.0`
- [ ] `build_runner: ^2.12.2`
- [ ] `freezed: ^3.2.5`
- [ ] `json_serializable: ^6.13.0`
- [ ] `flutter_launcher_icons: ^0.14.4`
- [ ] `auto_route_generator: ^10.5.0`

## 2.2 Font and Asset Configuration

- [ ] Do not copy the Liverpool custom font files.
- [ ] Remove any custom font declaration introduced for this app.
- [ ] Use Flutter's default platform font.
- [ ] Add `.env` to Flutter assets.
- [ ] Add only required image/icon assets.
- [ ] Prefer Material icons for initial demo screens.
- [ ] Verify all declared assets exist.

## 2.3 Environment Configuration

- [ ] Add `farmer/.env` for local development.
- [ ] Add `farmer/.env.example` without secrets.
- [ ] Add `API_URL` configuration.
- [ ] Document Android emulator API URL usage.
- [ ] Document physical-device API URL usage.
- [ ] Load `.env` before Dio initialization.
- [ ] Prevent secrets from being committed.

## 2.4 Android Configuration

- [ ] Verify internet permission.
- [ ] Configure camera permission.
- [ ] Configure gallery/media permission according to Android version.
- [ ] Configure notification permission.
- [ ] Configure location permission for nearby seller discovery.
- [ ] Configure secure-storage Android options.
- [ ] Verify application ID and app label.
- [ ] Verify minimum and target SDK compatibility with packages.

## 2.5 Code Generation

- [ ] Add a documented build command:
  - [ ] `dart run build_runner build --delete-conflicting-outputs`
- [ ] Add a documented watch command:
  - [ ] `dart run build_runner watch --delete-conflicting-outputs`
- [ ] Generate Freezed files.
- [ ] Generate JsonSerializable files.
- [ ] Generate AutoRoute files.
- [ ] Ensure generated files are committed according to project policy.

---

# 3. Flutter Core Architecture

## 3.1 Folder Structure

- [ ] Create `lib/app/`.
- [ ] Create `lib/core/api/`.
- [ ] Create `lib/core/config/`.
- [ ] Create `lib/core/errors/`.
- [ ] Create `lib/core/network/`.
- [ ] Create `lib/core/router/`.
- [ ] Create `lib/core/storage/`.
- [ ] Create `lib/core/theme/`.
- [ ] Create `lib/core/utils/`.
- [ ] Create `lib/core/widgets/`.
- [ ] Create `lib/features/auth/`.
- [ ] Create `lib/features/onboarding/`.
- [ ] Create `lib/features/farmer_home/`.
- [ ] Create `lib/features/diagnosis/`.
- [ ] Create `lib/features/marketplace/`.
- [ ] Create `lib/features/market_prices/`.
- [ ] Create `lib/features/buyer/`.
- [ ] Create `lib/features/agent/`.
- [ ] Create `lib/features/medicine_seller/`.
- [ ] Create `lib/features/notifications/`.
- [ ] Create `lib/features/profile/`.

## 3.2 Dependency Injection

- [ ] Initialize GetIt.
- [ ] Register `SharedPreferences`.
- [ ] Register `FlutterSecureStorage`.
- [ ] Register Dio client.
- [ ] Register API services.
- [ ] Register repositories.
- [ ] Register feature controllers or signals.
- [ ] Ensure initialization occurs before `runApp`.

## 3.3 Networking

Adapt the Liverpool client Dio pattern.

- [ ] Create a single Dio helper/client.
- [ ] Read base URL from `.env`.
- [ ] Normalize the base URL.
- [ ] Configure connect timeout.
- [ ] Configure send timeout.
- [ ] Configure receive timeout.
- [ ] Configure JSON headers.
- [ ] Add secure token to `access_token` header.
- [ ] Optionally support `Authorization: Bearer` where required.
- [ ] Add PrettyDioLogger in development mode.
- [ ] Handle HTTP 401 globally.
- [ ] Clear local session on HTTP 401.
- [ ] Redirect to login on HTTP 401.
- [ ] Prevent repeated simultaneous login redirects.
- [ ] Convert Dio errors into typed app failures.

## 3.4 Local Storage

- [ ] Store access token in FlutterSecureStorage.
- [ ] Store non-sensitive user profile data in SharedPreferences.
- [ ] Add typed session read methods.
- [ ] Add session-exists method.
- [ ] Add complete logout/clear method.
- [ ] Add safe JSON decoding error handling.

## 3.5 Theme

- [ ] Create green agricultural color palette.
- [ ] Use Flutter default fonts.
- [ ] Define light theme.
- [ ] Define reusable spacing constants.
- [ ] Define reusable border radii.
- [ ] Define button styles.
- [ ] Define form-field styles.
- [ ] Define card styles.
- [ ] Define error/success/warning colors.
- [ ] Verify readable color contrast.

---

# 4. Freezed and JsonSerializable Model Standard

## 4.1 Required Convention

Every API model must follow this pattern:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'model_name.freezed.dart';
part 'model_name.g.dart';

@freezed
abstract class ModelName with _$ModelName {
  const factory ModelName({
    required String id,
  }) = _ModelName;

  factory ModelName.fromJson(Map<String, dynamic> json) =>
      _$ModelNameFromJson(json);
}
```

## 4.2 Foundation Models

- [ ] Create `UserRole` enum for:
  - [ ] `admin`
  - [ ] `agent`
  - [ ] `farmer`
  - [ ] `buyer`
  - [ ] `medicineSeller`
- [ ] Create `UserModel` with Freezed.
- [ ] Create `AuthResponseModel` with Freezed.
- [ ] Create `LoginRequestModel` with Freezed.
- [ ] Create `RegisterRequestModel` with Freezed.
- [ ] Create `ApiErrorModel` with Freezed.
- [ ] Create `PaginationMetaModel` with Freezed.
- [ ] Create `DocumentModel` with Freezed.
- [ ] Create `LocationModel` with Freezed.
- [ ] Generate and verify model code.

## 4.3 Model Rules

- [ ] Separate request DTO models from response models.
- [ ] Use `@JsonKey` for backend key differences.
- [ ] Avoid untyped `dynamic` in feature APIs where possible.
- [ ] Do not manually parse production API responses in widgets.
- [ ] Keep JSON conversion inside data models.
- [ ] Keep business transformations inside mappers or repositories.

---

# 5. Backend Foundation and Role Migration

## 5.1 Existing Backend Review

- [ ] Review current NestJS module structure.
- [ ] Review current MongoDB connection.
- [ ] Review current JWT configuration.
- [ ] Review current Swagger setup.
- [ ] Review current user schema.
- [ ] Review current login/register/logout routes.
- [ ] Remove obsolete or accidental placeholder files.
- [ ] Run backend build after cleanup.

## 5.2 User Roles

- [ ] Replace temporary roles with final roles:
  - [ ] `admin`
  - [ ] `agent`
  - [ ] `farmer`
  - [ ] `buyer`
  - [ ] `medicineSeller`
- [ ] Add role validation to registration DTOs.
- [ ] Block public admin registration.
- [ ] Add role-aware authorization decorator.
- [ ] Add role guard.
- [ ] Add role-based Swagger documentation.

## 5.3 Role-Specific User Data

- [ ] Add farmer land amount.
- [ ] Add farmer location.
- [ ] Add agent document references.
- [ ] Add agent service location.
- [ ] Add buyer document references.
- [ ] Add buyer business information.
- [ ] Add medicine seller shop name.
- [ ] Add medicine seller address.
- [ ] Add medicine seller coordinates.
- [ ] Add medicine seller document references.
- [ ] Add account verification status.
- [ ] Add document review status.

## 5.4 Authentication

- [ ] Validate login by phone number.
- [ ] Hash passwords.
- [ ] Return typed auth response.
- [ ] Return role and onboarding state.
- [ ] Verify logout access token.
- [ ] Decide whether token revocation is required.
- [ ] Add refresh-token strategy if approved.
- [ ] Add profile endpoint.
- [ ] Add session error consistency.

---

# 6. Splash, Authentication, and Onboarding

## 6.1 Splash Screen

- [ ] Build green agricultural splash UI.
- [ ] Use farming icon or illustration.
- [ ] Check local session.
- [ ] Route unauthenticated user to login.
- [ ] Route authenticated user to role shell.
- [ ] Handle corrupt local session.

## 6.2 Login

- [ ] Build phone-number field.
- [ ] Build password field.
- [ ] Add show/hide password.
- [ ] Add loading state.
- [ ] Add validation state.
- [ ] Add API error display.
- [ ] Save token securely.
- [ ] Save user profile locally.
- [ ] Route by role after login.
- [ ] Add link to registration.

## 6.3 Role Selection

- [ ] Build role selection page.
- [ ] Add icon for farmer.
- [ ] Add icon for buyer.
- [ ] Add icon for agent.
- [ ] Add icon for medicine seller.
- [ ] Do not expose admin registration.
- [ ] Explain required information for each role.

## 6.4 Farmer Registration

- [ ] Name field.
- [ ] Phone-number field.
- [ ] Password field.
- [ ] Land amount field.
- [ ] Land unit selection if required.
- [ ] Optional location.
- [ ] Submit typed register DTO.
- [ ] Handle duplicate number.
- [ ] Route to farmer home after success.

## 6.5 Buyer Registration

- [ ] Name field.
- [ ] Phone-number field.
- [ ] Password field.
- [ ] Business information fields.
- [ ] Document picker.
- [ ] Document preview.
- [ ] Upload progress.
- [ ] Submit typed register DTO.
- [ ] Show verification-pending state.

## 6.6 Agent Registration

- [ ] Name field.
- [ ] Phone-number field.
- [ ] Password field.
- [ ] Service location field.
- [ ] Identity/authorization document picker.
- [ ] Upload progress.
- [ ] Submit typed register DTO.
- [ ] Show verification-pending state.

## 6.7 Medicine Seller Registration

- [ ] Owner/representative name.
- [ ] Phone-number field.
- [ ] Password field.
- [ ] Shop name.
- [ ] Shop address.
- [ ] Location selection.
- [ ] Business/identity documents.
- [ ] Submit typed register DTO.
- [ ] Show verification-pending state.

## 6.8 Logout

- [ ] Call backend logout endpoint.
- [ ] Clear secure token even if backend call fails.
- [ ] Clear saved user.
- [ ] Clear cached role state.
- [ ] Replace route stack with login.

---

# 7. AutoRoute and Nested Navigation

## 7.1 Router Foundation

- [ ] Configure AutoRoute generator.
- [ ] Create global router instance.
- [ ] Create splash route.
- [ ] Create login route.
- [ ] Create role-selection route.
- [ ] Create registration route.
- [ ] Create onboarding route.
- [ ] Create authentication guard.
- [ ] Create role guard or role-aware redirect logic.

## 7.2 Farmer Nested Routes

- [ ] Farmer shell.
- [ ] Farmer home route.
- [ ] Diagnosis route.
- [ ] Diagnosis result route.
- [ ] Nearby seller route.
- [ ] Sell-good route.
- [ ] Goods search route.
- [ ] Market prices route.
- [ ] Farmer offers route.
- [ ] Farmer deal-details route.
- [ ] Farmer profile route.

## 7.3 Buyer Nested Routes

- [ ] Buyer shell.
- [ ] Buyer marketplace route.
- [ ] Listing details route.
- [ ] Create offer route.
- [ ] Buyer offers route.
- [ ] Buyer deals route.
- [ ] Market prices route.
- [ ] Buyer profile route.

## 7.4 Agent Nested Routes

- [ ] Agent shell.
- [ ] Agent home route.
- [ ] Create-farmer route.
- [ ] Verify farmer OTP route.
- [ ] Search-farmer route.
- [ ] Post-for-farmer route.
- [ ] Verify posting OTP route.
- [ ] Agent activity route.
- [ ] Agent profile route.

## 7.5 Medicine Seller Nested Routes

- [ ] Medicine seller shell.
- [ ] Seller home route.
- [ ] Inventory route.
- [ ] Add inventory item route.
- [ ] Edit inventory item route.
- [ ] Shop profile route.
- [ ] Farmer inquiries route.

## 7.6 Admin Route Foundation

- [ ] Admin shell route placeholder.
- [ ] Admin dashboard route placeholder.
- [ ] Restrict admin routes.

---

# 8. Farmer Home Page

## 8.1 Home Layout

- [ ] Show farmer greeting.
- [ ] Show user land summary.
- [ ] Add primary diagnosis card.
- [ ] Add sell-goods card.
- [ ] Add market-price card.
- [ ] Add current offers summary.
- [ ] Add farming suggestions section.
- [ ] Add notices section.
- [ ] Add loading state.
- [ ] Add offline/empty state.

## 8.2 Farmer Home Data Models

- [ ] `FarmerDashboardModel`.
- [ ] `FarmerSuggestionModel`.
- [ ] `NoticeModel`.
- [ ] `PriceSummaryModel`.
- [ ] Generate Freezed files.

---

# 9. Crop/Insect Detection — Demo First

## 9.1 Backend Diagnosis Domain

- [ ] Create diagnosis module.
- [ ] Create image-upload DTO.
- [ ] Create diagnosis response DTO.
- [ ] Create pest/disease DTO.
- [ ] Create treatment recommendation DTO.
- [ ] Create nearby seller summary DTO.
- [ ] Create diagnosis provider interface.
- [ ] Create demo diagnosis provider.
- [ ] Accept any valid demo image.
- [ ] Return the same predefined diagnosis for every image.
- [ ] Return predefined medicine/pesticide recommendations.
- [ ] Add Swagger documentation.
- [ ] Add file-size validation.
- [ ] Add file-type validation.

## 9.2 Flutter Diagnosis Models

- [ ] `DiagnosisRequestModel` where applicable.
- [ ] `DiagnosisResponseModel`.
- [ ] `DetectedIssueModel`.
- [ ] `TreatmentRecommendationModel`.
- [ ] `NearbyMedicineSellerModel`.
- [ ] Generate Freezed and JSON files.

## 9.3 Flutter Camera Flow

- [ ] Request camera permission.
- [ ] Open camera.
- [ ] Capture image.
- [ ] Select image from gallery.
- [ ] Preview selected image.
- [ ] Retake/remove image.
- [ ] Compress image if required.
- [ ] Upload multipart image.
- [ ] Show upload progress.
- [ ] Show demo diagnosis result.
- [ ] Show recommended medicine.
- [ ] Show safe-use warning.
- [ ] Show nearby medicine sellers.
- [ ] Add retry flow.

## 9.4 Future Provider Replacement

- [ ] Document diagnosis provider contract.
- [ ] Keep demo provider behind interface.
- [ ] Add configuration for real provider selection.
- [ ] Ensure UI does not depend on demo response constants.

---

# 10. Medicine Seller and Inventory

## 10.1 Backend Seller Domain

- [ ] Create medicine-seller module.
- [ ] Create shop profile schema.
- [ ] Create location/coordinates schema.
- [ ] Create medicine catalog schema.
- [ ] Create seller inventory schema.
- [ ] Add inventory indexes.
- [ ] Add stock availability field.
- [ ] Add optional stock quantity.
- [ ] Add package size.
- [ ] Add seller price.
- [ ] Add last-updated timestamp.

## 10.2 Seller APIs

- [ ] Create/update shop profile.
- [ ] Add inventory item.
- [ ] Edit inventory item.
- [ ] Remove inventory item.
- [ ] List seller inventory.
- [ ] Search medicines.
- [ ] Find nearby sellers with stock.
- [ ] Filter by recommended medicine.

## 10.3 Seller Flutter UI

- [ ] Seller dashboard.
- [ ] Shop profile form.
- [ ] Location form/map-ready structure.
- [ ] Inventory list.
- [ ] Add medicine form.
- [ ] Edit medicine form.
- [ ] Stock toggle.
- [ ] Farmer inquiry placeholder.

---

# 11. Goods Catalog and Market Prices

## 11.1 Goods Master Data

- [ ] Create goods module.
- [ ] Create goods category schema.
- [ ] Create good schema.
- [ ] Add name.
- [ ] Add localized name support.
- [ ] Add category.
- [ ] Add default unit.
- [ ] Add image.
- [ ] Add active status.
- [ ] Add searchable index.
- [ ] Add admin create/update/delete APIs.
- [ ] Add public search API.

## 11.2 Market Price Data

- [ ] Create market-price module.
- [ ] Add government reference price.
- [ ] Add regional market price.
- [ ] Add date.
- [ ] Add location/market.
- [ ] Add unit.
- [ ] Add previous-price comparison.
- [ ] Add trend calculation.
- [ ] Add price-history API.
- [ ] Add latest-price API.
- [ ] Add admin price-entry API.

## 11.3 Flutter Price Models

- [ ] `GoodModel`.
- [ ] `GoodsCategoryModel`.
- [ ] `MarketPriceModel`.
- [ ] `PriceHistoryPointModel`.
- [ ] `PriceTrendModel`.
- [ ] Generate Freezed files.

## 11.4 Flutter Market Price UI

- [ ] Current price list.
- [ ] Search goods.
- [ ] Filter by category.
- [ ] Show previous day's price.
- [ ] Show amount difference.
- [ ] Show percentage difference.
- [ ] Show up/down/stable icon.
- [ ] Show government price.
- [ ] Show market/region.
- [ ] Show price history details.
- [ ] Show farmer suggestion based on movement.

---

# 12. Goods Image Identification — Demo First

## 12.1 Backend Provider

- [ ] Create goods-detection module.
- [ ] Create provider interface.
- [ ] Create image request DTO.
- [ ] Create identified-good response DTO.
- [ ] Create demo provider.
- [ ] Accept any valid image.
- [ ] Return the same predefined good.
- [ ] Return a confidence score.
- [ ] Return matching goods-catalog ID.
- [ ] Add Swagger documentation.

## 12.2 Flutter Flow

- [ ] Capture good image.
- [ ] Select good image from gallery.
- [ ] Preview image.
- [ ] Call typed demo detection API.
- [ ] Autofill good selection.
- [ ] Allow farmer to correct identified good.
- [ ] Keep manual search available.

## 12.3 Future Replacement

- [ ] Document goods-detection provider interface.
- [ ] Add environment/provider selection.
- [ ] Keep UI independent from demo provider.

---

# 13. Farmer Sale Listings

## 13.1 Backend Listing Schema

- [ ] Farmer owner ID.
- [ ] Optional assisting agent ID.
- [ ] Good ID.
- [ ] Good snapshot fields.
- [ ] Image references.
- [ ] Quantity.
- [ ] Unit.
- [ ] Quality/grade.
- [ ] Harvest date.
- [ ] Location.
- [ ] Government reference price snapshot.
- [ ] Market price snapshot.
- [ ] Minimum price.
- [ ] Description.
- [ ] Listing status.
- [ ] Published time.
- [ ] Expiry time.
- [ ] Search indexes.

## 13.2 Listing APIs

- [ ] Create listing.
- [ ] Update draft listing.
- [ ] Publish listing.
- [ ] Cancel listing.
- [ ] Get farmer's listings.
- [ ] Get listing details.
- [ ] Search published listings.
- [ ] Filter by good.
- [ ] Filter by category.
- [ ] Filter by location.
- [ ] Filter by price.
- [ ] Filter by quantity.
- [ ] Paginate results.

## 13.3 Flutter Sell Form

- [ ] Choose manual search or image identification.
- [ ] Good selection.
- [ ] Quantity field.
- [ ] Unit field.
- [ ] Quality field.
- [ ] Harvest date.
- [ ] Location field.
- [ ] Fetch government reference price.
- [ ] Display current market price.
- [ ] Minimum price field.
- [ ] Description field.
- [ ] Image picker.
- [ ] Validation.
- [ ] Draft state.
- [ ] Review-before-publish screen.
- [ ] Publish confirmation.
- [ ] Success screen.
- [ ] Farmer listings screen.

---

# 14. Buyer Marketplace

## 14.1 Buyer Marketplace UI

- [ ] Marketplace home.
- [ ] Search by good name.
- [ ] Category filter.
- [ ] Location filter.
- [ ] Quantity filter.
- [ ] Price range filter.
- [ ] Listing cards.
- [ ] Pagination/infinite scroll.
- [ ] Empty state.
- [ ] Listing details.
- [ ] Farmer summary.
- [ ] Available quantity.
- [ ] Minimum price.
- [ ] Government price comparison.
- [ ] Contact action.
- [ ] Create-offer action.

## 14.2 Buyer Offer Models

- [ ] `OfferRequestModel`.
- [ ] `OfferResponseModel`.
- [ ] `OfferHistoryModel`.
- [ ] `DealModel`.
- [ ] Generate Freezed files.

---

# 15. Offer, Negotiation, and Deal Confirmation

## 15.1 Backend Offer Domain

- [ ] Create offers module.
- [ ] Create offer schema.
- [ ] Store listing ID.
- [ ] Store buyer ID.
- [ ] Store farmer ID.
- [ ] Store requested quantity.
- [ ] Store offered unit price.
- [ ] Store total price.
- [ ] Store optional message.
- [ ] Store offer status.
- [ ] Store counteroffer history.
- [ ] Add authorization rules.

## 15.2 Dual Confirmation

- [ ] Buyer submits offer.
- [ ] Farmer accepts, rejects, or counters.
- [ ] Buyer accepts final farmer terms.
- [ ] Farmer confirms final terms.
- [ ] Confirm deal only when both sides accept identical terms.
- [ ] Lock agreed quantity.
- [ ] Update listing availability.
- [ ] Prevent quantity overselling.
- [ ] Store buyer confirmation time.
- [ ] Store farmer confirmation time.
- [ ] Store immutable audit history.

## 15.3 Flutter Deal UI

- [ ] Buyer offer form.
- [ ] Buyer offer list.
- [ ] Farmer received-offer list.
- [ ] Offer details.
- [ ] Counteroffer form.
- [ ] Accept action.
- [ ] Reject action.
- [ ] Final buyer confirmation.
- [ ] Final farmer confirmation.
- [ ] Confirmed deal details.
- [ ] Deal-status timeline.

---

# 16. Agent Farmer-Creation Workflow

## 16.1 Backend OTP Foundation

- [ ] Create OTP module.
- [ ] Create OTP schema.
- [ ] Add purpose field.
- [ ] Add phone number.
- [ ] Add hashed OTP or secure storage method.
- [ ] Add expiry time.
- [ ] Add attempt count.
- [ ] Add resend count.
- [ ] Add consumed status.
- [ ] Add development-only demo OTP provider.
- [ ] Add production SMS provider interface.

## 16.2 Agent Creates Farmer

- [ ] Agent enters farmer name.
- [ ] Agent enters farmer phone number.
- [ ] Agent enters land amount.
- [ ] Backend checks existing user.
- [ ] Backend creates pending registration.
- [ ] OTP sent to farmer phone.
- [ ] Agent enters farmer-provided OTP.
- [ ] Backend verifies OTP.
- [ ] Farmer account created.
- [ ] Agent ID stored in audit log.
- [ ] Farmer receives success notification.

## 16.3 Flutter Agent UI

- [ ] Agent home.
- [ ] Create farmer form.
- [ ] OTP entry page.
- [ ] Resend OTP with timer.
- [ ] Existing-number error.
- [ ] Success page.
- [ ] Assisted farmer list.

---

# 17. Agent Posts on Behalf of Farmer

## 17.1 Backend Delegated Listing

- [ ] Search farmer by phone number.
- [ ] Validate selected farmer.
- [ ] Create pending delegated post.
- [ ] Send OTP to farmer phone.
- [ ] Verify OTP purpose and farmer.
- [ ] Publish listing as farmer-owned.
- [ ] Store assisting agent ID.
- [ ] Store authorization timestamp.
- [ ] Store audit event.
- [ ] Prevent agent from publishing without OTP.

## 17.2 Flutter Agent Posting UI

- [ ] Search farmer field.
- [ ] Farmer search results.
- [ ] Select farmer.
- [ ] Reuse farmer sale form components.
- [ ] Review represented farmer.
- [ ] Request OTP.
- [ ] Enter OTP.
- [ ] Publish delegated listing.
- [ ] Show success state.
- [ ] Show delegated-post history.

---

# 18. Notifications

- [ ] Define notification model with Freezed.
- [ ] Configure OneSignal only through environment configuration.
- [ ] Register device ID.
- [ ] Store notification preference.
- [ ] Notify farmer of buyer offer.
- [ ] Notify buyer of farmer response.
- [ ] Notify both sides of confirmed deal.
- [ ] Notify farmer of OTP.
- [ ] Notify farmer of delegated post request.
- [ ] Notify medicine seller of inquiry.
- [ ] Add in-app notification list.
- [ ] Add read/unread state.

---

# 19. Admin and Moderation

## 19.1 User Management

- [ ] List users.
- [ ] Filter by role.
- [ ] View user details.
- [ ] Review documents.
- [ ] Approve agent.
- [ ] Reject agent.
- [ ] Approve buyer.
- [ ] Reject buyer.
- [ ] Approve medicine seller.
- [ ] Reject medicine seller.
- [ ] Suspend user.
- [ ] Restore user.

## 19.2 Catalog and Price Management

- [ ] Manage goods categories.
- [ ] Manage goods.
- [ ] Manage government prices.
- [ ] Manage regional prices.
- [ ] Import price data if required.
- [ ] Manage farmer suggestions.
- [ ] Manage notices.

## 19.3 Marketplace Moderation

- [ ] Review reported listings.
- [ ] Remove invalid listing.
- [ ] Review reported users.
- [ ] Review deal disputes.
- [ ] View agent audit history.
- [ ] View OTP audit events without exposing OTP values.

---

# 20. Security Tasks

- [ ] Password hashing verified.
- [ ] JWT secret loaded from environment.
- [ ] No default production JWT secret.
- [ ] Role guards applied.
- [ ] Ownership checks applied.
- [ ] Document endpoints protected.
- [ ] File MIME validation.
- [ ] File-size limits.
- [ ] OTP expiration.
- [ ] OTP attempt limits.
- [ ] OTP resend limits.
- [ ] OTP consumed after success.
- [ ] Rate-limit login.
- [ ] Rate-limit OTP endpoints.
- [ ] Rate-limit image detection endpoints.
- [ ] Sanitize search input.
- [ ] Prevent Mongo query injection.
- [ ] Prevent listing quantity overselling.
- [ ] Preserve deal audit data.
- [ ] Protect admin endpoints.
- [ ] Remove sensitive values from logs.
- [ ] Review Dio logger for production builds.

---

# 21. Testing and Quality Assurance

## 21.1 Backend Tests

- [ ] Auth service unit tests.
- [ ] Role guard tests.
- [ ] OTP service tests.
- [ ] Farmer registration tests.
- [ ] Agent farmer-creation tests.
- [ ] Delegated-post OTP tests.
- [ ] Diagnosis demo-provider tests.
- [ ] Goods detection demo-provider tests.
- [ ] Listing service tests.
- [ ] Offer service tests.
- [ ] Dual-confirmation tests.
- [ ] Medicine inventory tests.
- [ ] Market price tests.
- [ ] E2E auth tests.
- [ ] E2E marketplace tests.

## 21.2 Flutter Tests

- [ ] Freezed model serialization tests.
- [ ] Auth repository tests.
- [ ] Dio interceptor tests.
- [ ] Session storage tests.
- [ ] Splash routing test.
- [ ] Login widget test.
- [ ] Role selection widget test.
- [ ] Registration form tests.
- [ ] Farmer dashboard widget test.
- [ ] Diagnosis flow widget test.
- [ ] Sell form validation tests.
- [ ] Buyer offer flow tests.
- [ ] Agent OTP flow tests.
- [ ] Seller inventory flow tests.

## 21.3 Manual Verification

- [ ] Android emulator login.
- [ ] Android physical-device login.
- [ ] Camera permission.
- [ ] Gallery selection.
- [ ] Demo diagnosis response.
- [ ] Demo good detection response.
- [ ] Farmer listing creation.
- [ ] Buyer search.
- [ ] Buyer offer.
- [ ] Farmer acceptance.
- [ ] Dual confirmation.
- [ ] Agent farmer creation OTP.
- [ ] Agent delegated post OTP.
- [ ] Medicine seller inventory.
- [ ] Nearby seller result.
- [ ] Logout.
- [ ] Expired-token redirect.

---

# 22. Documentation

- [x] Product and technical plan created.
- [x] Implementation task tracker created.
- [ ] Add backend setup guide.
- [ ] Add Flutter setup guide.
- [ ] Add `.env.example` files.
- [ ] Add API URL setup instructions.
- [ ] Add code-generation instructions.
- [ ] Add branch workflow instructions.
- [ ] Add demo-provider replacement guide.
- [ ] Add production SMS integration guide.
- [ ] Add production AI integration guide.
- [ ] Add market-price integration guide.
- [ ] Keep Swagger current.
- [ ] Add role and permission matrix.
- [ ] Add database/index documentation.

---

# 23. Deployment and Release

- [ ] Create development environment configuration.
- [ ] Create staging environment configuration.
- [ ] Create production environment configuration.
- [ ] Configure production MongoDB.
- [ ] Configure production file storage.
- [ ] Configure production SMS provider.
- [ ] Configure production notification provider.
- [ ] Configure production AI provider when available.
- [ ] Configure approved market-price source when available.
- [ ] Disable verbose Dio logs in production.
- [ ] Disable demo OTP exposure in production.
- [ ] Disable demo detection providers in production.
- [ ] Build signed Android application.
- [ ] Run release smoke tests.
- [ ] Prepare release notes.

---

# 24. Immediate Next Implementation Chunk

Do not begin later feature phases until this chunk is reviewed.

- [ ] Remove the accidental duplicate `farmer_app/` folder from `development`.
- [ ] Update `farmer/pubspec.yaml` with the complete supplied package list.
- [ ] Keep Flutter default fonts.
- [ ] Add `.env` and `.env.example` to `farmer/`.
- [ ] Configure GetIt.
- [ ] Configure secure storage and shared preferences.
- [ ] Configure Liverpool-style Dio.
- [ ] Configure AutoRoute with nested role shells.
- [ ] Create `UserRole`, `UserModel`, `AuthResponseModel`, login DTO, and registration DTO using Freezed.
- [ ] Run code generation.
- [ ] Commit and mark each completed task in this file.
