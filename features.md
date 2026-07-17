# Implemented Features

## FEATURE-001 — PostgreSQL and TypeORM Backend Foundation

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected applications:** NestJS backend, Flutter mobile app, Next.js admin
- **Related checklist:** `done.md` section 32

### What was implemented

The NestJS backend was migrated from MongoDB/Mongoose to PostgreSQL with TypeORM. No MongoDB data migration was performed because the project owner confirmed that old data is not required.

Implemented PostgreSQL entities:

- users
- goods categories
- goods
- listings
- offers
- deals
- market prices
- medicines
- seller inventory
- agent actions
- guidance/admin content
- alerts

The entities use UUID primary keys, timestamps, PostgreSQL enums, JSONB, text arrays, unique indexes, and composite indexes where appropriate. API objects continue to include `_id` in addition to `id` so the existing Flutter and Next.js code does not immediately break.

### Backend files

- `backend/src/lib/database/base.entity.ts`
- `backend/src/lib/database/database.module.ts`
- `backend/src/user/user.entity.ts`
- `backend/src/user/user.service.ts`
- `backend/src/goods/good.entity.ts`
- `backend/src/goods/good.service.ts`
- `backend/src/listings/listing.entity.ts`
- `backend/src/listings/listing.service.ts`
- `backend/src/deals/deal.entity.ts`
- `backend/src/deals/deal.service.ts`
- `backend/src/market-price/market-price.entity.ts`
- `backend/src/market-price/market-data.service.ts`
- `backend/src/medicine-sellers/medicine.entity.ts`
- `backend/src/medicine-sellers/catalog.service.ts`
- `backend/src/medicine-sellers/seller.service.ts`
- `backend/src/agents/agent-action.entity.ts`
- `backend/src/agents/agent.service.ts`
- `backend/src/admin/admin-content.entity.ts`
- `backend/src/admin/admin.service.ts`
- `backend/src/alerts/alert.entity.ts`
- `backend/src/alerts/alert.service.ts`
- all related NestJS module files

### Important transaction behavior

Listing quantity reservation and deal confirmation use a single PostgreSQL transaction with a pessimistic row lock. This prevents two concurrent buyers from reserving more than the available listing quantity.

### Configuration

The backend accepts either:

- `DATABASE_URL`, or
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME`.

Additional settings:

- `DB_SSL`
- `DB_SYNCHRONIZE`
- `DB_MIGRATIONS_RUN`
- `DB_LOGGING`
- `DB_POOL_MIN`
- `DB_POOL_MAX`
- `DB_CONNECTION_TIMEOUT_MS`
- `DB_IDLE_TIMEOUT_MS`

`DB_SYNCHRONIZE=true` is restricted to non-production environments. Production should use migrations.

### How Flutter uses it

Flutter continues calling the existing backend routes such as:

- `POST /user`
- `POST /user/login-user`
- `GET /user/get-my-profile`
- `GET /goods`
- `GET /market-prices/latest`
- `GET /listings`
- `POST /listings`
- `GET /offers/mine`
- `GET /deals/mine`

The route prefix was not changed, preserving compatibility with the current Flutter data sources. Responses include both `id` and `_id` during the transition.

### How Next.js uses it

The existing admin routes remain available:

- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/listings`
- `GET /admin/deals`
- `GET /admin/prices`
- `GET /admin/goods`
- `GET /admin/inventory`

No frontend route rewrite is required solely because of the database change.

### Packages

Added:

- `@nestjs/typeorm`
- `typeorm`
- `pg`
- `pg-connection-string`

Removed:

- `@nestjs/mongoose`
- `mongoose`

### Verification

- `npm run build` — PASS
- `npm test -- --runInBand` — PASS, 1 suite and 1 test
- Live `npm run start` — PASS
- PostgreSQL connection message — `PostgreSQL connected successfully`
- Nest startup message — `Nest application successfully started`

### Known limitations

- Formal TypeORM migration files have not yet been generated. The current development database can use `DB_SYNCHRONIZE=true`.
- Existing automated tests are minimal and do not yet cover every repository or transaction.
- PostgreSQL Row-Level Security and tenant tables are not implemented yet.

### Rollback

Use Git to revert the PostgreSQL migration commit. MongoDB packages and source code were removed, so rollback without Git would require restoring the previous Mongoose entities, modules, and services.

---

## FEATURE-002 — Shared Backend Library and Global Error Structure

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected application:** NestJS backend
- **Related checklist:** `done.md` section 32

### What was implemented

Reusable backend infrastructure was placed under `backend/src/lib`:

- PostgreSQL database module
- shared base entity
- global exception filter
- JWT auth guard
- roles decorator
- roles guard
- MinIO/S3-compatible storage service
- global storage module

The global exception filter handles NestJS HTTP errors and common PostgreSQL errors. Unique violations return HTTP 409 and foreign-key violations return a safe HTTP 400 response.

Error shape:

```json
{
  "success": false,
  "statusCode": 409,
  "error": "Conflict",
  "message": "A record with the same unique value already exists",
  "path": "/user",
  "method": "POST",
  "timestamp": "ISO_DATE",
  "requestId": "optional-request-id"
}
```

### Files

- `backend/src/lib/filters/all-exceptions.filter.ts`
- `backend/src/lib/auth/auth.guard.ts`
- `backend/src/lib/auth/roles.decorator.ts`
- `backend/src/lib/auth/roles.guard.ts`
- `backend/src/lib/storage/minio.service.ts`
- `backend/src/lib/storage/storage.module.ts`
- `backend/src/main.ts`

### Authentication usage

Controllers may use the shared guard and roles metadata. The guard accepts:

- `Authorization: Bearer <token>`
- legacy `access_token: <token>`

The legacy header remains supported for current clients.

### MinIO usage

Inject `MinioService` into a backend service/controller. It supports:

- upload to an S3-compatible MinIO bucket
- UUID-based object keys
- signed private read URLs
- delete by object key
- optional public bucket mode

Required environment variables:

- `MINIO_URL`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_REGION`
- `MINIO_PUBLIC_URL`
- `MINIO_PUBLIC_BUCKET`

When MinIO is not configured, the backend starts normally and storage operations return service-unavailable responses. Runtime verification produced the expected warning that MinIO was not configured.

### Additional packages installed

- `@aws-sdk/s3-request-presigner`
- `@nestjs/terminus`
- `nestjs-pino`
- `pino-http`
- `prom-client`
- `zod`
- `uuid`
- `file-type`
- `mime-types`
- `qrcode`
- `pdfkit`
- `@google/genai`
- `ioredis`

Some are foundations for later features and are not themselves proof that those future features are implemented.

### Verification

- Backend TypeScript build — PASS
- Backend live startup — PASS
- Global module initialization — PASS

### Known limitations

- MinIO credentials were not configured, so a real upload was not tested.
- Request-ID middleware has not yet been implemented; the filter includes it when available.
- Metrics, Redis, Gemini, Qdrant, QR invoice, and PDF invoice packages are installed but their complete services are not implemented yet.

---

## FEATURE-003 — Next.js Axios and React Query Foundation

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected application:** Next.js admin panel
- **Related checklist:** `done.md` section 32

### What was implemented

A reusable typed API layer was created based on the referenced `api-hooks` project pattern, with safer React client boundaries and centralized error normalization.

Files:

- `frontend/api-hooks/api-client.ts`
- `frontend/api-hooks/query-provider.tsx`
- `frontend/api-hooks/use-api-query.ts`
- `frontend/api-hooks/use-api-mutation.ts`
- `frontend/app/layout.tsx`

### How to use a query

```tsx
const query = useApiQuery<UserResponse>(
  ["admin", "users"],
  "/admin/users?limit=100",
)
```

The hook supports React Query caching, stale time, garbage-collection time, transient retry behavior, and Axios cancellation through `AbortSignal`.

### How to use a mutation

```tsx
const updateUser = useApiMutation<UserResponse, UpdateUserInput>({
  method: "PATCH",
  url: (input) => `/admin/users/${input.id}`,
  body: ({ id: _id, ...body }) => body,
  invalidateKeys: [["admin", "users"]],
  successMessage: "User updated",
})
```

### Authentication

The Axios request interceptor reads `access_token` from browser local storage and sends it as a Bearer token. A future auth revision should prefer secure HTTP-only cookies for web sessions.

### Packages

- `@tanstack/react-query`
- `@tanstack/react-query-devtools`
- `axios`
- `sonner`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `react-dropzone`
- `recharts`
- `@tanstack/react-virtual`

### Verification

- `npm run lint` — PASS
- `npm run build` — PASS
- Next.js TypeScript validation — PASS
- Static page generation — PASS

### Known limitations

- Existing admin components still use the previous `apiRequest` helper and can be migrated to the new hooks feature by feature.
- Token storage has not yet been migrated to HTTP-only cookies.

---

## FEATURE-004 — Flutter Platform Package Foundation

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected application:** Flutter mobile app
- **Related checklist:** `done.md` section 32

### What was implemented

The packages needed for planned online voice, local siren notifications, network-aware cache/sync, background work, monitoring, recording, and file selection were installed.

Added packages:

- `speech_to_text`
- `flutter_tts`
- `audio_session`
- `just_audio`
- `flutter_local_notifications`
- `timezone`
- `connectivity_plus`
- `device_info_plus`
- `wakelock_plus`
- `workmanager`
- `sentry_flutter`
- `record`
- `mime`
- `file_picker`

### How Flutter uses them

These packages are now available through `farmer/pubspec.yaml`, but feature services and native platform configuration must be implemented before production use. Planned uses include:

- voice input with `speech_to_text`
- spoken responses with `flutter_tts`
- audio focus with `audio_session`
- siren/audio playback with `just_audio`
- critical local presentation with `flutter_local_notifications`
- timezone-correct alert scheduling
- connectivity-aware cache refresh
- manufacturer/version diagnostics
- carefully scoped background sync
- crash/performance monitoring
- optional raw audio capture and file selection

### Verification

- dependency resolution — PASS
- `flutter analyze` — PASS, no issues
- `flutter test` — PASS, all tests passed

### Known limitations

- Android and iOS notification, microphone, background-task, and alarm configuration has not been added yet.
- OneSignal-to-local-siren integration is not implemented yet.
- Voice UI and service classes are not implemented yet.
- Sentry DSN/configuration is not set.


---

## FEATURE-005 — NestJS Resource Structure, Swagger, Provider Settings, and Client Data-Flow Hardening

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected applications:** NestJS backend, Next.js admin, Flutter mobile app
- **Related checklist:** `done.md` section 33

### NestJS resource structure

Backend resources now follow the standard NestJS resource layout more closely. Each converted resource keeps DTOs and TypeORM entities in dedicated folders:

```text
resource/
├─ dto/
├─ entities/
├─ resource.controller.ts
├─ resource.service.ts
└─ resource.module.ts
```

Applied to:

- user
- goods
- listings
- deals
- agents
- market-price
- medicine-sellers
- admin
- alerts

All import paths were updated and the backend compiled successfully after the move.

### Swagger

Swagger is available at:

- UI: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/docs-json`

The Nest Swagger CLI plugin is enabled in `backend/nest-cli.json`, with class-validator schema generation and `.dto.ts` discovery. Live validation found 53 documented API paths and 24 generated schemas, including `CreateUserDto`, `CreateListingDto`, and `UpdateIntegrationSettingsDto`. Bearer authentication is included in the OpenAPI document.

### Provider settings managed from Next.js

A new **AI & providers** section was added to the Next.js admin panel. It manages:

- multiple Gemini API keys;
- Gemini text model;
- Gemini vision model;
- image embedding provider/model for Qdrant;
- Windy API key;
- OneSignal app ID;
- OneSignal REST API key.

The browser does not retain or directly use provider REST secrets. The Next.js form sends them to protected NestJS endpoints:

- `GET /admin/integrations`
- `PATCH /admin/integrations`

NestJS encrypts the settings with AES-256-GCM and stores them in PostgreSQL in `integration_settings`. Read responses are masked. The backend-only `CONFIG_ENCRYPTION_KEY` protects the encrypted values and must not be exposed to Flutter or browser code.

The same Gemini key pool can be used for text and image requests. Text and vision model identifiers remain separately configurable because requests may use different Gemini models. Image embedding settings remain separate because Qdrant requires vector embeddings, not only a generated image-analysis answer.

### Flutter Dio helper

`farmer/lib/core/network/network_client.dart` was replaced with a hardened helper based on the supplied `dio-helper.dart` pattern.

It now provides:

- validated API base URL;
- automatic Android emulator localhost conversion to `10.0.2.2`;
- HTTPS enforcement outside local development;
- Bearer and legacy access-token headers;
- timeout configuration;
- debug-only request/response logging;
- structured backend error parsing;
- `ApiException` with status, details, and request ID;
- one-time redirect to login after HTTP 401;
- local session cleanup on unauthorized responses.

### Verified end-to-end data flow

Live PostgreSQL-backed HTTP tests passed for:

- root API;
- Swagger UI and JSON;
- goods and categories;
- market prices;
- listings;
- guidance;
- medicines;
- unauthorized protected-route behavior;
- farmer registration;
- farmer login;
- authenticated profile retrieval;
- location update;
- listing creation;
- own-listing retrieval;
- public listing search;
- structured validation errors;
- admin login;
- admin dashboard;
- encrypted integration-setting save and read.

The smoke test created one test farmer and one test rice listing in the development PostgreSQL database.

### Validation commands

- Backend `npm run lint` — PASS
- Backend `npm run build` — PASS
- Backend `npm test -- --runInBand` — PASS
- Next.js `npm run lint` — PASS
- Next.js `npm run build` — PASS
- Flutter `flutter analyze` — PASS, no issues
- Flutter `flutter test` — PASS

### Known limitations

- Automated backend coverage is still minimal; most flow validation in this revision was performed through live HTTP smoke tests.
- Production TypeORM migration files still need to be generated and reviewed.
- Provider settings UI is implemented, but actual Gemini, Windy, OneSignal, and Qdrant provider services remain separate future features.
- MinIO remains disabled until credentials are configured.


---

## FEATURE-006 — Dashboard Route Foundation and Degraded Optional Infrastructure

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected applications:** Next.js admin/web, NestJS backend
- **Related checklist:** `done.md` section 34

### What was implemented

Next.js web workspaces now use a `/dashboard/...` route convention. The current admin application is available at `/dashboard/admin`. The root and `/dashboard` redirect there during the admin-first development stage.

Supported role route foundations:

- `/dashboard/farmer`
- `/dashboard/buyer`
- `/dashboard/wholesale-buyer`
- `/dashboard/seller`
- `/dashboard/machinery-seller`
- `/dashboard/medicine-seller`
- `/dashboard/agent`
- `/dashboard/agriculture-specialist`
- `/dashboard/veterinary-doctor`
- `/dashboard/government-officer`
- `/dashboard/support`

The role pages are route foundations only; their full business modules are not yet implemented.

### Files

- `frontend/app/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/admin/page.tsx`
- `frontend/app/dashboard/[role]/page.tsx`

### Redis and Qdrant resilience

A global optional-infrastructure service was added. Redis and Qdrant are checked during startup, but failure does not stop the backend.

Behavior:

- PostgreSQL failure remains fatal because it is the system of record.
- Redis failure logs an actionable error and leaves Redis-dependent functionality unavailable.
- Qdrant failure logs an actionable error and leaves vector matching unavailable.
- Feature services may query availability before using either dependency.
- Future diagnosis logic will use Gemini fallback when Qdrant is unavailable.

Files:

- `backend/src/lib/infrastructure/infrastructure.module.ts`
- `backend/src/lib/infrastructure/optional-infrastructure.service.ts`
- `backend/src/app.module.ts`

### How it was tested

The backend was started with deliberately invalid URLs:

```text
REDIS_URL=redis://127.0.0.1:6399
QDRANT_URL=http://127.0.0.1:6399
```

Observed result:

- Redis connection errors were logged.
- Qdrant connection errors were logged.
- PostgreSQL connected.
- NestJS completed startup.
- `GET /` returned HTTP 200.

### Gemini keys

The previous hard maximum of 20 Gemini API keys was removed from the settings DTO. The Next.js form can continue adding key inputs. The keys are still encrypted in PostgreSQL and masked on read.

This is storage/UI foundation only. Key health, deduplication, routing, cooldown and failover logic remain future implementation work.

### Validation

- Backend `npm run lint` — PASS
- Backend `npm run build` — PASS
- Backend `npm test -- --runInBand` — PASS
- Next.js `npm run lint` — PASS
- Next.js `npm run build` — PASS

### Known limitations

- Role dashboards are placeholders except for the existing admin dashboard.
- Role-aware authentication redirect is not implemented yet.
- Redis fallback is not yet wired into each cache/query service.
- Qdrant-to-Gemini fallback is planned but not yet connected to a production AI service.
- `DB_SYNCHRONIZE=true` is enabled for the requested development workflow; production still needs migrations.


---

## FEATURE-007 — Flutter Core Network, Toast, Query/Mutation, and AutoRoute Generation

- **Status:** VERIFIED
- **Completed:** 2026-07-17
- **Affected application:** Flutter mobile app

### Implemented

The reference Flutter project under `supporter_club/lib/core` and `supporter_club/lib/router` was reviewed. The useful patterns were adapted to AgriVision rather than copied blindly.

Implemented files:

- `farmer/lib/core/errors/failure.dart`
- `farmer/lib/core/network/dio_failure.dart`
- `farmer/lib/core/network/query_wrapper.dart`
- `farmer/lib/core/network/mutation_wrapper.dart`
- `farmer/lib/core/utils/app_toast.dart`
- regenerated `farmer/lib/core/router/app_router.gr.dart`

### Behavior

- Global success, error, warning, and info toasts.
- Typed server, validation, unauthorized, and network failures.
- Dio timeout, DNS, certificate, cancellation, offline, and structured backend error mapping.
- Cached-query wrapper for typed GET requests.
- Mutation wrapper for POST, PUT, PATCH, and DELETE.
- Automatic success/error toast handling.
- AutoRoute generated route classes remain under `app_router.gr.dart`.

### Validation

- `dart run build_runner build` — PASS, generated outputs written.
- `flutter analyze` — PASS, no issues.
- `flutter test` — PASS.
