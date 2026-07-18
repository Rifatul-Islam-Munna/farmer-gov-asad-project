# AgriVision AI Ã¢â‚¬â€ Completion Audit

> This checklist records what is currently present in the repository and what remains to be implemented.
>
> Current execution scope: sections 1â€“6 only. Sections 7 and later are deferred roadmap/audit items and are not part of the current completion gate.
>
> Status meanings:
>
> - `[x]` = verified present in the repository.
> - `[~]` = partially implemented, demo-only, UI-only, or not fully validated.
> - `[ ]` = not verified/implemented.
> - `[!]` = blocked, unsafe, or requires a product/technical decision.
>
> Last audit: 2026-07-17
>
> Audited repository: `D:\custom-coding\project-gov-farmer`

---

## 1. Repository and Technology Baseline

- [x] Flutter mobile project exists at `farmer/`.
- [x] NestJS backend exists at `backend/`.
- [x] Next.js web/admin project exists at `frontend/`.
- [x] Git repository exists.
- [x] Backend uses NestJS 11.
- [x] Backend uses PostgreSQL through TypeORM and `pg`.
- [x] Backend includes Qdrant JavaScript client dependency.
- [x] Backend includes BullMQ dependencies.
- [x] Backend includes S3 SDK dependency.
- [x] Backend includes Sharp dependency.
- [x] Frontend uses Next.js 16 and React 19.
- [x] Flutter includes Dio, secure storage, AutoRoute, OneSignal, image picker, location, QR, and Stripe packages.
- [x] Root Docker Compose exists for PostgreSQL, Redis, Qdrant, and MinIO object storage.
- [x] Root PowerShell start/stop workflow and local-development documentation exist for all applications.
- [x] Unified GitHub Actions CI workflow exists for backend, frontend, and Flutter.
- [x] Production deployment baseline documentation exists.

Evidence:

- `backend/package.json`
- `frontend/package.json`
- `farmer/pubspec.yaml`
- `docker-compose.yml`
- `scripts/start-all.ps1`
- `scripts/stop-all.ps1`
- `.github/workflows/ci.yml`
- `docs/local-development.md`
- `docs/deployment.md`

Verification:

- [x] Docker Compose configuration parsed successfully.
- [x] PowerShell start/stop scripts parsed successfully.
- [x] Backend lint, build and tests passed during the section 1â€“6 re-audit.
- [x] Next.js lint and production build passed during the section 1â€“6 re-audit.
- [x] Flutter analyze and tests passed during the section 1â€“6 re-audit.

---

## 2. Current Git Working Tree

Audit completed on 2026-07-17 before continuing feature development.

- [x] Existing Flutter routing and auth-guard work reviewed.
- [x] Existing admin workspace UI reviewed.
- [x] Existing agent-assist UI reviewed.
- [x] Existing login and splash UI reviewed.
- [x] Existing diagnosis scanner/result UI reviewed without claiming the production AI scanner is complete.
- [x] Existing alerts and home UI reviewed.
- [x] Existing marketplace, sell and buyer UI reviewed.
- [x] Existing medicine-seller UI reviewed.
- [x] Existing plants UI reviewed.
- [x] Existing main shell and application bootstrap reviewed.
- [x] AutoRoute configuration and generated `app_router.gr.dart` verified.
- [x] Flutter Dio, toast, cached query and mutation foundations verified.
- [x] Next.js dashboard route structure reviewed.
- [x] Repository status checked before new edits; the only pre-existing local change was `features.md` documentation.
- [x] Existing user work was not discarded or overwritten.
- [x] Flutter analyze passed after the review.
- [x] Flutter tests passed after the review.
- [x] Next.js lint passed after the review.
- [x] Next.js production build passed after the review.

New intentional UI work from this audit:

- [x] Flutter home now includes a role-specific command card using role title, description, icon and safety/usage tip.
- [x] Next.js role dashboard placeholders were replaced with responsive glass workspaces.
- [x] Farmer dashboard workspace UI added.
- [x] Buyer dashboard workspace UI added.
- [x] Wholesale-buyer dashboard workspace UI added.
- [x] General seller dashboard workspace UI added.
- [x] Machinery-seller dashboard workspace UI added.
- [x] Medicine-seller dashboard workspace UI added.
- [x] Agent dashboard workspace UI added.
- [x] Agriculture-specialist dashboard workspace UI added.
- [x] Veterinary-doctor dashboard workspace UI added.
- [x] Government-officer dashboard workspace UI added.
- [x] Support dashboard workspace UI added.

Evidence:

- `farmer/lib/core/router/app_router.dart`
- `farmer/lib/core/router/app_router.gr.dart`
- `farmer/lib/core/router/auth_guard.dart`
- `farmer/lib/features/home/presentation/pages/home_page.dart`
- `farmer/lib/pages/main_shell.dart`
- `frontend/app/dashboard/[role]/page.tsx`
- `frontend/components/dashboard/role-workspace.tsx`

Checkpoint rule:

- [x] All current modifications are intentional and documented in `features.md` before any future feature phase begins.
- [x] Current work is safely checkpointed through reviewed Git diff, passing validation, and matching `done.md`/`features.md`; no automatic commit was created without owner approval.

---

## 3. Backend Foundation

### Application setup

- [x] NestJS application entry point exists.
- [x] Root application module exists.
- [x] Swagger dependency and `/docs` UI exist.
- [x] Config module is global.
- [x] Global validation pipe uses transform, whitelist and forbid-non-whitelisted.
- [x] CORS allowlist is environment-specific through `CORS_ORIGINS`.
- [x] Request ID middleware accepts or generates `x-request-id`.
- [x] Request ID is returned in response headers and response bodies.
- [x] Successful responses use a standardized `success`, `requestId` and `timestamp` envelope without removing existing response fields.
- [x] Errors use a standardized global exception envelope.
- [x] PostgreSQL unique and foreign-key errors are normalized.
- [x] Provider secrets are not written to request logs or returned unmasked.
- [x] Liveness endpoint exists at `GET /health/live`.
- [x] Readiness endpoint exists at `GET /health/ready`.
- [x] Readiness reports PostgreSQL, Redis, Qdrant and object-storage status.
- [x] PostgreSQL is treated as required.
- [x] Redis, Qdrant and MinIO are treated as optional/degraded dependencies.
- [x] Helmet, compression, cookie parsing and body-size limits are configured.

### Database

- [x] PostgreSQL/TypeORM integration exists.
- [x] TypeORM entities use UUID primary keys and timestamps.
- [x] Shared base entity now includes `deletedAt` for soft-delete support.
- [x] Existing entities include unique and composite indexes for current query paths.
- [x] Index-audit rules are documented.
- [x] Development auto-sync is enabled only outside production.
- [x] Production migration/versioning strategy is documented.
- [x] Idempotent seed command exists: `npm run seed`.
- [x] Seed command initializes configured admin and starter catalog/reference data.
- [x] PostgreSQL backup guidance is documented.
- [x] PostgreSQL restore-test guidance is documented.
- [x] Backup validity requires a successful restore test.

Evidence:

- `backend/src/lib/database/base.entity.ts`
- `backend/src/lib/database/database.module.ts`
- `backend/src/scripts/seed.ts`
- `backend/docs/database-operations.md`
- `backend/package.json`

### Queue and caching

- [x] BullMQ dependencies exist.
- [x] Redis client dependency exists.
- [x] Global resilient queue module exists.
- [x] Queue connection is created only when a job is actually added.
- [x] Redis/queue failure returns a controlled non-queued result instead of stopping the API.
- [x] Default queue attempts use exponential backoff.
- [x] Completed and failed job retention limits are configured.
- [x] Job options accept caller-provided `jobId` for idempotent job design.
- [x] Queue errors are logged without exposing Redis credentials.

Remaining queue work:

- [x] AI, notification, media and report workers persist idempotent job records and perform their connected domain updates inside database transactions.
- [x] Real persisted business processing exists for image-profile media batches, image-profile re-index metadata, alert delivery state, and generated report records.
- [x] Per-worker heartbeat and Prometheus metrics exist.
- [x] Explicit dead-letter queues exist for exhausted jobs/manual review.
- [x] A BullMQ integration test runs against a real Redis instance when `TEST_REDIS_URL` is configured; it passed against the local Redis container on July 17, 2026.

Evidence:

- `backend/src/lib/queue/queue.module.ts`
- `backend/src/lib/queue/resilient-queue.service.ts`

### Object storage

- [x] AWS S3-compatible MinIO client exists.
- [x] Storage module is global.
- [x] Backend upload flow exists.
- [x] Presigned upload URL helper exists.
- [x] Signed private read URL helper exists.
- [x] Image upload helper strips original metadata through re-encoding.
- [x] Image upload helper creates a WebP thumbnail.
- [x] Multi-object deletion helper supports synchronized original/thumbnail cleanup.
- [x] Missing MinIO configuration does not stop backend startup.
- [x] Storage status is included in readiness output.

Remaining storage work:

- [x] Authenticated upload and presign endpoints exist for profile, listing, moderation, CMS, advertisement, support, report and image-profile features.
- [x] MIME sniffing, declared-versus-detected MIME validation and upload-size policy exist per supported feature.
- [x] Real MinIO integration test uploads, reads and deletes an object against a configured live MinIO instance; it passed against the local Docker container on July 17, 2026.
- [x] PostgreSQL object-deletion outbox coordinates committed database changes with retryable MinIO deletion, exponential backoff, terminal failure state and migration support.

Evidence:

- `backend/src/lib/storage/minio.service.ts`
- `backend/src/lib/storage/storage.module.ts`

### Verification

- [x] `npm run lint` passed.
- [x] `npm run build` passed.
- [x] `npm test -- --runInBand` passed.
- [x] `npm run seed` passed.
- [x] `GET /health/live` returned HTTP 200.
- [x] `GET /health/ready` returned HTTP 200.
- [x] Custom `x-request-id` was echoed in the response header/body.
- [x] Root success response contained `success: true`.
- [x] Unauthorized response contained `success: false` and the same request ID.

---
## 4. Authentication, Users, and Roles

### Authentication lifecycle

- [x] Public registration endpoint exists at `POST /user`.
- [x] Login endpoint exists at `POST /user/login-user`.
- [x] Registration and login return both `access_token` and `refresh_token`.
- [x] Refresh-token rotation endpoint exists at `POST /user/refresh-token`.
- [x] Refresh sessions are stored server-side in PostgreSQL.
- [x] Only a SHA-256 hash of each refresh token is stored.
- [x] Refresh tokens have unique token/session IDs.
- [x] Rotating a refresh token revokes the previous session.
- [x] Reusing an old refresh token returns HTTP 401.
- [x] Logout revokes all active refresh sessions for the user.
- [x] Logout increments `tokenVersion`, invalidating existing access tokens immediately.
- [x] Access-token verification checks the current user record, account status and token version.
- [x] Refresh token secret and access/refresh expiry settings are documented in `.env.example`.
- [x] Login and logout events are written to audit logs.

Evidence:

- `backend/src/auth/entities/auth-session.entity.ts`
- `backend/src/user/user.service.ts`
- `backend/src/user/user.controller.ts`
- `backend/.env.example`

### Canonical roles and multi-role accounts

- [x] Canonical user roles are defined:
  - [x] FARMER
  - [x] WHOLESALE_BUYER
  - [x] BUYER
  - [x] STUDENT_VOLUNTEER
  - [x] AGENT
  - [x] AGRICULTURE_SPECIALIST
  - [x] VETERINARY_DOCTOR
  - [x] SELLER
  - [x] MACHINERY_SELLER
  - [x] MEDICINE_SELLER
  - [x] PUBLIC_USER
  - [x] GOVERNMENT_OFFICER
  - [x] SUPPORT
  - [x] ADMIN
  - [x] SUPER_ADMIN
- [x] Existing single `role` field remains for backward-compatible active workspace behavior.
- [x] New `roles[]` field stores all approved roles.
- [x] Roles guard accepts any approved role in `roles[]`.
- [x] Admin can replace approved roles using `PATCH /admin/users/:id/roles`.
- [x] User can request active-role change using `PATCH /user/active-role`.
- [x] Active-role change is limited to already approved roles.
- [x] Role changes revoke existing sessions and require sign-in again.
- [x] Role changes are written to audit logs.

### Verification and account status

- [x] Verification status remains separate from role.
- [x] Admin verification endpoint exists at `PATCH /admin/users/:id/verification`.
- [x] Verification changes revoke existing sessions.
- [x] Verification changes are written to audit logs.
- [x] Account status supports `active`, `suspended` and `deleted`.
- [x] Admin account-status endpoint exists at `PATCH /admin/users/:id/account-status`.
- [x] Suspended users cannot log in.
- [x] Suspended/deleted users cannot use previously issued access tokens.
- [x] Deleted account status uses the soft-delete timestamp.
- [x] Account status changes revoke sessions and are audited.

### Authorization and audit

- [x] Access-token guard exists and validates live account state.
- [x] Roles decorator exists.
- [x] Multi-role roles guard exists.
- [x] Verified-account guard exists.
- [x] Sensitive admin endpoints use authentication, verification and role guards.
- [x] Audit-log PostgreSQL entity exists.
- [x] Audit service exists.
- [x] Audit records include actor, action, target entity, before/after values and metadata.
- [x] Admin audit-log endpoint exists at `GET /admin/audit-logs`.
- [x] Audit-log endpoint is protected by admin/super-admin roles.

Evidence:

- `backend/src/audit/entities/audit-log.entity.ts`
- `backend/src/audit/audit.service.ts`
- `backend/src/audit/audit.module.ts`
- `backend/src/auth/roles.guard.ts`
- `backend/src/admin/admin.controller.ts`

### Next.js administration UI

- [x] Admin users page displays verification status.
- [x] Admin users page displays account status.
- [x] Admin users page displays all approved roles.
- [x] Active role is visually identified.
- [x] Admin can approve/reject/pending verification from the dashboard.
- [x] Admin can activate, suspend or soft-delete accounts from the dashboard.
- [x] Admin can add/remove multiple roles using role checkboxes.
- [x] UI uses dedicated roles, verification and account-status endpoints.
- [x] Responsive access-management card layout replaces the previous narrow single-role table.

Evidence:

- `frontend/components/admin/admin-resource-panels.tsx`
- `frontend/lib/admin-api.ts`

### Flutter compatibility

- [x] Existing Flutter login remains compatible because `access_token` and `user` are still returned.
- [x] Flutter auth guard and login code compile after the backend response expansion.
- [x] Flutter role-aware home content compiles with existing active `role` value.
- [x] Flutter analyze passes.
- [x] Flutter tests pass.

### Live verification

- [x] Registration returned access and refresh tokens.
- [x] Protected profile request succeeded with access token.
- [x] Refresh token rotated successfully.
- [x] Old refresh token was rejected with HTTP 401.
- [x] Logout revoked current access token with HTTP 401 on reuse.
- [x] Admin assigned `farmer` and `buyer` roles to one account.
- [x] Admin suspended the account.
- [x] Suspended login was rejected with HTTP 403.
- [x] Admin reactivated the test account.
- [x] Audit endpoint returned authentication, role and status events.
- [x] Backend lint passed.
- [x] Backend build passed.
- [x] Backend tests passed.
- [x] Next.js lint passed.
- [x] Next.js production build passed.
- [x] Flutter analyze and tests passed.

### Remaining authentication work

- [x] Expiring phone OTP workflow exists with configurable SMS provider URL and API key; development may skip delivery and expose the code when explicitly enabled.
- [x] OTP daily limit, maximum attempts and resend cooldown are enforced.
- [x] Password-reset request and confirmation flow exists and revokes prior sessions through token-version increment.
- [x] Flutter automatically refreshes access tokens and retries authenticated requests.
- [x] Next.js uses secure HTTP-only cookie sessions with server-side refresh rotation.
- [x] Active-role switching UI exists in Flutter and Next.js.
- [x] Specialist and veterinary credential document-review workflow exists.
- [x] Seller and machinery-seller professional document review and business verification workflow exists.
- [x] Audited support impersonation exists behind `SUPPORT_IMPERSONATION_ENABLED=false` by default, issues only a 15-minute access token, requires an explicit reason, blocks administrative targets and creates an audit event.
- [x] Supertest E2E coverage validates missing, invalid, expired and revoked tokens; bearer and legacy headers; verification enforcement; denied and allowed roles; multi-role authorization; and support-mode privilege isolation.
- [x] Audit-log viewer UI includes filters, pagination and export.

---
## 5. Admin Panel

### Core admin access

- [x] Backend admin module exists.
- [x] Admin controller and service exist.
- [x] Admin-only RBAC is enforced for sensitive endpoints.
- [x] Next.js admin dashboard exists at `/dashboard/admin`.
- [x] Flutter admin workspace exists.
- [x] Admin login works with configured admin credentials.
- [x] Admin user-management UI supports verification, account status and multiple roles.
- [x] Admin dashboard uses responsive glass UI on desktop, tablet and mobile widths.

### Dashboard overview and analytics

- [x] Admin overview component exists.
- [x] Dashboard metrics include users, pending users, listings, active listings, deals, deal volume and inventory items.
- [x] User distribution by role is available.
- [x] Monthly listing/deal activity trend is available.
- [x] Recent deals and recent listings are available.
- [x] Flutter admin workspace displays users, pending reviews, listings and deals summary metrics.
- [~] Analytics are operational summaries only; advanced exportable reports remain incomplete.

### User, farmer and professional-account management

- [x] User list and search exist.
- [x] Pending account list exists.
- [x] Verification approval/rejection exists.
- [x] Multi-role assignment exists.
- [x] Account activate/suspend/soft-delete exists.
- [x] Session revocation occurs after sensitive account changes.
- [x] Changes are written to audit logs.
- [x] Specialist, veterinary and seller approvals use document-by-document professional review records.
- [x] Document-by-document credential review with reviewer notes exists.
- [x] Business-license and seller-onboarding review checklist exists.

### Marketplace and inventory administration

- [x] Listing management panel exists.
- [x] Admin can change listing status.
- [x] Deal oversight panel exists.
- [x] Admin can change deal status.
- [x] Offer listing endpoint exists for admin review.
- [x] Goods and category data are available in admin controls.
- [x] Market-price management exists.
- [x] Seller inventory management exists.
- [x] Admin can update inventory stock, price and active status.
- [x] Marketplace moderation now persists status, required reasons, evidence URLs, reviewer identity, timestamps, appeal state, internal audit notes and append-only moderation history.
- [x] Moderation reasons, reviewer identity, appeal state, evidence and audit notes are implemented in the API, database migration and admin UI.
- [x] Generalized machinery/input product management is implemented through the shared marketplace product model, seller creation/listing flows, machinery-specific fields, restricted-license controls and admin moderation oversight.
- [x] Order, payment, refund and delivery oversight is implemented with admin order/tracking controls plus read-only payment and refund operational views.

### AI and provider administration

- [x] AI & providers section exists in Next.js.
- [x] Multiple Gemini keys can be submitted.
- [x] Gemini text and vision model fields exist.
- [x] Qdrant image-embedding provider/model fields exist.
- [x] Windy and OneSignal fields exist.
- [x] Provider secrets are encrypted in PostgreSQL.
- [x] Provider secrets are masked when read.
- [x] Per-key health, last success, quota errors, cooldown timestamps, last test time, last error and usage/test counters are persisted and shown in the admin UI.
- [x] Gemini keys have independent enable/disable and numeric priority controls in the Next.js admin panel and encrypted backend settings.
- [x] Next.js provider test buttons call authenticated server-side Gemini, Windy and OneSignal validation endpoints without exposing stored secrets.

### System health and audit

- [x] Next.js **System & audit** section exists.
- [x] PostgreSQL health status is displayed.
- [x] Redis health status is displayed.
- [x] Qdrant health status is displayed.
- [x] MinIO/object-storage health status is displayed.
- [x] Required versus optional dependencies are labeled.
- [x] Degraded optional dependency state is visually distinct.
- [x] Recent audit events are displayed in Next.js.
- [x] Audit entries show action, entity, actor, target, time and before/after values.
- [x] Flutter admin workspace displays dependency health.
- [x] Flutter admin workspace displays recent audit activity.
- [x] Flutter admin workspace supports pull-to-refresh.
- [x] Audit filters, pagination and export exist.
- [ ] Add Prometheus metrics and historical uptime charts.

Evidence:

- `frontend/components/admin/admin-system-panel.tsx`
- `frontend/components/admin/admin-dashboard.tsx`
- `frontend/components/admin/admin-resource-panels.tsx`
- `farmer/lib/features/admin/data/admin_api.dart`
- `farmer/lib/features/admin/presentation/admin_workspace.dart`
- `backend/src/admin/`
- `backend/src/audit/`
- `backend/src/lib/health/`

### Guidance and communications

- [x] Admin guidance/notice publishing endpoint exists.
- [x] Flutter admin workspace includes a notice composer.
- [x] Notice target-role selection exists.
- [x] Empty title/message validation exists in Flutter UI.
- [x] Success/error toast feedback exists.
- [x] Add Next.js notice/CMS management UI.
- [x] Add notice scheduling, drafts, expiration and attachment support.
- [x] Add advertisements module and administration UI.
- [x] Add support-ticket module and admin queue.

### Image-profile administration

- [x] Image-profile creation UI.
- [x] 10â€“500 file bulk uploader.
- [x] Upload progress and failed-file retry.
- [x] Duplicate reporting.
- [x] Quality review.
- [x] Activation/archive/re-index controls.
- [~] Re-index controls exist; broader Qdrant profile evaluation/health scoring remains incomplete.

### Secure web session status

- [x] Next.js admin authentication uses a server-managed cookie session and backend authorization.
- [x] Admin access and refresh tokens are not stored in browser local storage.
- [x] Admin session uses secure HTTP-only cookies.
- [x] CSRF protection exists for cookie-authenticated mutations.
- [x] Automatic refresh-token rotation exists in the Next.js server layer.
- [x] Protected admin routes enforce middleware/server-side authorization before rendering.

### Verification

- [x] Next.js lint passed.
- [x] Next.js production build passed.
- [x] Flutter analyze passed with no issues.
- [x] Flutter tests passed.
- [x] Existing backend admin/audit/health endpoints were previously live-tested.

---
## 6. Marketplace and E-Commerce

### Canonical marketplace listing model

- [x] Backend listing module exists.
- [x] Listing controller, service, entity, DTO and owner guard exist.
- [x] PostgreSQL listing entity supports canonical marketplace categories.
- [x] Supported categories include agricultural output, livestock, poultry, fisheries, machinery, machinery parts, seed, fertilizer, pesticide, feed, medicine, equipment rental and service.
- [x] Listing transaction type supports sale, rental and service.
- [x] Listing supports description, grade, delivery availability and negotiable flag.
- [x] Listing still supports quantity, unit, harvest date, location, government price, market price and minimum price.
- [x] Existing crop listings remain backward compatible through default category and transaction type.
- [x] Listing owner authorization exists for cancellation.
- [x] Admin and super-admin may manage listings.
- [x] PostgreSQL reservation uses a pessimistic transaction lock.

### Search, filters, sorting and pagination

- [x] Public marketplace search is API-backed.
- [x] Search supports free text across product name, code, description and address.
- [x] Category filter exists.
- [x] Transaction-type filter exists.
- [x] Address/location filter exists.
- [x] Grade filter exists.
- [x] Minimum and maximum price filters exist.
- [x] Minimum available quantity filter exists.
- [x] Delivery-available filter exists.
- [x] Negotiable-only filter exists.
- [x] Harvest-date range filters exist.
- [x] Sorting supports newest, price low-to-high, price high-to-low and available quantity.
- [x] Stable pagination exists with page, page size, total, total pages and next-page state.
- [x] Maximum page size is limited to 50.
- [x] Previous unbounded `take(100)` listing search was removed.

### Flutter buyer marketplace

- [x] Hard-coded storefront demo products were removed from the main marketplace page.
- [x] Marketplace page now uses real backend listings.
- [x] Marketplace page still shows live backend market prices.
- [x] Buyer search field uses backend search.
- [x] Buyer filter sheet supports category, location, price range, quantity, delivery and negotiable filters.
- [x] Buyer can sort results.
- [x] Buyer can navigate previous/next pages.
- [x] Listing cards show category, price, grade, delivery and negotiable tags.
- [x] Buyer offer action remains connected to `POST /offers`.
- [x] Offer success/error uses global app toasts.

Evidence:

- `farmer/lib/features/marketplace/presentation/pages/marketplace_page.dart`
- `farmer/lib/features/marketplace/presentation/widgets/buyer_listing_browser.dart`
- `farmer/lib/features/marketplace/data/datasources/marketplace_api.dart`
- `farmer/lib/features/marketplace/data/models/listing.model.dart`

### Flutter seller listing flow

- [x] Seller/farmer listing form is API-backed.
- [x] Seller can choose marketplace category.
- [x] Seller can enter description.
- [x] Seller can enter grade/quality.
- [x] Seller can mark delivery availability.
- [x] Seller can mark price negotiability.
- [x] Existing quantity and price validation remains.
- [x] My listings remains API-backed.
- [x] Existing image-based goods detection helper remains available.

### Negotiation and deal foundation

- [x] Offer creation exists.
- [x] Offer countering exists.
- [x] Offer acceptance exists.
- [x] Offer rejection exists.
- [x] Buyer/farmer offer authorization exists.
- [x] Deal creation and stock reservation foundation exist.
- [x] Buyer and seller deal panels exist in Flutter.
- [x] Admin deal oversight exists.

### Medicine/input seller foundation

- [x] Medicine/product catalog exists.
- [x] Seller inventory exists.
- [x] Nearby seller search exists.
- [x] Seller location update exists.
- [x] Flutter seller inventory workspace exists.
- [x] Flutter nearby-seller panels exist.
- [x] Medicine inventory is unified with the generalized marketplace product catalog while preserving medicine-specific catalog, seller, location, unit, and nearby-search behavior.

### Live verification

- [x] Created a PostgreSQL-backed machinery listing.
- [x] Listing returned canonical category `machinery`.
- [x] Delivery and negotiable fields were stored.
- [x] Category filter returned the machinery listing.
- [x] Delivery filter returned the listing.
- [x] Minimum quantity filter returned the listing.
- [x] Price-range filter returned the listing.
- [x] Pagination metadata returned page, page size, total, total pages and next-page state.
- [x] Backend lint passed.
- [x] Backend build passed.
- [x] Backend tests passed.
- [x] Flutter analyze passed.
- [x] Flutter tests passed.

### Remaining marketplace work

- [x] Separate generalized `MarketplaceProduct` domain exists apart from farmer-output `Listing`, with production migration, Flutter seller UI, public Next.js buyer UI, admin moderation UI, tests and practical instructions.
- [x] Generalized products include machinery specifications JSONB plus indexed brand, model, year and horsepower fields, seller UI, migration and validation.
- [x] Rental date-range UI and backend conflict detection reject overlapping pending/confirmed machinery bookings; focused tests and instructions exist.
- [x] Bulk purchase requests support buyer creation, seller offers, sorted offer comparison, transaction-safe buyer selection, rejected competing offers, Flutter workflow, admin oversight, migration and focused tests.
- [x] Auction/bid persistence, mobile bidding UI, transactional highest-bid enforcement and scheduled auction closeout-to-order processing exist.
- [x] Authenticated realtime buyer-seller chat uses Socket.IO with temporary Redis history for one hour, no PostgreSQL writes, a strict 60-second per-sender cooldown, reconnect history loading, and Flutter countdown UI. Legacy persisted message REST routes are disabled.
- [x] Bangla voice capture exists in Flutter and supported Next.js browsers, with normalized marketplace transcript search and typed fallback.
- [x] Deterministic catalog-only recommendation endpoint now tokenizes multilingual product/query text, ranks published database products with explainable content/popularity/availability/recency signals, reports evaluation metadata, and never invents catalog items. Vector/LLM fallback is intentionally not required for the current low-AI mode.
- [x] Saved-search and favorite persistence/APIs include list/toggle/delete flows, polished Next.js and Flutter saved-marketplace UI, apply/remove/delete actions, and dedicated Flutter widget tests covering favorites and saved searches.
- [x] Persistent cart with stock validation exists in the backend and public Next.js/Flutter buyer flows.
- [x] Transactional checkout creates orders, locks/decrements stock, clears cart, has buyer UI, migration, tests and no wallet dependency.
- [x] Stripe is disabled from the active marketplace checkout. Orders are created gateway-neutral with `unpaid` status, and the web UI explains that bKash or another provider can be connected later. Existing Stripe backend code remains dormant for future reference and is not called by checkout.
- [x] Order status and tracking updates exist with Next.js admin operations UI and customer order persistence; payment state remains gateway-controlled.
- [x] Backend `pdfkit` invoice generation streams persisted order PDFs, with direct invoice links in Next.js buyer/admin views and signed five-minute mobile links in Flutter buyer orders.
- [x] Delivered-order-only reviews include average/count/star distribution, buyer review UI, Next.js admin hide/publish moderation, persistence and focused tests.
- [x] Provider-neutral background-removal adapter runs through the persisted media worker, records provider/output/error state, and has Flutter seller preview/apply/reject UI.
- [x] Provider-backed listing-description generation runs through the persisted AI worker with model/provider metadata, failure history, seller preview/apply/reject UI and focused tests.
- [x] Price guidance combines active peer-price median/range with delivered-order monthly demand and revenue, returns seasonal demand bands/best months, and is shown in Flutter seller UI.
- [x] Product moderation reasons, reviewer identity, restricted/license controls and seller appeals have persistence, APIs, Flutter seller fields, Next.js admin UI and tests.
- [x] Popular marketplace searches use 60-second Redis caching with graceful fallback, invalidation and a real Redis integration test.
- [x] PostgreSQL full-text matching, GIN migration index, Haversine distance filtering/sorting and Redis cache integration exist and passed live smoke validation.
- [x] Checkout creates external-payment-ready orders and introduces no internal wallet dependency.

---
# Deferred Roadmap Audit â€” Not in Current Sections 1â€“6 Completion Gate

The sections below are retained for future planning and audit visibility. Their unchecked items are not current blockers while implementation is limited to sections 1â€“6.

## 7. Market Price Intelligence

### Existing

- [x] Market price controller/service/entity/DTO exist.
- [~] Flutter market price data source/models exist.

### Remaining

- [ ] verify real data source.
- [ ] district/upazila price support.
- [ ] source timestamp/provenance.
- [ ] trend history.
- [ ] admin correction workflow.
- [ ] sell-now/wait advisory.
- [ ] confidence/source display.
- [ ] charts in mobile and admin.

---

## 8. Crop Disease Detection and AI Diagnosis

### Existing

- [x] Detection module/controller exists.
- [x] `demo-detection.service.ts` exists.
- [~] Flutter scanner page exists.
- [~] Flutter diagnosis result card exists.
- [~] Flutter diagnosis data layer exists.

Evidence:

- `backend/src/detection/`
- `farmer/lib/features/diagnosis/`

Current assessment:

- [~] Detection is likely demo-oriented because the service is explicitly named `demo-detection.service.ts`.
- [ ] Production AI provider integration is not verified.
- [ ] Qdrant matching is not verified.
- [ ] structured diagnosis schema is not verified.

Remaining:

- [ ] Gemini provider gateway.
- [ ] image upload/storage pipeline.
- [ ] crop type/context input.
- [ ] likely disease/condition.
- [ ] possible cause.
- [ ] severity low/medium/high.
- [ ] organic remedy.
- [ ] chemical remedy.
- [ ] medicine/product suggestions with safety controls.
- [ ] prevention.
- [ ] specialist escalation.
- [ ] generated-content disclaimer.
- [ ] provider/model/version audit.
- [ ] schema validation for AI output.
- [ ] rate limiting and usage tracking.

---

## 9. AI Gateway and Gemini Multi-Key Pool

### Existing

- [ ] No verified provider-neutral AI module.
- [ ] No verified Gemini provider implementation.
- [ ] No verified 5Ã¢â‚¬â€œ10 key rotation pool.
- [ ] No verified OpenAI/custom provider adapter contract.

Implementation checklist:

- [ ] Create `backend/src/ai/` module.
- [ ] Define text, vision, image-embedding, and text-embedding interfaces.
- [ ] Implement Gemini provider.
- [ ] Configure `GEMINI_API_KEYS` as comma-separated secret list.
- [ ] Validate at least one key at startup.
- [ ] Alias keys in logs rather than exposing them.
- [ ] weighted round-robin/least-recently-used routing.
- [ ] per-key health state.
- [ ] quota/rate-limit classification.
- [ ] cooldown and circuit breaker.
- [ ] exponential backoff with jitter.
- [ ] bounded retry count.
- [ ] timeout and cancellation.
- [ ] usage/latency/error metrics.
- [ ] structured output validation.
- [ ] prompt versioning.
- [ ] admin health endpoint with no secrets.
- [ ] placeholder `OpenAiProvider` adapter.
- [ ] placeholder `CustomHttpProvider` adapter.
- [ ] provider selection by configuration.
- [ ] unit and contract tests.

Acceptance evidence required:

- file paths
- example masked health output
- tests proving key rotation after simulated quota failure
- tests proving permanent 4xx errors are not retried across all keys

---

## 10. Qdrant Image Profile Service

### Dependency baseline

- [x] `@qdrant/js-client-rest` dependency exists.
- [ ] Qdrant module/service implementation verified.
- [ ] Qdrant environment variables documented.
- [ ] collection bootstrap script.

### Profile management

- [ ] `ImageProfile` PostgreSQL entity/schema.
- [ ] `ImageProfileAsset` schema.
- [ ] profile create/update/archive endpoints.
- [ ] domain/category/canonical label fields.
- [ ] model/version fields.
- [ ] configurable match thresholds.
- [ ] profile state machine: draft/processing/active/archived.
- [ ] admin permissions.

### 10Ã¢â‚¬â€œ500 image bulk upload

- [ ] Next.js multi-file uploader.
- [ ] file count validation (10 minimum for activation, 500 maximum per profile operation).
- [ ] upload chunking (10Ã¢â‚¬â€œ25 recommended).
- [ ] per-file progress.
- [ ] cancel/retry failed files.
- [ ] duplicate reporting.
- [ ] presigned upload flow.
- [ ] completion confirmation.
- [ ] BullMQ ingestion jobs.
- [ ] WebSocket/polling progress.

### Image processing

- [ ] actual MIME validation.
- [ ] corrupt-image detection.
- [ ] orientation correction.
- [ ] EXIF removal.
- [ ] normalized image generation.
- [ ] thumbnail generation.
- [ ] checksum.
- [ ] perceptual duplicate detection.
- [ ] quality score.
- [ ] rejection reason.

### Embeddings and Qdrant

- [ ] embedding provider contract.
- [ ] selected image embedding model documented.
- [ ] vector size read from configuration/model.
- [ ] sample collection.
- [ ] profile-centroid collection.
- [ ] payload indexes.
- [ ] idempotent point upsert.
- [ ] model-version filtering.
- [ ] normalized centroid calculation.
- [ ] profile activation quality gate.
- [ ] rebuild/reindex command.
- [ ] deletion synchronization.
- [ ] snapshots/backups.

### Search and confidence

- [ ] query image normalization.
- [ ] same active embedding model used.
- [ ] centroid search.
- [ ] supporting sample search.
- [ ] multi-image score aggregation.
- [ ] configurable top-K.
- [ ] threshold policy.
- [ ] unknown rejection.
- [ ] top alternatives.
- [ ] calibrated confidence display.
- [ ] never expose raw cosine score as probability.
- [ ] evaluation dataset.
- [ ] top-1/top-3/false-positive/unknown-rejection metrics.
- [ ] per-profile threshold tuning.

Suggested initial output behavior pending evaluation:

- [ ] `>= 0.85` high-confidence likely match.
- [ ] `0.70Ã¢â‚¬â€œ0.8499` possible match; request more images/show alternatives.
- [ ] `< 0.70` unknown/insufficient confidence.

These thresholds are not considered complete until measured on labeled data.

---

## 11. Digital Farm Profile

- [ ] Farm profile schema.
- [ ] crop area.
- [ ] cow count.
- [ ] goat count.
- [ ] chicken/duck count.
- [ ] fish pond count/details.
- [ ] income records.
- [ ] expense records.
- [ ] calculated profit.
- [ ] farm health score.
- [ ] combined AI farm analysis.
- [ ] upcoming action summary.
- [ ] Flutter dashboard.
- [ ] admin view.

Explicit exclusion:

- [x] Carbon footprint is excluded with the Future AI Features scope.

---

## 12. Crop Farming Module

### Existing UI indication

- [~] Plants page exists.
- [~] Home dashboard UI exists.

### Remaining

- [ ] crop cycle CRUD.
- [ ] crop type/variety.
- [ ] plot/area.
- [ ] planting date.
- [ ] growth stage.
- [ ] crop health score.
- [ ] water level/status.
- [ ] soil moisture manual/API data.
- [ ] fertilizer status.
- [ ] pest risk.
- [ ] disease risk.
- [ ] harvest readiness.
- [ ] irrigation recommendation.
- [ ] fertilizer recommendation.
- [ ] pest action plan.
- [ ] harvest prediction.
- [ ] yield tracking/estimation.
- [ ] reminders and calendar.
- [ ] farm report/graph.

---

## 13. Weather Intelligence

- [ ] Weather provider adapter.
- [ ] real-time weather endpoint.
- [ ] forecast endpoint.
- [ ] heavy rain alert.
- [ ] lightning alert.
- [ ] cyclone/storm alert.
- [ ] flood/river rise alert.
- [ ] hail alert.
- [ ] extreme heat/cold alert.
- [ ] drought alert.
- [ ] wind speed.
- [ ] humidity.
- [ ] source timestamp.
- [ ] location-aware caching.
- [ ] provider fallback.
- [ ] farm-action advice linked to alert type.

---

## 14. Smart Alerts and Notifications

### Existing

- [x] Backend alert entity/service files exist.
- [~] Flutter alerts page exists and is modified.
- [x] OneSignal Flutter package exists.

### Remaining

- [ ] alert controller/endpoints.
- [ ] push registration/token lifecycle.
- [ ] backend OneSignal dispatch.
- [ ] in-app notification center persistence.
- [ ] voice notification/TTS.
- [ ] emergency red alert UI.
- [ ] safe repeat policy.
- [ ] acknowledgement.
- [ ] SMS gateway adapter.
- [ ] WhatsApp adapter only when configured.
- [ ] alert preference management.
- [ ] delivery/open metrics.

---

## 15. Voice AI Assistant

- [~] Agent/assistant UI exists.
- [ ] speech-to-text provider/device integration.
- [ ] Bangla recognition validation.
- [ ] English recognition.
- [ ] text-to-speech.
- [ ] intent router.
- [ ] open camera intent.
- [ ] fertilizer query.
- [ ] weather query.
- [ ] marketplace navigation/search.
- [ ] market price query.
- [ ] livestock/fish support.
- [ ] confirmation before order/payment/destructive action.
- [ ] conversation history.
- [ ] privacy/delete controls.
- [ ] AI safety disclaimers.

---

## 16. Livestock Farming

- [ ] Cow dashboard.
- [ ] Goat dashboard.
- [ ] Buffalo dashboard.
- [ ] Sheep dashboard.
- [ ] animal records and tags.
- [ ] image-assisted disease triage.
- [ ] health score.
- [ ] vaccination schedule.
- [ ] heat/breeding tracking.
- [ ] pregnancy tracking.
- [ ] milk production.
- [ ] wool production.
- [ ] feed calculator/plan.
- [ ] weight tracking.
- [ ] medicine reminders.
- [ ] veterinary consultation.
- [ ] emergency alerts.

---

## 17. Poultry Farming

- [ ] flock/batch records.
- [ ] shed dashboard.
- [ ] disease assistance.
- [ ] mortality tracking.
- [ ] feed schedule.
- [ ] vaccine schedule.
- [ ] egg production.
- [ ] broiler growth.
- [ ] temperature records.
- [ ] humidity records.
- [ ] threshold alerts.

---

## 18. Fisheries and River Fishermen

- [ ] pond records/dashboard.
- [ ] water temperature.
- [ ] pH.
- [ ] dissolved oxygen.
- [ ] ammonia.
- [ ] feed reminder.
- [ ] fish growth.
- [ ] fish disease assistance.
- [ ] harvest prediction.
- [ ] river level.
- [ ] tide data.
- [ ] storm/lightning/high-wave risk.
- [ ] fishing restriction season.
- [ ] government ban notice.
- [ ] danger score.
- [ ] emergency voice alert.

---

## 19. Consultation and Communication

- [ ] Agriculture specialist profiles.
- [ ] Veterinary doctor profiles.
- [ ] credential approval.
- [ ] availability slots.
- [ ] appointments.
- [ ] live chat.
- [ ] voice call adapter.
- [ ] video call adapter.
- [ ] prescription.
- [ ] consultation history.
- [ ] emergency escalation.

---

## 20. Invoice System

### Existing

- [x] Backend documents module/controller exists.
- [x] Flutter QR and screenshot/share packages exist.

### Remaining

- [ ] invoice schema.
- [ ] immutable invoice numbering.
- [ ] farmer invoice.
- [ ] buyer invoice.
- [ ] seller invoice.
- [ ] server-generated PDF.
- [ ] QR verification endpoint.
- [ ] printable web view.
- [ ] access control.
- [ ] audit trail.

---

## 21. News, Government Services, and CMS

- [~] Admin content entity exists.
- [ ] agriculture news content type.
- [ ] government incentive content type.
- [ ] agriculture office notice.
- [ ] new technology content.
- [ ] subsidy information.
- [ ] agriculture loan information.
- [ ] farmer registration information.
- [ ] government projects.
- [ ] publish scheduling.
- [ ] audience targeting.
- [ ] Bangla/English fields.
- [ ] public mobile screens.

---

## 22. Community, Calendar, Reports, Offline Mode

- [ ] community forum.
- [ ] posts/comments/moderation.
- [ ] live market rate page.
- [ ] seasonal farm calendar.
- [ ] production report.
- [ ] income/expense/profit analysis.
- [ ] graphs.
- [ ] selected offline read cache.
- [ ] offline draft queue.
- [ ] sync conflict strategy.
- [ ] connectivity status UI.

---

## 23. Multilingual and Accessibility

- [ ] complete Bangla localization.
- [ ] complete English localization.
- [ ] no hard-coded mixed-language UI.
- [ ] locale-aware dates/numbers/units.
- [ ] Bangla font/layout testing.
- [ ] screen-reader labels.
- [ ] large-text testing.
- [ ] color-contrast review.
- [ ] voice fallback to text.

---

## 24. Security and Privacy

- [ ] global DTO whitelist verified.
- [ ] route throttling.
- [ ] stricter AI/upload throttling.
- [ ] CORS allowlist.
- [ ] secure headers.
- [ ] JWT rotation/revocation.
- [ ] private storage default.
- [ ] short-lived signed URLs.
- [ ] MIME sniffing and decode validation.
- [ ] EXIF/GPS removal policy.
- [ ] malware scanning hook for documents.
- [ ] consent for AI image processing.
- [ ] retention policy.
- [ ] user data export/delete workflow.
- [ ] PostgreSQL/object-storage/Qdrant coordinated deletion through an outbox/worker process.
- [ ] secret manager for production.
- [ ] logs redact secrets and personal data.
- [ ] audit logs for sensitive actions.
- [ ] payment webhook signature verification.

---

## 25. Testing and Quality Gates

### Backend

- [x] Jest configuration exists.
- [x] default app controller spec exists.
- [ ] meaningful service unit tests.
- [ ] guard tests.
- [ ] AI router tests.
- [ ] key-pool failover tests.
- [ ] Qdrant integration tests.
- [ ] upload tests.
- [ ] E2E auth tests.
- [ ] E2E marketplace tests.
- [ ] E2E image-profile tests.

### Frontend

- [ ] component test setup.
- [ ] Playwright/Cypress setup.
- [ ] admin authentication test.
- [ ] moderation test.
- [ ] image-profile uploader test.

### Flutter

- [ ] repository/data source tests.
- [ ] widget tests.
- [ ] login flow integration test.
- [ ] image upload integration test.
- [ ] Bangla golden tests.

### Build validation

- [ ] `backend`: install/build/lint/test passes.
- [ ] `frontend`: install/build/lint/test passes.
- [ ] `farmer`: pub get/analyze/test/build passes.
- [ ] no unresolved TypeScript/Dart errors.
- [ ] no secrets committed.

---

## 26. Explicitly Excluded Scope

These items should not be marked as missing because they are intentionally excluded by the project owner:

- [x] Wallet System excluded.
- [x] Bonus withdrawal excluded.
- [x] Referral income/wallet ledger excluded.
- [x] Drone integration excluded.
- [x] Satellite crop monitoring excluded.
- [x] IoT smart sensor integration excluded for current scope.
- [x] Soil analyzer excluded.
- [x] Automatic irrigation control excluded.
- [x] Smart greenhouse excluded.
- [x] Carbon credit tracking excluded.
- [x] Blockchain crop traceability excluded.
- [x] AI farm insurance risk assessment excluded.
- [x] Laravel replacement excluded.
- [x] mandatory Python/FastAPI service excluded.

---

## 27. Deferred Full-Roadmap Work Order (Not Current Sections 1â€“6)

Execute in this order to reduce rework:

1. [ ] Review and checkpoint current uncommitted Flutter changes.
2. [ ] Run all three project build/lint/analyze commands and record failures.
3. [ ] harden backend bootstrap, config validation, response/errors, health endpoints.
4. [ ] verify and complete authentication/roles.
5. [x] local Docker Compose exists for PostgreSQL, Redis, Qdrant, and MinIO object storage.
6. [ ] implement provider-neutral AI module.
7. [ ] implement Gemini multi-key pool and tests.
8. [ ] implement storage/upload/queue pipeline.
9. [ ] implement Qdrant collections and image-profile schemas.
10. [ ] build Next.js bulk uploader.
11. [ ] implement vector ingestion/search and confidence evaluation.
12. [ ] replace demo detection with production pipeline.
13. [ ] complete Digital Farm and crop management.
14. [ ] weather and smart alerts.
15. [ ] livestock/poultry/fisheries.
16. [ ] marketplace checkout/orders/invoices.
17. [ ] consultation/news/government services.
18. [ ] security, load, disaster recovery, and release validation.

---

## 28. Triple-Validation Record

### Pass 1 Ã¢â‚¬â€ PDF scope coverage

- [x] Crop features captured.
- [x] Weather and alert features captured.
- [x] voice assistant captured.
- [x] marketplace/e-commerce captured.
- [x] all PDF user roles captured.
- [x] invoice/chat/consultation/news/government/admin captured.
- [x] livestock/poultry/fisheries/river safety captured.
- [x] Digital Farm captured.

### Pass 2 Ã¢â‚¬â€ Owner instruction compliance

- [x] Flutter retained.
- [x] NestJS retained.
- [x] Next.js retained.
- [x] Gemini first provider.
- [x] 5Ã¢â‚¬â€œ10 Gemini key architecture specified.
- [x] future OpenAI/custom provider extensibility specified.
- [x] Qdrant image-profile workflow specified.
- [x] 10Ã¢â‚¬â€œ500 image ingestion specified.
- [x] 70Ã¢â‚¬â€œ80% confidence behavior treated as configurable/calibrated rather than raw similarity.
- [x] Wallet ignored.
- [x] Future AI Features ignored.
- [x] suggested replacement technologies ignored.

### Pass 3 Ã¢â‚¬â€ Repository reality check

- [x] current folders verified.
- [x] package dependencies verified.
- [x] current backend modules enumerated.
- [x] current Next.js admin files enumerated.
- [x] current Flutter feature folders enumerated.
- [x] uncommitted changes recorded.
- [x] completed items only marked verified where repository evidence exists.
- [x] demo/uncertain items marked partial rather than complete.

---

## 29. Agent Update Protocol

Whenever an AI agent or developer completes work:

1. Change only the relevant checklist item from `[ ]` or `[~]` to `[x]`.
2. Add evidence directly below the item:
   - source file path
   - endpoint/route
   - test file
   - command and result
3. Do not mark UI-only work complete if backend authorization/data is missing.
4. Do not mark an AI/vector feature complete without evaluation evidence.
5. Do not add Wallet or Future AI Features back into current scope.
6. Run related lint/build/test commands before marking complete.
7. Record blockers with `[!]` and a concrete reason.


---

# 30. Extended Completion Audit Ã¢â‚¬â€ Weather, Voice, Siren, Performance, Roles, and Routing

## 30.1 Windy weather integration

- [x] Windy selected as the initial weather provider in `plan.md`.
- [ ] Create `WeatherProvider` interface.
- [ ] Create `WindyWeatherProvider` implementation.
- [ ] Add backend-only Windy environment variables.
- [ ] Validate Windy configuration at application startup.
- [ ] Prevent Windy keys from appearing in Flutter/Next.js bundles.
- [ ] Create normalized current-weather DTO.
- [ ] Create normalized forecast DTO.
- [ ] Preserve provider/model/source timestamps.
- [ ] Normalize all units.
- [ ] Add Redis weather cache.
- [ ] Add geospatial cache keys.
- [ ] Add request coalescing for same-area requests.
- [ ] Add scheduled refresh for watched farm locations.
- [ ] Store critical hazard snapshots.
- [ ] Add Windy rate-limit handling.
- [ ] Add timeout/retry/circuit-breaker behavior.
- [ ] Add mock provider for tests.
- [ ] Add provider-outage fallback behavior.
- [ ] Display last-updated time in Flutter.
- [ ] Display stale/offline state clearly.
- [ ] Verify heavy rain data mapping.
- [ ] Verify wind and gust mapping.
- [ ] Verify humidity mapping.
- [ ] Verify heat/cold mapping.
- [ ] Verify thunderstorm/lightning indicators supported by selected Windy endpoint/model.
- [ ] Identify separate authoritative river-level/flood source where Windy is insufficient.

Required evidence before completion:

- provider service files;
- DTO/schema files;
- cache tests;
- sample normalized response with key removed;
- outage test;
- Flutter screen showing source timestamp.

## 30.2 Agricultural weather hazard engine

- [ ] Create versioned hazard rule schema.
- [ ] Rule ID and version.
- [ ] geographic scope.
- [ ] threshold and persistence window.
- [ ] severity mapping.
- [ ] cooldown and repeat policy.
- [ ] Bangla message template.
- [ ] English message template.
- [ ] crop/farm-specific recommended action.
- [ ] expiry time.
- [ ] heavy-rain rule.
- [ ] strong-wind rule.
- [ ] lightning rule.
- [ ] extreme-heat rule.
- [ ] cold-stress rule.
- [ ] high-humidity/disease-risk rule.
- [ ] prolonged-dry-period rule.
- [ ] river/fishing-risk rules after data source selection.
- [ ] admin rule review UI.
- [ ] rule-change audit log.
- [ ] replay test using historical/saved forecasts.
- [ ] false-alert review process.

## 30.3 Online voice assistant

- [x] Online-first voice architecture specified.
- [ ] Add `speech_to_text` after compatibility test.
- [ ] Add `flutter_tts` after compatibility test.
- [ ] Add `audio_session`.
- [ ] Add `just_audio` if needed for generated audio and alert preview.
- [ ] Add `record` only for optional server-side transcription path.
- [ ] Add `connectivity_plus`.
- [ ] microphone permission UX.
- [ ] partial transcript UI.
- [ ] final transcript detection.
- [ ] typed-input fallback.
- [ ] cancel obsolete voice requests.
- [ ] show text before TTS playback completes.
- [ ] audio focus and interruption management.
- [ ] stop/pause/replay speech controls.
- [ ] Bangla recognition testing.
- [ ] English recognition testing.
- [ ] noisy-environment testing.
- [ ] low-bandwidth behavior.
- [ ] timeout and retry behavior.
- [ ] transcript privacy/retention control.
- [ ] `VoiceAssistantModule` in NestJS.
- [ ] structured voice intent schema.
- [ ] intent parser validation.
- [ ] navigation intent.
- [ ] crop assistance intent.
- [ ] scanner intent.
- [ ] weather intent.
- [ ] marketplace intent.
- [ ] market price intent.
- [ ] order status intent.
- [ ] consultation intent.
- [ ] livestock/poultry/fish intent.
- [ ] unknown/help intent.
- [ ] confirmation for payment/order/publish/delete actions.
- [ ] voice request rate limits.
- [ ] voice latency metrics.

## 30.4 Replaceable messaging and notification adapters

- [x] Adapter-based communication architecture specified.
- [ ] Create `NotificationOrchestrator`.
- [ ] Create common notification message/result contracts.
- [ ] Create in-app provider.
- [ ] Create OneSignal provider.
- [ ] Create disabled SMS placeholder provider.
- [ ] Create disabled WhatsApp placeholder provider.
- [ ] Create email provider interface.
- [ ] Create future voice-call provider interface.
- [ ] provider selected by configuration.
- [ ] business modules contain no vendor-specific SDK calls.
- [ ] notification template versioning.
- [ ] locale selection.
- [ ] idempotency key.
- [ ] expiry handling.
- [ ] provider response ID storage.
- [ ] delivery/open/acknowledgement states.
- [ ] retry policy by channel.
- [ ] dead-letter handling.
- [ ] opt-in/opt-out preferences.
- [ ] admin delivery dashboard.
- [ ] provider replacement contract tests.

## 30.5 Locked-screen and closed-app siren alerts

### Product and safety definition

- [x] Siren restricted to critical emergency weather/safety alerts in the plan.
- [ ] Define exact `CRITICAL` severity criteria.
- [ ] Define maximum repeat count.
- [ ] Define repeat interval.
- [ ] Define acknowledgement behavior.
- [ ] Define event expiry.
- [ ] Define quiet-hours override rule.
- [ ] Define test-alert behavior.
- [ ] Add privileged permission for manual critical alerts.
- [ ] Audit all manual siren triggers.

### Android implementation

- [ ] Add/evaluate `flutter_local_notifications`.
- [ ] Add/evaluate `timezone`.
- [ ] Add/evaluate `device_info_plus`.
- [ ] Add/evaluate `just_audio` or chosen audio package.
- [ ] Create high-importance emergency notification channel.
- [ ] Bundle custom siren sound as Android resource.
- [ ] heads-up notification.
- [ ] lock-screen visibility.
- [ ] vibration pattern.
- [ ] action: acknowledge.
- [ ] action: open details.
- [ ] action: mute event.
- [ ] duplicate event-ID suppression.
- [ ] expired-alert suppression.
- [ ] signed/authenticated payload validation.
- [ ] full-screen intent only for policy-compliant critical use.
- [ ] native alarm/full-screen activity where required.
- [ ] Android 13+ notification permission flow.
- [ ] Android 14+ full-screen intent review.
- [ ] exact-alarm permission review before use.
- [ ] foreground service only during an active event if needed.
- [ ] app-killed delivery test.
- [ ] phone-locked delivery test.
- [ ] reboot behavior test if scheduled alerts are used.
- [ ] Doze/battery optimization test.
- [ ] Samsung device test.
- [ ] Xiaomi/Redmi device test.
- [ ] Oppo/Realme device test.
- [ ] Vivo device test.
- [ ] Pixel/reference Android test.

### iOS implementation

- [ ] time-sensitive notification setup.
- [ ] custom sound within platform rules.
- [ ] document Critical Alerts entitlement requirement.
- [ ] decide whether to request Apple Critical Alerts entitlement.
- [ ] locked-screen test.
- [ ] app-terminated test.
- [ ] clearly communicate platform limitations.

Important completion rule:

- [!] Do not mark Ã¢â‚¬Å“siren always works while app is closedÃ¢â‚¬Â complete based only on emulator or one Android phone. It requires multi-device physical testing and platform-policy verification.

## 30.6 Flutter nested routing

### Current verification

- [x] AutoRoute is installed.
- [x] Current router uses `MainShellRoute`.
- [x] Current router uses `EmptyShellRoute` tab branches.
- [x] Home and marketplace already contain nested child routes.
- [~] Current route tree is only partially expanded and remains centralized in one file.

Evidence:

- `farmer/lib/core/router/app_router.dart`

### Required refactor

- [ ] Keep root routes limited to splash/auth/onboarding/app shell.
- [ ] Split feature route definitions into separate files.
- [ ] Add auth nested routes.
- [ ] Add onboarding nested routes.
- [ ] Add home nested routes.
- [ ] Add farm nested routes.
- [ ] Add diagnosis nested routes.
- [ ] Add marketplace nested routes.
- [ ] Add alerts nested routes.
- [ ] Add assistant nested routes.
- [ ] Add consultation nested routes.
- [ ] Add account nested routes.
- [ ] Add verification guard.
- [ ] Add reusable role/permission guard.
- [ ] deep-link authentication resume.
- [ ] preserve independent tab stacks.
- [ ] preserve scroll state when changing tabs.
- [ ] use IDs in path/arguments rather than large model objects.
- [ ] route-level loading/error state.
- [ ] route analytics observer without sensitive payload.
- [ ] generated route code freshness check in CI.
- [ ] route unit/widget tests.
- [ ] back-button behavior tests.
- [ ] Android predictive-back tests.

## 30.7 Expanded actor and permission system

### Roles to model

- [ ] Farmer.
- [ ] Wholesale buyer.
- [ ] Retail/public buyer.
- [ ] Student/volunteer/field assistant.
- [ ] Agriculture specialist.
- [ ] Veterinary doctor.
- [ ] Input/equipment seller.
- [ ] Medicine seller.
- [ ] Logistics/delivery partner.
- [ ] Market data contributor.
- [ ] Government/agriculture officer.
- [ ] Content editor.
- [ ] Support agent.
- [ ] Moderator.
- [ ] Finance/order operations officer without wallet access.
- [ ] Admin.
- [ ] Super admin.
- [ ] Guest/public user.

### Role mechanics

- [ ] multi-role account support.
- [ ] active workspace/role switch.
- [ ] granular permission records.
- [ ] role verification requirements.
- [ ] jurisdiction scoping for government officers.
- [ ] assisted-action attribution.
- [ ] role approval history.
- [ ] permission change audit.
- [ ] backend enforcement for every sensitive action.
- [ ] frontend/mobile role-aware navigation only as UX, never security.
- [x] Support impersonation is disabled by default through `SUPPORT_IMPERSONATION_ENABLED=false`.
- [x] Controlled support mode requires an approved admin, an explicit reason, a non-admin active target, a 15-minute token and an audit record.

### Permission keys

- [ ] `farm.read.own`.
- [ ] `farm.write.own`.
- [ ] `farm.write.assisted`.
- [ ] `diagnosis.request`.
- [ ] `diagnosis.review`.
- [ ] `listing.publish.own`.
- [ ] `listing.moderate`.
- [ ] `order.manage.own`.
- [ ] `consultation.prescribe`.
- [ ] `weather.alert.publish`.
- [ ] `cms.publish`.
- [ ] `image_profile.manage`.
- [ ] `admin.user.verify`.

## 30.8 Flutter speed and smoothness

### Architecture

- [ ] one consistent app-state strategy documented.
- [ ] avoid duplicate state frameworks.
- [ ] feature-first module boundaries.
- [ ] repository/data-source separation in all features.
- [ ] immutable models.
- [ ] generated JSON serialization.
- [ ] singleton/network lifecycle through DI.
- [ ] cancel obsolete requests.
- [ ] pagination.
- [ ] stale-while-revalidate cache.
- [ ] offline draft storage.
- [ ] upload retry/resume strategy.

### UI performance

- [ ] use thumbnails in lists.
- [ ] lazy-load large tabs/features.
- [ ] avoid rebuilding whole dashboards.
- [ ] const widgets where possible.
- [ ] stable list keys.
- [ ] skeleton loading states.
- [ ] virtualize/paginate large lists.
- [ ] image decode dimensions constrained.
- [ ] no base64 images in API/UI state.
- [ ] no AI work on UI isolate.
- [ ] expensive local processing moved to isolate only when necessary.
- [ ] animations respect low-end device performance.
- [ ] reduced-motion/accessibility support.

### Profiling and devices

- [ ] choose minimum supported Android version.
- [ ] choose baseline low-end device.
- [ ] choose baseline mid-range device.
- [ ] release-mode startup profiling.
- [ ] frame rendering/jank profiling.
- [ ] memory profiling.
- [ ] image-heavy marketplace profiling.
- [ ] 100Ã¢â‚¬â€œ500 image selection/upload profiling where supported.
- [ ] long-list profiling.
- [ ] network-loss recovery profiling.
- [ ] crash-free session monitoring.

## 30.9 Backend speed and resilience

- [ ] query/index audit for every collection.
- [ ] cursor pagination on large resources.
- [ ] N+1 query audit.
- [ ] Redis caching policy.
- [ ] weather request coalescing.
- [ ] separate worker process.
- [ ] streamed uploads.
- [ ] no in-memory buffering of bulk files.
- [ ] job progress events.
- [ ] graceful shutdown.
- [ ] provider timeouts.
- [ ] circuit breakers.
- [ ] dependency health checks.
- [ ] p50/p95/p99 metrics.
- [ ] structured logs.
- [ ] load test: login.
- [ ] load test: dashboard.
- [ ] load test: listing search.
- [ ] load test: weather cache miss/hit.
- [ ] load test: critical alert fan-out.
- [ ] load test: image-profile ingestion.
- [ ] capacity and quota documentation.

## 30.10 Next.js speed and admin usability

- [ ] use server components for suitable read-heavy pages.
- [ ] isolate client components to interactive areas.
- [ ] route-level loading boundaries.
- [ ] route-level error boundaries.
- [ ] virtualized tables where needed.
- [ ] presigned direct uploads.
- [ ] no base64 image transfer.
- [ ] dynamic import for heavy charts/upload tools.
- [ ] responsive admin layout.
- [ ] keyboard accessibility.
- [ ] bulk-action confirmation.
- [ ] upload progress and failed-file retry.
- [ ] server/client secret boundary audit.

## 30.11 Package installation audit

Do not mark package work complete merely because a name appears in `plan.md`.

### Flutter additions pending

- [ ] `speech_to_text`.
- [ ] `flutter_tts`.
- [ ] `record` if needed.
- [ ] `audio_session`.
- [ ] `just_audio`.
- [ ] `flutter_local_notifications`.
- [ ] `timezone`.
- [ ] `connectivity_plus`.
- [ ] `device_info_plus`.
- [ ] `wakelock_plus` if justified.
- [ ] `workmanager` if justified.
- [ ] selected crash/performance monitoring SDK.
- [ ] optional robust local database after decision.

For each package:

- [ ] version compatibility checked.
- [ ] license checked.
- [ ] Android configuration completed.
- [ ] iOS configuration completed.
- [ ] unused overlapping package avoided.
- [ ] release build tested.

### Backend additions/configuration pending

- [ ] `@nestjs/axios` or chosen HTTP wrapper.
- [ ] `@nestjs/schedule`.
- [ ] Redis/BullMQ integration verified.
- [ ] Qdrant client configured.
- [ ] S3 presigner configured.
- [ ] AI output schema validator selected.
- [ ] metrics package selected.
- [ ] structured logging package selected if needed.
- [ ] invoice PDF renderer selected.
- [ ] QR generation package selected.
- [ ] current official Gemini SDK selected and pinned.

### Next.js additions pending

- [ ] chosen query library if needed.
- [ ] form/schema stack.
- [ ] dropzone uploader.
- [ ] virtualization library.
- [ ] one chart library.
- [ ] monitoring SDK.

## 30.12 Production strength gate

- [ ] threat model complete.
- [ ] role/permission matrix signed off.
- [ ] secret scanning passes.
- [ ] dependency vulnerability scan passes or exceptions documented.
- [ ] low-connectivity test passes.
- [ ] offline weather freshness behavior passes.
- [ ] critical alert duplicate suppression passes.
- [ ] Windy outage behavior passes.
- [ ] Gemini all-keys-exhausted behavior passes.
- [ ] Qdrant outage behavior passes.
- [ ] Qdrant rebuild test passes.
- [ ] backup restore drill passes.
- [ ] coordinated user/image deletion passes.
- [ ] non-AI core workflow remains usable during AI outage.
- [ ] privacy/retention documentation complete.
- [ ] background/alarm/microphone/notification store-policy review complete.
- [ ] physical-device locked-screen alert matrix completed.
- [ ] no intentionally excluded Wallet/Future AI scope reintroduced.

## 30.13 Revalidation record for this revision

### PDF recheck

- [x] All 19 parsed PDF pages reviewed again against the implementation categories.
- [x] User types re-expanded beyond the basic PDF roles where operational actors are required.
- [x] crop, livestock, poultry, fisheries, river safety, marketplace, voice, weather, consultation, news, government, admin, invoices, farm profile, community, calendar, reports, and offline requirements remain represented.
- [x] Wallet remains excluded.
- [x] Future AI Features remain excluded.

### Repository recheck

- [x] Flutter package file re-read.
- [x] current AutoRoute configuration re-read.
- [x] existing nested shell routes confirmed.
- [x] proposed packages are separated from already installed packages.
- [x] no source code or package file changed during this documentation revision.

### Architecture recheck

- [x] Windy fixed as first weather provider behind an adapter.
- [x] online-first Flutter voice path specified.
- [x] SMS/WhatsApp/email/voice channels made replaceable.
- [x] lock-screen/app-closed siren design includes Android/iOS platform constraints.
- [x] smoothness/performance requirements added across Flutter, NestJS, and Next.js.
- [x] nested route architecture made explicit and feature-owned.
- [x] production-readiness gates expanded.


---

# 31. Final Rules Audit Ã¢â‚¬â€ OneSignal, Siren, Qdrant Fallback, Cache, Glassmorphism, Skeletons, and Feature Handoff

## 31.1 OneSignal notification rule

- [x] OneSignal is documented as the mandatory production remote-push provider.
- [ ] Implement `NotificationOrchestrator`.
- [ ] Implement `OneSignalPushProvider`.
- [ ] Remove/avoid alternative production push providers.
- [ ] Keep OneSignal REST/API secret in NestJS only.
- [ ] Configure Flutter public OneSignal app ID safely.
- [ ] Map external user IDs securely.
- [ ] Define role/location/farm/crop/livestock tags.
- [ ] Ensure backend authorization decides recipients.
- [ ] Add event ID, type, severity, issue time, expiry time, locale, and deep link to payload.
- [ ] Store provider response ID.
- [ ] Store/open/acknowledgement state where available.
- [ ] Add duplicate suppression.
- [ ] Add expired-event suppression.
- [ ] Add lock-screen privacy rules.
- [ ] Add OneSignal delivery test in staging.
- [ ] Add app-killed delivery test.
- [ ] Add role/segment delivery tests.

## 31.2 Weather audio siren rules

- [x] Siren is defined as an extra local/native presentation layer after OneSignal delivery.
- [ ] Define `CRITICAL` weather-event taxonomy.
- [ ] Extreme-heat critical rule.
- [ ] Cyclone/severe-storm critical rule.
- [ ] dangerous-wind critical rule.
- [ ] lightning critical rule.
- [ ] river/fishing-danger critical rule.
- [ ] flood/flash-flood rule after authoritative source selection.
- [ ] Ensure normal weather updates cannot play siren.
- [ ] Verify event signature/payload.
- [ ] Verify event issue/expiry time.
- [ ] Verify severity before playback.
- [ ] Verify acknowledgement/mute state.
- [ ] Implement bounded repeat policy.
- [ ] Add custom siren resource.
- [ ] Test phone locked.
- [ ] Test app backgrounded.
- [ ] Test app terminated.
- [ ] Test duplicate event.
- [ ] Test expired event.
- [ ] Test acknowledgement stops repeats.
- [ ] Test permission denied behavior.

## 31.3 Qdrant-first and AI-fallback rule

- [x] Qdrant-first matching and Gemini fallback are documented.
- [ ] Attempt Qdrant first for every supported image-profile domain.
- [ ] High-confidence vector-match path.
- [ ] Medium-confidence alternatives path.
- [ ] Low/no-confidence AI fallback path.
- [ ] Qdrant-unavailable AI fallback path.
- [ ] Candidate-disagreement AI review path.
- [ ] Optional AI explanation after trusted vector match.
- [ ] Save result origin: `VECTOR_MATCH`.
- [ ] Save result origin: `AI_ANALYSIS`.
- [ ] Save result origin: `VECTOR_PLUS_AI`.
- [ ] Save result origin: `SPECIALIST_REVIEW`.
- [ ] Cache embeddings by checksum/model version.
- [ ] Cache reviewed profile explanations.
- [ ] Batch query images.
- [ ] Remove duplicate images before AI call.
- [ ] Filter Qdrant by domain/model version.
- [ ] Add timeout/retry/circuit breaker to fallback.
- [ ] Add pending/retryable state when both Qdrant and AI fail.
- [ ] Show truthful non-diagnostic failure message.
- [ ] Test high-confidence no-full-vision-call behavior.
- [ ] Test Qdrant outage fallback.
- [ ] Test AI quota exhaustion.
- [ ] Test both-services-unavailable behavior.

## 31.4 Cache-by-default implementation

- [x] Multi-layer cache strategy documented.
- [ ] Flutter memory cache.
- [ ] Flutter persistent safe-read cache.
- [ ] Next.js server/request caching where suitable.
- [ ] NestJS short-lived local cache where suitable.
- [ ] Redis distributed cache.
- [ ] CDN/object-storage thumbnail caching.
- [ ] Weather cache keys/TTL/invalidation.
- [ ] Market-price cache keys/TTL/invalidation.
- [ ] News/government-content caching.
- [ ] Category/lookup caching.
- [ ] Farm-summary short-TTL cache.
- [ ] Listing-query caching where safe.
- [ ] Profile thumbnail caching.
- [ ] AI profile-guidance caching.
- [ ] Permission cache with role-change invalidation.
- [ ] Embedding cache by checksum/model version.
- [ ] Define cache version for each resource.
- [ ] Define privacy classification for each resource.
- [ ] Prevent caching secrets/tokens/OTPs.
- [ ] Prevent stale payment cache.
- [ ] Prevent expired alert cache playback.
- [ ] Prevent public caching of private raw images.
- [ ] Show cached data immediately.
- [ ] Refresh in background.
- [ ] Preserve cached content on refresh failure.
- [ ] Display freshness timestamps where needed.
- [ ] Add cache hit/miss metrics.
- [ ] Add invalidation tests.

## 31.5 Mandatory glassmorphism design system

- [x] Modern glassmorphism is documented as mandatory for Flutter and Next.js.
- [x] Dribbble, Mobbin, and Behance are documented as inspiration sources only.
- [ ] Create original visual direction; do not copy exact designs/assets.
- [ ] Define semantic color tokens.
- [ ] Define glass opacity tiers.
- [ ] Define blur tiers.
- [ ] Define border/highlight opacity.
- [ ] Define shadow/elevation tiers.
- [ ] Define radius scale.
- [ ] Define spacing scale.
- [ ] Define typography scale.
- [ ] Define icon scale.
- [ ] Define animation timings/curves.
- [ ] Define alert severity tokens.
- [ ] Define skeleton tokens.
- [ ] Define chart tokens.
- [ ] Implement Flutter theme/design-system layer.
- [ ] Implement Next.js CSS variable/Tailwind design tokens.
- [ ] Match core visual tokens across clients.
- [ ] Add light theme.
- [ ] Add dark theme only if fully supported.
- [ ] Add reduced-transparency fallback.
- [ ] Add reduced-motion behavior.
- [ ] Verify glass text contrast.
- [ ] Verify alert contrast.
- [ ] Avoid excessive glass-on-glass nesting.
- [ ] Avoid blur on every component.
- [ ] Provide low-end-device fallback.
- [ ] Record design references per feature in `features.md`.
- [ ] Conduct accessibility review.
- [ ] Conduct performance review.

## 31.6 Skeleton loading in Flutter and Next.js

- [x] Skeleton loading is documented as mandatory.
- [ ] Flutter shared skeleton primitives.
- [ ] Flutter dashboard skeleton.
- [ ] Flutter weather skeleton.
- [ ] Flutter marketplace list/grid skeleton.
- [ ] Flutter profile/header skeleton.
- [ ] Flutter consultation/chat-list skeleton.
- [ ] Flutter alert-list skeleton.
- [ ] Stop off-screen shimmer animation.
- [ ] Respect reduced motion.
- [ ] Replace skeleton with error state on failure.
- [ ] Use cached content instead of skeleton when available.
- [ ] Next.js shared glass skeleton components.
- [ ] Next.js route `loading.tsx` where suitable.
- [ ] Component Suspense fallbacks.
- [ ] Table skeletons matching final columns.
- [ ] Card/grid skeletons matching final layout.
- [ ] Prevent cumulative layout shift.
- [ ] Use actual progress for known upload/job progress.
- [ ] Never show skeleton after definitive empty result.
- [ ] Profile skeleton + backdrop blur together on low-end devices.

## 31.7 Design inspiration workflow

For each major user-facing feature:

- [ ] Collect 3Ã¢â‚¬â€œ5 relevant references.
- [ ] Record source URLs.
- [ ] Note hierarchy/navigation/layout patterns.
- [ ] Confirm no proprietary asset is copied.
- [ ] Create original wireframe.
- [ ] Validate flow against requirements.
- [ ] Implement with shared tokens.
- [ ] Review accessibility.
- [ ] Review performance.
- [ ] Add final screenshots/evidence to `features.md` where practical.

## 31.8 `features.md` handoff requirement

- [x] `features.md` is required by the plan.
- [x] `features.md` exists and is intentionally empty until the first real feature is implemented and tested.
- [ ] Every future completed `done.md` item has a matching feature entry.
- [ ] Every feature entry identifies affected roles.
- [ ] Every feature entry explains how to access/use the feature.
- [ ] Every feature entry lists configuration/environment requirements.
- [ ] Every feature entry lists endpoints.
- [ ] Every feature entry lists database/index changes.
- [ ] Every feature entry lists queues/jobs.
- [ ] Every feature entry documents notification behavior.
- [ ] Every feature entry documents cache/invalidation.
- [ ] Every feature entry lists permission/security rules.
- [ ] Every feature entry lists changed files.
- [ ] Every feature entry lists package changes.
- [ ] Every feature entry lists migrations/seeds.
- [ ] Every feature entry provides exact manual test steps.
- [ ] Every feature entry provides automated test commands/results.
- [ ] Every feature entry states known limitations.
- [ ] Every feature entry includes rollback notes.
- [ ] Every feature entry links related checklist items.

Hard completion rule:

- [!] No agent or developer may change a feature item to `[x]` without implementation evidence, passing relevant tests, and an updated `features.md` entry.

## 31.9 Revalidation for this revision

- [x] OneSignal fixed as the sole remote push provider.
- [x] Weather siren retained as an additional native/local alert behavior.
- [x] Qdrant-first and AI fallback behavior specified.
- [x] cache-by-default policy added.
- [x] modern glassmorphism made mandatory.
- [x] Dribbble/Mobbin/Behance reference process added.
- [x] skeleton loading required in both Flutter and Next.js.
- [x] future implementation documentation moved into required `features.md` workflow.
- [x] Wallet and Future AI Features remain excluded.


---

# 32. Verified Implementation Ã¢â‚¬â€ PostgreSQL, Shared Backend Library, API Hooks, and Package Foundation

Audit date: 2026-07-17

## 32.1 PostgreSQL migration

- [x] PostgreSQL selected as the primary business database.
- [x] `@nestjs/typeorm`, `typeorm`, and `pg` installed.
- [x] MongoDB root connection removed.
- [x] `@nestjs/mongoose` removed.
- [x] `mongoose` removed.
- [x] obsolete Mongoose type augmentation removed.
- [x] PostgreSQL database module created under `backend/src/lib/database/`.
- [x] database connection supports `DATABASE_URL` and individual `DB_*` variables.
- [x] connection-pool settings added.
- [x] development-only synchronize protection added.
- [x] migration configuration path added.
- [x] graceful database shutdown added.
- [x] UUID base entity created.
- [x] compatibility `_id` field added to API entity serialization.
- [x] user entity converted to TypeORM.
- [x] goods/category entities converted to TypeORM.
- [x] listing entity converted to TypeORM.
- [x] offer/deal entities converted to TypeORM.
- [x] market-price entity converted to TypeORM.
- [x] medicine/inventory entities converted to TypeORM.
- [x] agent-action entity converted to TypeORM.
- [x] guidance entity converted to TypeORM.
- [x] alert entity converted to TypeORM.
- [x] corresponding NestJS modules converted to `TypeOrmModule.forFeature`.
- [x] user service converted to TypeORM repositories/query builders.
- [x] goods service converted to TypeORM repositories/query builders.
- [x] listing service converted to TypeORM repositories/query builders.
- [x] deal service converted to TypeORM repositories/query builders.
- [x] agent service converted to TypeORM repositories/query builders.
- [x] market-price service converted to TypeORM repositories/query builders.
- [x] medicine catalog/seller services converted to TypeORM repositories/query builders.
- [x] alert service converted to TypeORM repositories.
- [x] admin service and SQL aggregations converted to TypeORM.
- [x] listing reservation and deal confirmation share one PostgreSQL transaction and pessimistic lock.
- [x] old MongoDB data intentionally not migrated per owner instruction.
- [x] actual backend `.env` no longer contains `MONGODB_URL`.
- [x] `.env.example` updated for PostgreSQL and future providers.

Evidence:

- `backend/src/lib/database/database.module.ts`
- `backend/src/lib/database/base.entity.ts`
- TypeORM entities/services listed in `features.md` FEATURE-001
- `backend/package.json`
- `backend/.env.example`

Validation:

- [x] `npm run build` passed.
- [x] live `npm run start` connected to PostgreSQL.
- [x] Nest application completed startup and route registration.
- [x] `npm test -- --runInBand` passed: 1 suite, 1 test.

Remaining database work:

- [ ] generate and review formal production migrations.
- [ ] add repository/integration tests for all converted modules.
- [ ] add tenant entity and tenant-aware indexes.
- [ ] add PostgreSQL Row-Level Security after tenancy model is finalized.
- [ ] perform load and transaction-concurrency tests.

## 32.2 Shared backend library

- [x] uploaded global exception-filter concept integrated under `backend/src/lib/filters/`.
- [x] HTTP exception normalization implemented.
- [x] PostgreSQL unique-violation handling implemented.
- [x] PostgreSQL foreign-key violation handling implemented.
- [x] non-production stack output protected by environment check.
- [x] uploaded auth-guard concept integrated under `backend/src/lib/auth/`.
- [x] Bearer token supported.
- [x] legacy `access_token` header retained for current clients.
- [x] shared roles decorator created.
- [x] shared roles guard created.
- [x] class-level and handler-level role metadata supported.
- [x] uploaded MinIO service concept integrated and hardened.
- [x] private signed URL support added.
- [x] optional public bucket mode added.
- [x] UUID object-key generation added.
- [x] MinIO missing-config graceful degradation verified.
- [x] global validation uses transform, whitelist, and forbid-non-whitelisted.
- [x] Helmet, compression, cookie parsing, body limits, and CORS allowlist added.
- [x] existing route paths preserved for Flutter/Next.js compatibility.

Remaining shared infrastructure:

- [ ] request-ID middleware.
- [ ] structured Pino logger wiring.
- [ ] Prometheus metrics endpoint.
- [ ] Terminus health/readiness endpoints.
- [ ] real MinIO upload/delete integration test after credentials are configured.
- [ ] secret-manager integration for production.

## 32.3 Next.js React Query and Axios

- [x] `@tanstack/react-query` installed.
- [x] React Query devtools installed.
- [x] Axios installed.
- [x] Sonner installed.
- [x] React Hook Form and Zod form stack installed.
- [x] React Dropzone installed.
- [x] Recharts installed.
- [x] React Virtual installed.
- [x] typed reusable Axios client created.
- [x] API error normalization created.
- [x] reusable query hook created.
- [x] reusable mutation hook created.
- [x] mutation invalidation support added.
- [x] cancellation signal support added.
- [x] global QueryClient provider added to root layout.
- [x] transient-only default retry behavior added.
- [x] React Query devtools restricted to development.
- [x] toast provider included.

Evidence:

- `frontend/api-hooks/api-client.ts`
- `frontend/api-hooks/query-provider.tsx`
- `frontend/api-hooks/use-api-query.ts`
- `frontend/api-hooks/use-api-mutation.ts`
- `frontend/app/layout.tsx`
- `features.md` FEATURE-003

Validation:

- [x] `npm run lint` passed.
- [x] `npm run build` passed.
- [x] Next.js TypeScript validation passed.
- [x] production static-page generation passed.

Remaining Next.js migration:

- [ ] migrate existing admin screens from old `apiRequest` to new query/mutation hooks.
- [ ] move web authentication from local storage to secure HTTP-only cookie sessions.
- [ ] add component and Playwright tests for the query layer.

## 32.4 Flutter package foundation

- [x] `speech_to_text` installed.
- [x] `flutter_tts` installed.
- [x] `audio_session` installed.
- [x] `just_audio` installed.
- [x] `flutter_local_notifications` installed.
- [x] `timezone` installed.
- [x] `connectivity_plus` added as a direct dependency.
- [x] `device_info_plus` installed.
- [x] `wakelock_plus` installed.
- [x] `workmanager` installed.
- [x] `sentry_flutter` installed.
- [x] `record` installed.
- [x] `mime` added as a direct dependency.
- [x] `file_picker` installed.

Validation:

- [x] Flutter dependency resolution passed.
- [x] `flutter analyze` passed with no issues.
- [x] `flutter test` passed.

Remaining Flutter feature work:

- [ ] configure native Android/iOS microphone permissions.
- [ ] configure local-notification channels and siren resources.
- [ ] connect OneSignal critical events to local siren handling.
- [ ] implement voice service and UI.
- [ ] configure WorkManager tasks only for approved use cases.
- [ ] configure Sentry DSN and privacy rules.

## 32.5 Additional backend package foundation

Installed and available, but not treated as completed product features:

- [x] official Gemini SDK package installed.
- [x] Redis client installed.
- [x] Qdrant client remains installed.
- [x] BullMQ packages remain installed.
- [x] S3 presigner installed.
- [x] Zod installed.
- [x] file-type and MIME utilities installed.
- [x] QR and PDF packages installed.
- [x] metrics/health/logging packages installed.

Not yet complete merely because packages are installed:

- [ ] Gemini multi-key gateway.
- [ ] Redis cache integration.
- [ ] BullMQ worker infrastructure.
- [ ] Qdrant profile/search pipeline.
- [ ] OneSignal provider service.
- [ ] Windy provider service.
- [ ] invoice PDF and QR implementation.
- [ ] metrics and health endpoints.

## 32.6 Dependency-security notes

- [!] Backend npm audit currently reports 5 high-severity dependency findings. No forced audit fix was applied because it may introduce breaking dependency changes. Review `npm audit` before production.
- [!] Frontend npm audit currently reports 2 moderate-severity dependency findings. Review before production.
- [x] No operating-system or Windows critical files were modified.

## 32.7 Feature documentation compliance

- [x] `features.md` was populated only after actual implementation and validation.
- [x] PostgreSQL migration usage and evidence documented.
- [x] backend shared-library usage and evidence documented.
- [x] Next.js query-layer usage and evidence documented.
- [x] Flutter package foundation and limitations documented.


---

# 33. Verified Structure, Swagger, Provider Management, and Data Flow

## 33.1 NestJS resource structure

- [x] User DTOs moved to `user/dto/`.
- [x] User entities moved to `user/entities/`.
- [x] Goods DTOs/entities moved to dedicated folders.
- [x] Listings DTOs/entities moved to dedicated folders.
- [x] Deals DTOs/entities moved to dedicated folders.
- [x] Agents DTOs/entities moved to dedicated folders.
- [x] Market-price DTOs/entities moved to dedicated folders.
- [x] Medicine-seller DTOs/entities moved to dedicated folders.
- [x] Admin DTOs/entities moved to dedicated folders.
- [x] Alerts entity moved to dedicated folder.
- [x] All affected imports corrected.
- [x] Backend build passes after structural refactor.

## 33.2 Swagger

- [x] Swagger UI available at `/docs`.
- [x] OpenAPI JSON available at `/docs-json`.
- [x] Swagger CLI plugin enabled.
- [x] Class-validator DTO schema generation enabled.
- [x] DTO suffix discovery configured.
- [x] User/auth controller tagged.
- [x] Existing feature controllers verified to have Swagger tags.
- [x] Bearer authentication definition verified.
- [x] 53 live API paths verified in OpenAPI output.
- [x] 24 DTO schemas verified in OpenAPI output.
- [x] Integration-settings DTO and endpoints verified in Swagger.

## 33.3 Next.js provider management

- [x] Integration-setting PostgreSQL entity created.
- [x] AES-256-GCM encrypted storage implemented.
- [x] Backend-only encryption master key configured.
- [x] Provider keys removed from `.env.example`.
- [x] Masked settings read endpoint implemented.
- [x] Protected settings update endpoint implemented.
- [x] Admin-only role guards applied.
- [x] Next.js query hooks created.
- [x] Next.js **AI & providers** admin page added.
- [x] Multiple Gemini key fields supported.
- [x] Gemini text and vision model fields supported.
- [x] Qdrant embedding provider/model fields supported.
- [x] Windy key field supported.
- [x] OneSignal app ID and REST key fields supported.
- [x] Browser receives masked secrets only.
- [x] Encrypted save/read flow tested live.

Remaining:

- [ ] Gemini provider service consumes stored configuration.
- [ ] Windy provider service consumes stored configuration.
- [ ] OneSignal provider service consumes stored configuration.
- [ ] Qdrant embedding service consumes stored configuration.
- [ ] Provider-key rotation health dashboard.

## 33.4 Flutter Dio helper

- [x] Supplied Dio-helper pattern integrated.
- [x] API URL validation added.
- [x] Android emulator localhost mapping added.
- [x] production HTTPS enforcement added.
- [x] Bearer authorization header added.
- [x] legacy token header retained.
- [x] structured API exception implemented.
- [x] backend message/details/request ID parsing added.
- [x] unauthorized session cleanup added.
- [x] duplicate login redirect prevented.
- [x] debug-only Dio logging added.
- [x] request timeouts configured.
- [x] Flutter analyze and tests pass.

## 33.5 Live endpoint and data-flow audit

- [x] Root endpoint returns HTTP 200.
- [x] Swagger UI returns HTTP 200.
- [x] Swagger JSON returns HTTP 200.
- [x] Goods categories return HTTP 200.
- [x] Goods return HTTP 200.
- [x] Latest market prices return HTTP 200.
- [x] Public listings return HTTP 200.
- [x] Guidance returns HTTP 200.
- [x] Medicines return HTTP 200.
- [x] Protected profile without token returns HTTP 401.
- [x] Invalid registration returns structured HTTP 400.
- [x] Farmer registration succeeds.
- [x] Farmer login succeeds.
- [x] Profile retrieval succeeds.
- [x] Location update succeeds.
- [x] Listing creation succeeds.
- [x] Own-listing retrieval succeeds.
- [x] Public listing search succeeds.
- [x] Admin login succeeds.
- [x] Admin dashboard succeeds.
- [x] Provider-settings read succeeds.
- [x] Provider-settings encrypted update succeeds.
- [x] Flutter endpoint paths reviewed against live backend routes.
- [x] Next.js admin endpoint paths reviewed against live backend routes.

## 33.6 Final quality checks

- [x] Backend lint passes.
- [x] Backend build passes.
- [x] Backend tests pass.
- [x] Next.js lint passes.
- [x] Next.js production build passes.
- [x] Flutter analyze passes with no issues.
- [x] Flutter tests pass.
- [x] Temporary backup artifacts removed.
- [x] Development HTTP server stopped after smoke testing.
- [x] `DB_SYNCHRONIZE=false` set after schema creation; future changes require migrations.

Remaining quality work:

- [ ] Generate formal TypeORM migration files.
- [ ] Add Supertest E2E tests for all smoke-tested flows.
- [ ] Add Playwright tests for admin login and provider settings.
- [ ] Add Flutter integration tests against a test backend.


---

# 34. Verified Dashboard Routes, Optional Infrastructure, Gemini Key Pool, and Marketplace Planning

## 34.1 Database synchronization

- [x] `DB_SYNCHRONIZE=true` set in the active backend `.env`.
- [x] `.env.example` documents `DB_SYNCHRONIZE=true` for the current development workflow.
- [x] PostgreSQL remains the required primary startup dependency.
- [!] Automatic synchronization is convenient during development but remains unsafe for production schema governance; production migrations are still required before release.

## 34.2 Next.js dashboard routes

- [x] Root `/` redirects to `/dashboard/admin`.
- [x] `/dashboard` redirects to `/dashboard/admin`.
- [x] Admin dashboard moved to `/dashboard/admin`.
- [x] Dynamic role-workspace route added under `/dashboard/[role]`.
- [x] Farmer route supported.
- [x] Buyer route supported.
- [x] Wholesale-buyer route supported.
- [x] Seller route supported.
- [x] Machinery-seller route supported.
- [x] Medicine-seller route supported.
- [x] Agent route supported.
- [x] Agriculture-specialist route supported.
- [x] Veterinary-doctor route supported.
- [x] Government-officer route supported.
- [x] Support route supported.
- [x] Next.js production build verified all dashboard routes.

Remaining route work:

- [ ] Role-aware login redirect.
- [ ] Multi-role workspace switcher.
- [ ] Per-route server-side authorization.
- [ ] Nested pages for every dashboard workspace.
- [ ] Seller/machinery seller CRUD and analytics pages.
- [ ] Buyer marketplace and saved-search pages.

## 34.3 Unlimited Gemini fallback keys

- [x] Hard 20-key DTO limit removed.
- [x] Next.js UI already supports repeatedly adding Gemini key fields.
- [x] Keys remain encrypted in PostgreSQL.
- [x] Read responses remain masked.
- [x] One key pool may support text and image requests.
- [x] Text and vision model IDs remain separately configurable.
- [x] Qdrant embedding provider/model remains separately configurable.

Remaining Gemini work:

- [ ] Deduplicate submitted keys before persistence.
- [ ] Add per-key IDs/aliases.
- [ ] Add key enable/disable control.
- [ ] Add health/cooldown/quota state.
- [ ] Add least-recently-used/weighted routing.
- [ ] Add bounded request retry policy.
- [ ] Add provider usage dashboard.

## 34.4 Redis and Qdrant degraded startup

- [x] Optional infrastructure global module added.
- [x] Redis uses lazy connection.
- [x] Redis startup timeout/retry is bounded.
- [x] Redis failure logs an error without terminating NestJS.
- [x] Qdrant startup uses a short health-check timeout.
- [x] Qdrant failure logs an error without terminating NestJS.
- [x] Availability getters provided for feature services.
- [x] Degraded startup tested with deliberately invalid Redis and Qdrant ports.
- [x] PostgreSQL connected successfully during degraded test.
- [x] Nest application started successfully during degraded test.
- [x] Root endpoint returned HTTP 200 while Redis and Qdrant were unavailable.

Evidence:

- `backend/src/lib/infrastructure/infrastructure.module.ts`
- `backend/src/lib/infrastructure/optional-infrastructure.service.ts`

Remaining resilience work:

- [ ] Add degraded health endpoint.
- [ ] Wire Redis-aware cache fallback into feature services.
- [ ] Wire Qdrant-unavailable path into Gemini fallback service.
- [ ] Add reconnect/periodic health probes without startup blocking.
- [ ] Add metrics and alerting for degraded dependencies.

## 34.5 Marketplace actor coverage

- [x] Plan explicitly covers farmer crop/farm-output sellers.
- [x] Plan explicitly covers crop buyers and wholesale buyers.
- [x] Plan explicitly covers outside machinery/input sellers.
- [x] Plan covers machinery sale and rental.
- [x] Plan covers seeds, fertilizer, pesticide, feed, medicine, tools, parts and irrigation equipment.
- [x] Buyer filter requirements documented.
- [x] Farmer listing-management filters documented.
- [x] Machinery seller product fields documented.
- [x] Machinery buyer/farmer filters documented.
- [x] Catalog-type separation documented.
- [x] Search, pagination, cache and data-flow plan documented.
- [x] Current implementation versus future work clearly separated.

Current implementation:

- [x] Farmer agricultural listing creation.
- [x] Public listing search.
- [x] Buyer/farmer offer negotiation foundation.
- [x] Deal confirmation and stock reservation foundation.
- [x] Medicine seller inventory and nearby search foundation.

Still required:

- [ ] General marketplace product entity/model.
- [ ] Machinery/input seller onboarding.
- [ ] Machinery product CRUD.
- [ ] Advanced buyer/seller filters.
- [ ] Cursor pagination.
- [ ] Saved searches/favorites.
- [ ] Cart/order/payment/delivery/invoice lifecycle.
- [ ] Seller analytics.
- [ ] Marketplace moderation.
- [ ] Redis popular-search caching.

## 34.6 Validation

- [x] Backend lint passed.
- [x] Backend build passed.
- [x] Backend tests passed.
- [x] Next.js lint passed.
- [x] Next.js production build passed.
- [x] Degraded Redis/Qdrant live startup passed.







---

# Public Browsing, Seller Category Permissions, Recommendations, and Tool Guides

Status rule: every item below remains incomplete until backend behavior, required UI, tests, and practical `features.md` instructions are all present.

## Public access and login continuation

- [ ] Allow unauthenticated visitors to view the public home page.
- [ ] Allow unauthenticated visitors to browse the public store, categories, listings, product details, and public seller information.
- [ ] Require authentication only when a visitor starts a protected action.
- [ ] Preserve the intended page/action through login or registration and safely resume it afterward.
- [ ] Add backend authorization and end-to-end tests for guest versus authenticated behavior.
- [ ] Add Flutter/Next.js loading, cancellation, error, and return-to-action states.
- [ ] Add practical guest browsing and login-continuation instructions to `features.md`.

## Farmer and seller multi-role workflow

- [ ] Allow an existing farmer account to apply for and receive the seller role without creating another account.
- [ ] Add farmer/seller workspace switching for the new seller workflows.
- [ ] Keep general seller approval separate from per-category selling permission.
- [ ] Add backend, Flutter, and Next.js tests for farmer-to-seller onboarding.
- [ ] Add practical role/application instructions to `features.md`.

## Admin-managed nested marketplace categories

- [ ] Add a database-backed marketplace category model with parent/child nesting.
- [ ] Add Bangla/English names, slug, description, image, sort order, status, path/depth, and category policy fields.
- [ ] Add NestJS category CRUD, tree, move, reorder, activate, and archive APIs.
- [ ] Prevent unsafe deletion/movement of categories that have listings or active seller permissions.
- [ ] Add Next.js admin category-tree management UI with image upload and drag-and-drop ordering.
- [ ] Replace hard-coded listing categories with API-managed taxonomy in Flutter and Next.js.
- [ ] Add authorization, audit logging, migrations, indexes, API documentation, and tests.
- [ ] Add practical category administration instructions to `features.md`.

## Seller applications and category permissions

- [ ] Add public Next.js seller application flow after authentication.
- [ ] Allow one application to request multiple categories/subcategories.
- [ ] Collect category-specific documents, licenses, business information, experience, and notes.
- [ ] Add a `SellerCategoryPermission` persistence model and migration.
- [ ] Allow admins to independently approve, reject, suspend, revoke, expire, and annotate each requested category.
- [ ] Allow sellers to request additional categories later without duplicating approved requests.
- [ ] Enforce active category permission on the backend before listing submission/publication.
- [ ] Define and test parent/child permission inheritance policy.
- [ ] Add seller permission views in Next.js admin and seller-facing Flutter/Next.js UI.
- [ ] Add audit events, notifications, indexes, Swagger documentation, and primary/failure-path tests.
- [ ] Add practical application, review, revocation, and publication instructions to `features.md`.

## Structured product knowledge and safety

- [ ] Extend listing/product persistence with intended uses, target crop/animal domains, target problems, symptoms, instructions, dosage/rate where appropriate, contraindications, warnings, composition, manufacturer, licenses, evidence, and moderation provenance.
- [ ] Add category-aware validation so required fields change by product type.
- [ ] Add restricted-product seller/document checks.
- [ ] Add seller listing forms and admin moderation UI for the structured fields.
- [ ] Prevent unreviewed AI-generated claims from being published automatically.
- [ ] Add safety disclaimers and specialist escalation for uncertain/high-risk recommendations.
- [ ] Add migrations, indexes, Swagger documentation, localization, and tests.
- [ ] Add practical listing and moderation instructions to `features.md`.

## Low-AI-first marketplace recommendations

- [ ] Define normalized symptom, crop/animal, use-case, ingredient, and safety vocabulary.
- [ ] Implement lexical/database filtering before vector or generative AI calls.
- [ ] Vectorize approved product knowledge and category paths in Qdrant.
- [ ] Implement Bangla/English typed search against approved active products.
- [ ] Implement Bangla voice-to-text product/use-case search.
- [ ] Add deterministic/vector ranking that returns one or two strongest products plus alternatives and evidence.
- [ ] Use provider-neutral AI only for ambiguity clarification, image interpretation, or evidence summarization when required.
- [ ] Guarantee that AI cannot recommend a product absent from the active marketplace database.
- [ ] Filter recommendations by approved seller, valid category permission, stock, moderation, and safety status.
- [ ] Persist recommendation evidence, vector/model versions, scores, warnings, and user feedback.
- [ ] Add AI-disabled fallback tests, provider-failure tests, relevance evaluation, and safety tests.
- [ ] Add practical recommendation/search instructions to `features.md`.

## Crop image-to-product assistance

- [ ] Add crop image plus optional voice/text symptom submission flow.
- [ ] Reuse image-profile/Qdrant matching for known crop/condition identification.
- [ ] Add structured provider-neutral vision fallback only when local/vector confidence is insufficient.
- [ ] Convert image/AI results into normalized searchable conditions and symptoms.
- [ ] Retrieve only approved active marketplace products from verified structured use records.
- [ ] Return product and non-product guidance, warnings, confidence bands, and specialist escalation.
- [ ] Store the complete evidence chain and disclaimer.
- [ ] Add Flutter capture/result UI and applicable Next.js/admin review UI.
- [ ] Add labeled evaluation, false-positive, unknown-rejection, and end-to-end tests.
- [ ] Add practical image recommendation instructions to `features.md`.

## Admin-managed tool-building knowledge

- [ ] Add unlimited practical nested category persistence for tools, structures, repairs, and DIY guides.
- [ ] Add category images, Bangla/English content, ordering, activation, archive, and audit fields.
- [ ] Add `ToolGuide` and ordered `ToolGuideStep` persistence models and migrations.
- [ ] Support required materials, tools, safety warnings, difficulty, time, cost, tags, and searchable phrases.
- [ ] Support one image and/or validated YouTube link per ordered step as designed.
- [ ] Add Next.js admin create/edit/preview/publish UI.
- [ ] Add sequential image upload and drag-and-drop step/media ordering using `react-sortablejs` or a reviewed maintained equivalent.
- [ ] Validate YouTube hosts/IDs and render embeds safely.
- [ ] Add Flutter step-by-step guide UI with image, video, loading, offline/error, and safety states.
- [ ] Add authorization, moderation, audit, Swagger documentation, tests, and practical `features.md` instructions.

## Tool-guide discovery by category, voice, and image

- [ ] Add image-based nested category browsing in Flutter.
- [ ] Add Bangla/English text search over titles, categories, tags, materials, and steps.
- [ ] Add Bangla voice search with exact/synonym/vector retrieval before AI fallback.
- [ ] Add tool image profiles/sample vectors and Qdrant matching.
- [ ] Return multiple possible matches and related guides rather than one forced answer.
- [ ] Request another angle or manual selection for low-confidence images.
- [ ] Do not label raw vector similarity as probability.
- [ ] Calibrate any displayed 50â€“60% confidence band using a labeled evaluation dataset first.
- [ ] Add search analytics and user feedback without storing unnecessary voice/image data.
- [ ] Add backend, Flutter, Next.js/admin, vector evaluation, and failure-path tests.
- [ ] Add practical category, voice, image-search, and confidence instructions to `features.md`.


## OTP provider configuration verification

- [x] `OTP_PROVIDER_URL` configures the SMS provider endpoint.
- [x] `OTP_PROVIDER_API_KEY` configures the provider API key sent in the `x-api-key` header.
- [x] `OTP_EXPIRES_MINUTES=5` controls OTP expiration.
- [x] `OTP_RESEND_COOLDOWN_SECONDS=60` controls resend cooldown.
- [x] `OTP_MAX_ATTEMPTS=5` limits incorrect verification attempts.
- [x] `OTP_DAILY_LIMIT=10` limits daily OTP requests.
- [x] `OTP_EXPOSE_CODE_IN_DEVELOPMENT=true` may expose the development code only outside production.
- [x] Development may skip real SMS delivery when the provider URL or API key is not configured.
- [x] Production rejects OTP delivery when either the provider URL or API key is missing.
- [x] Password-reset OTPs use the same provider and protection rules.




