# Farmer Government Platform — Active Task Board

All active work is committed directly to `development`. Checked items mean source code is committed. Build, lint, generation, analyze, and test items remain unchecked until the commands pass.

## Repository

- [x] Active Flutter app: `farmer/`.
- [x] Active backend: `backend/`.
- [x] Active feature branch: `development`.
- [x] Stable branch: `main`.
- [ ] Delete extra branch names.
- [ ] Delete duplicate `farmer_app/`.
- [ ] Merge only after verification passes.

## Foundation

- [x] MongoDB, JWT, Swagger, validation, and environment setup.
- [x] Farmer, buyer, agent, medicine-seller, and admin roles.
- [x] Register, login, OTP verification, profile, and logout.
- [x] Access-token, role, approval, and listing-ownership guards.
- [x] Green Flutter theme, nested AutoRoute shell, secure session, Dio, cache, and toast setup.
- [x] Role-aware Home and third-tab workspaces.
- [ ] Backend build and ESLint pass.
- [ ] Flutter package install, generation, analyze, and tests pass.

## Authentication and Documents

- [x] Role-specific registration fields.
- [x] Public admin registration blocked.
- [x] PDF/JPG/PNG/WEBP registration-document upload.
- [x] Five-megabyte upload limit.
- [x] Flutter multipart upload client.
- [x] Registration stores backend document URLs.
- [x] Pending/rejected approval screen with refresh and logout.
- [x] Admin pending-user review, approve, and reject.
- [ ] Admin document-preview UI.
- [ ] Rejected-document correction and resubmission.
- [ ] Production object storage.

## Goods and Market Prices

- [x] Categories and searchable goods catalog.
- [x] Demo rice, potato, tomato, and onion.
- [x] Government, regional, current, and previous prices.
- [x] Daily difference, percentage, and trend calculation.
- [x] Latest-price and 30-day history APIs.
- [x] Green price UI with backend data, search, refresh, and states.
- [x] Role-targeted suggestion and notice backend.
- [x] Admin notice-publishing UI.
- [ ] Category-filter chips.
- [ ] Price-history detail chart/page.
- [ ] Replace temporary farmer tip with live guidance.

## Crop and Insect Diagnosis

- [x] Replaceable fixed demo provider.
- [x] Validated diagnosis image endpoint.
- [x] Demo insect, confidence, symptoms, risk, treatment, medicine, and safety response.
- [x] Flutter camera/gallery permission and image upload flow.
- [x] Diagnosis and treatment result UI.
- [x] Nearby in-stock seller search from suggested medicine.
- [ ] Typed Freezed diagnosis models.
- [ ] Upload-progress percentage.
- [ ] Production AI provider.

## Farmer Listings

- [x] Listing schema, statuses, ownership, quantities, prices, location, and audit fields.
- [x] Search, details, farmer history, cancellation, and ownership guard.
- [x] Atomic reservation to prevent overselling.
- [x] Green Flutter sell-goods form and listing history.
- [x] Camera-based demo goods identification with editable result.
- [ ] Listing image gallery upload.
- [ ] Draft edit/publish/cancel controls.
- [ ] Harvest date, grade, and map controls.

## Buyer Marketplace and Deals

- [x] Farmer-listing browser and search.
- [x] Buyer offer submission.
- [x] Counteroffers.
- [x] Buyer/farmer participant authorization.
- [x] Buyer and farmer accept/reject controls.
- [x] Dual confirmation and atomic reservation.
- [x] Confirmed deal record and history.
- [x] Buyer marketplace/deal workspace.
- [x] Farmer Offers & Deals workspace.
- [ ] Farmer contact action.
- [ ] Deal completion, cancellation, and dispute workflow.

## Agent Workflows

- [x] Hashed OTP action model, 10-minute expiry, and five-attempt limit.
- [x] Development-only demo OTP.
- [x] Farmer search.
- [x] OTP-assisted farmer creation.
- [x] OTP-assisted listing on behalf of farmer.
- [x] Farmer ownership plus assisting-agent audit field.
- [x] Agent Flutter create-farmer, delegated-post, OTP, and history workspace.
- [ ] Production SMS provider.
- [ ] OTP resend endpoint and countdown.
- [ ] Rich farmer selector instead of phone-only entry.

## Medicine Sellers

- [x] Medicine/pesticide/fertilizer catalog and demo products.
- [x] Seller shop/location update.
- [x] Inventory stock, unit, price, and shop fields.
- [x] Seller inventory upsert and history.
- [x] Radius-based nearby in-stock seller matching.
- [x] Nearest-first distance results.
- [x] Green seller location/inventory workspace.
- [x] Farmer nearby seller UI with stock, distance, and price.
- [ ] Device location and map picker.
- [ ] Catalog dropdown instead of manual code.
- [ ] Inventory edit/delete controls.

## Administration

- [x] Admin role dashboard and Admin tab.
- [x] Pending-user review and verification updates.
- [x] Suggestions/notices model and publishing form.
- [x] Protected goods, medicine, and market-price writes.
- [ ] Dedicated catalog/price management screens.
- [ ] Listing moderation and user suspension.
- [ ] Reports, disputes, and audit viewer.

## Notifications and Production

- [ ] Notification persistence and device registration.
- [ ] Offer, deal, OTP, approval, and delegated-action notifications.
- [ ] In-app notification list/read state.
- [ ] Production SMS, AI, and object-storage adapters.
- [ ] Login, OTP, upload, and public-search rate limits.
- [ ] Monitoring, backups, deployment, and rollback.

## Verification

- [x] Linux/macOS verification script.
- [x] Windows verification script.
- [x] Backend checks run before Flutter checks.
- [ ] Run a verification script.
- [ ] Fix every backend build/lint result.
- [ ] Generate and commit Freezed, JSON, and AutoRoute output.
- [ ] Fix every Flutter analyze/test result.
- [ ] Perform manual smoke tests for all five roles.

## Immediate Order

1. Run `scripts/verify-development.ps1` or `scripts/verify-development.sh`.
2. Fix all reported source and formatting errors.
3. Generate and commit all required Dart files.
4. Run role-by-role manual smoke tests.
5. Add notifications, production adapters, and moderation.
6. Remove duplicate repository content and extra branches.
