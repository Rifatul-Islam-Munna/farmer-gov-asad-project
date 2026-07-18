# AgriVision AI â€” Master Implementation Plan

> Source of truth for implementation of the Flutter + NestJS + Next.js agriculture platform.
>
> Scope source: `Framing project (1).pdf` plus the latest owner instructions.
>
> Explicit exclusions: **Wallet System**, **Future AI Features**, Laravel, separate Python/FastAPI services, TensorFlow/PyTorch/YOLO as required production dependencies, Elasticsearch, and any replacement technology that conflicts with the current Flutter + NestJS + Next.js project.

---

## 1. Product Vision

AgriVision AI is a Bangladesh-focused smart agriculture platform that connects farmers, buyers, sellers, agriculture specialists, veterinary doctors, students/volunteers, and public users. It combines crop and livestock management, disease assistance, weather intelligence, alerts, marketplace operations, expert consultation, voice interaction, administration, and AI-assisted image matching.

Primary client applications:

- `farmer/` â€” Flutter Android/iOS application for farmers and other mobile users.
- `frontend/` â€” Next.js web application, primarily the admin/control portal and future browser workflows.
- `backend/` â€” NestJS REST/WebSocket API and all core business logic.

Primary data/infrastructure components:

- PostgreSQL for canonical transactional and relational business data through TypeORM.
- Qdrant for vector embeddings and similarity search.
- Object storage compatible with S3 for original images, thumbnails, documents, invoices, and generated assets.
- Redis/BullMQ for queues, retries, throttling support, scheduled work, and background processing.
- Gemini as the first AI provider, routed through a provider-neutral AI gateway with an admin-managed encrypted key pool and future support for OpenAI or custom providers.
- OneSignal as the mandatory remote push provider, with local native presentation and siren handling in Flutter.

---

## 2. Non-Negotiable Architecture Decisions

### 2.1 Technology boundaries

- Flutter remains the mobile client.
- NestJS remains the only application backend and AI orchestration layer.
- Next.js remains the web/admin client.
- Qdrant access must occur through NestJS, not directly from Flutter or browser code.
- Secrets must never be shipped to Flutter or exposed in Next.js client bundles.
- All AI calls must pass through a provider abstraction.
- All long-running image ingestion and vectorization jobs must run asynchronously through BullMQ.
- PostgreSQL stores canonical business records and Qdrant stores searchable vector representations plus lightweight identifiers.

### 2.2 Explicitly excluded from current plan

- Wallet, bonus withdrawal, referral income, stored balance, or wallet transaction ledger.
- Drone integration.
- Satellite crop monitoring.
- IoT smart sensors.
- Soil analyzer hardware.
- Automatic irrigation control.
- Smart greenhouse automation.
- Carbon credit tracking.
- Blockchain crop traceability.
- AI farm insurance risk assessment.
- Any architecture migration to Laravel.
- Any mandatory Python microservice.

### 2.3 Deferred but compatible

The design must permit future additions without requiring a rewrite:

- OpenAI provider.
- Local/custom vision or language model provider.
- Small object-detection model for pre-classification.
- Additional vector embedding models.
- Alternative object storage providers.
- SMS, WhatsApp, and voice-call gateways.

---

## 3. Repository Structure

Recommended ownership:

```text
project-gov-farmer/
â”œâ”€ backend/                 # NestJS API, jobs, AI gateway, Qdrant integration
â”œâ”€ farmer/                  # Flutter mobile app
â”œâ”€ frontend/                # Next.js admin and web portal
â”œâ”€ scripts/                 # setup, migration, seed, validation scripts
â”œâ”€ plan.md                  # implementation specification
â”œâ”€ done.md                  # audited completion checklist
â””â”€ README.md                # local setup and project overview
```

Recommended backend modules:

```text
backend/src/
â”œâ”€ auth/
â”œâ”€ users/
â”œâ”€ roles/
â”œâ”€ farms/
â”œâ”€ crops/
â”œâ”€ livestock/
â”œâ”€ poultry/
â”œâ”€ fisheries/
â”œâ”€ diagnoses/
â”œâ”€ image-profiles/
â”œâ”€ ai/
â”‚  â”œâ”€ providers/
â”‚  â”œâ”€ routing/
â”‚  â”œâ”€ prompts/
â”‚  â”œâ”€ moderation/
â”‚  â””â”€ schemas/
â”œâ”€ vectors/
â”œâ”€ uploads/
â”œâ”€ weather/
â”œâ”€ alerts/
â”œâ”€ marketplace/
â”œâ”€ orders/
â”œâ”€ invoices/
â”œâ”€ consultations/
â”œâ”€ chat/
â”œâ”€ notifications/
â”œâ”€ news/
â”œâ”€ government-services/
â”œâ”€ admin/
â”œâ”€ analytics/
â”œâ”€ jobs/
â””â”€ common/
```

---

## 4. Roles and Permissions

Canonical roles:

- `FARMER`
- `WHOLESALE_BUYER`
- `STUDENT_VOLUNTEER`
- `AGRICULTURE_SPECIALIST`
- `VETERINARY_DOCTOR`
- `SELLER`
- `PUBLIC_USER`
- `ADMIN`
- `SUPER_ADMIN`

Rules:

- Every protected endpoint uses JWT authentication.
- Role guards are enforced in NestJS, never only in UI.
- Account verification status is separate from role.
- Specialist/veterinary credentials require admin approval.
- Seller status requires approval before publishing restricted products.
- Student/volunteer actions are auditable and must record the assisted farmer.
- Public users can browse public marketplace/news/weather but cannot access private farm data.

Audit fields on sensitive records:

- `createdBy`
- `updatedBy`
- `ownerId`
- `assistedByUserId`
- `approvedBy`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `requestId`

---

## 5. Core Data Model

### 5.1 User and identity

`User`

- id
- fullName
- phone
- email
- passwordHash
- roles[]
- language: `bn | en`
- verificationStatus
- accountStatus
- district/upazila/union/address
- geo point
- profile image
- notification preferences
- voice preferences

### 5.2 Farm profile

`Farm`

- ownerId
- name
- location and geo coordinates
- total area and unit
- crop areas
- cow/goat/chicken/duck counts
- fish ponds
- income summary
- expense summary
- calculated profit
- farm health score
- latest analysis summary

`FarmMetricSnapshot`

- farmId
- metric type
- value
- unit
- source: manual/API/AI
- capturedAt

### 5.3 Crop farming

`CropCycle`

- farmId
- crop type and variety
- plot name/area
- planting date
- expected harvest date
- growth stage
- irrigation status
- fertilizer status
- pest risk
- disease risk
- health score
- harvest readiness
- status

`CropObservation`

- cropCycleId
- images[]
- notes
- water level
- soil moisture (manual or external)
- symptoms
- capturedAt

`FertilizerPlan`, `IrrigationPlan`, `PestActionPlan`, `HarvestForecast`

### 5.4 Livestock

`Animal`

- farmId
- species: cow/goat/buffalo/sheep
- tag/name
- breed
- sex
- birth date
- weight history
- health score
- vaccination schedule
- breeding/heat/pregnancy records
- milk/wool production where applicable
- feed plan
- medicine reminders

### 5.5 Poultry

`PoultryBatch`

- farmId
- type: chicken/duck/other
- purpose: broiler/layer
- shed number
- bird count
- mortality log
- feed schedule
- vaccine schedule
- egg production
- growth measurements
- temperature/humidity values entered manually or through supported APIs

### 5.6 Fisheries

`Pond`

- farmId
- name
- area/depth
- fish species
- stocking date/count
- water temperature
- pH
- dissolved oxygen
- ammonia
- feed schedule
- growth records
- disease observations
- harvest prediction

`RiverSafetySnapshot`

- location
- river level
- tide
- rainfall
- wind
- storm/lightning/high-wave risk
- fishing restriction status
- danger score
- source timestamps

### 5.7 Diagnosis and image profiles

`DiagnosisRequest`

- userId/farmId/entityId
- domain: crop/livestock/poultry/fish
- submitted images
- symptoms
- location/context
- status
- matchedProfileId
- vector confidence
- AI result
- disclaimer
- specialist review status

`ImageProfile`

- name and canonical label
- domain/category/species/crop
- owner/admin creator
- description
- expected image count
- accepted image count
- embedding model/version
- centroid vector version
- quality score
- profile status: draft/processing/active/archived
- match thresholds

`ImageProfileAsset`

- imageProfileId
- original URL
- normalized URL
- checksum
- width/height
- quality flags
- embedding point ID
- ingestion status/error

### 5.8 Marketplace

`Listing`

- seller/owner
- category: crop/fish/livestock/poultry/egg/milk/honey/vegetable/fruit/machinery/seed/fertilizer/pesticide/feed/medicine/equipment
- title and descriptions (bn/en)
- quantity/unit
- price and negotiable status
- location
- photos
- stock/status
- moderation status
- AI-generated metadata provenance

`Order`, `OrderItem`, `Delivery`, `Review`, `Rating`, `Deal/Negotiation`, `Invoice`

No wallet fields are included.

### 5.9 Consultation

`SpecialistProfile`, `AvailabilitySlot`, `Appointment`, `ConsultationSession`, `Prescription`, `ChatThread`, `ChatMessage`

---

## 6. API and Data Flow

### 6.1 General request flow

```text
Flutter / Next.js
  -> HTTPS request with JWT
  -> NestJS validation + role guard + throttling
  -> service layer
  -> PostgreSQL / Qdrant / storage / external API
  -> standardized response
  -> client state update
```

Response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "requestId": "uuid"
}
```

Error envelope:

```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Localized user-safe message",
    "details": []
  },
  "requestId": "uuid"
}
```

### 6.2 Upload flow

1. Client requests an upload session from NestJS.
2. NestJS validates file count, MIME type, intended entity, and permissions.
3. NestJS returns presigned S3-compatible upload URLs or accepts multipart upload for small files.
4. Client uploads originals.
5. Client confirms completion with uploaded object keys.
6. NestJS creates database records and enqueues processing.
7. Worker validates actual MIME, strips risky metadata, corrects orientation, creates thumbnails, and calculates checksum.
8. Processing status is available through polling and WebSocket events.

### 6.3 Image-profile creation flow (10â€“500 images)

1. Admin/specialist creates an `ImageProfile` with a canonical label.
2. Client uploads 10â€“500 raw images in batches; recommended batch size is 10â€“25.
3. Backend deduplicates with checksum/perceptual hash.
4. Low-resolution, corrupt, unsupported, or extreme-aspect-ratio files are rejected.
5. Sharp creates normalized images and thumbnails.
6. BullMQ creates one embedding job per accepted image.
7. AI embedding adapter generates a fixed-dimensional vector.
8. NestJS upserts each vector into Qdrant with payload:
   - `profileId`
   - `assetId`
   - `label`
   - `domain`
   - `modelVersion`
   - `qualityScore`
9. Backend computes a normalized centroid vector for the profile and stores it as a separate Qdrant point.
10. Profile is activated only after minimum accepted samples and quality checks pass.
11. Rebuilding with a new embedding model creates a new version; the old version remains searchable until cutover.

### 6.4 Similarity search flow

1. User uploads one or more query images.
2. Backend normalizes images and generates vectors using the same active embedding model.
3. Qdrant searches:
   - nearest profile centroids first
   - optional nearest sample images for evidence
4. Backend aggregates similarity across query images.
5. Confidence is calibrated, not treated as raw cosine similarity.
6. Suggested initial decision policy:
   - `>= 0.85`: high-confidence likely match
   - `0.70â€“0.8499`: possible match; show alternatives and request more images
   - `< 0.70`: unknown/insufficient confidence
7. Thresholds must be configurable per domain/profile and validated against a labeled test set.
8. The response includes top matches, confidence, number of supporting samples, and a safety disclaimer.
9. For disease or medical-like conclusions, similarity results are evidence only; Gemini generates an explanatory response and a specialist review route remains available.

Important: â€œ70â€“80%â€ must be displayed as calibrated confidence only after evaluation. Do not label raw Qdrant cosine score as a literal probability.

---

## 7. Qdrant Design

Recommended collections:

- `agri_image_samples_v1`
- `agri_image_profiles_v1`

Each collection must use a named vector to support future migrations:

```json
{
  "image_embedding": {
    "size": 768,
    "distance": "Cosine"
  }
}
```

The actual vector size is configured from the selected embedding model, never hard-coded across services.

Payload indexes:

- profileId keyword
- domain keyword
- label keyword
- modelVersion keyword
- status keyword
- tenant/owner ID where needed

Operations:

- create collection during deployment/setup, not per request
- health check at startup
- idempotent upsert
- payload filtering by active model version and domain
- scheduled snapshots/backups
- rebuild command for model migration
- deletion synchronization when PostgreSQL records are soft-deleted, archived, or permanently removed

Qdrant credentials remain in backend environment variables only.

---

## 8. AI Provider Gateway

### 8.1 Provider-neutral contract

Define interfaces such as:

```ts
interface AiTextProvider {
  generateText(input: AiTextRequest): Promise<AiTextResponse>;
}

interface AiVisionProvider {
  analyzeImages(input: AiVisionRequest): Promise<AiVisionResponse>;
}

interface EmbeddingProvider {
  embedImage(input: ImageEmbeddingRequest): Promise<number[]>;
  embedText(input: TextEmbeddingRequest): Promise<number[]>;
}
```

Provider implementations:

- `GeminiProvider` â€” enabled now.
- `OpenAiProvider` â€” placeholder/disabled until configured.
- `CustomHttpProvider` â€” future configurable internal model endpoint.

Business modules must depend on the interface/gateway, never import Gemini SDK directly.

### 8.2 Multi-key Gemini routing (5â€“10 keys)

Environment configuration:

```env
AI_DEFAULT_PROVIDER=gemini
# Gemini keys are encrypted and managed from the admin dashboard
GEMINI_TEXT_MODEL=...
GEMINI_VISION_MODEL=...
AI_REQUEST_TIMEOUT_MS=45000
AI_MAX_RETRIES=2
```

Key-pool behavior:

- Load the encrypted key pool from PostgreSQL through the backend integration-settings service.
- Never log full keys.
- Maintain per-key state: healthy, cooling-down, disabled, last error, request count.
- Use weighted round-robin or least-recently-used routing.
- Rotate on provider rate-limit/quota errors only when the request is safe to retry.
- Apply exponential backoff with jitter.
- Use a circuit breaker after repeated failures.
- Distinguish permanent request errors from key-specific quota errors.
- Cap retries to prevent 5â€“10 duplicate billable calls.
- Track provider/model/key alias, latency, token usage, and failure category.
- Admin can view health but never retrieve raw keys.

### 8.3 Structured outputs

All critical AI responses must validate against a schema. Crop diagnosis example fields:

- likely condition
- alternative conditions
- confidence band
- possible causes
- severity: low/medium/high
- organic remedy options
- chemical remedy options
- safety warnings
- prevention
- when to consult an expert
- source context and model metadata

Never trust unvalidated free-form JSON.

### 8.4 Safety and agricultural disclaimers

- AI must not guarantee a diagnosis.
- Chemical recommendations require dosage context, crop, stage, location, and safety warnings.
- Veterinary advice must direct urgent cases to a veterinary doctor.
- Emergency weather advice must clearly show source timestamp.
- AI outputs must be marked as generated and stored with provider/model/version.

---

## 9. Functional Modules

## 9.1 Authentication and onboarding

- Phone/email login.
- OTP-ready design.
- JWT access and refresh tokens.
- Role selection and approval workflow.
- Profile and location.
- Bangla/English language selection.
- Secure token storage in Flutter.
- Account suspension and deletion.

## 9.2 Crop farming

- Crop cycle CRUD.
- Image-based crop disease assistance.
- Possible cause, severity, remedies, medicine suggestions, prevention.
- Crop health dashboard.
- Growth stage.
- Water status and irrigation reminders.
- Fertilizer recommendations.
- Pest detection/assistance.
- Harvest readiness and prediction.
- Yield tracking/estimation using entered historical data and AI assistance.
- Weather-linked actions.

## 9.3 Livestock

- Cow, goat, buffalo, sheep records.
- Image-assisted disease triage.
- Health score.
- Vaccination schedule.
- Heat/breeding and pregnancy tracking.
- Milk/wool production.
- Feed calculator/plan.
- Weight tracking.
- Medicine reminders.
- Veterinary consultation and emergency alerts.

## 9.4 Poultry

- Batch/shed dashboard.
- Disease assistance.
- Mortality tracking.
- Feed and vaccine schedules.
- Egg production.
- Broiler growth.
- Manual/API temperature and humidity records.
- Threshold-based alerts.

## 9.5 Fisheries

- Pond dashboard.
- Water temperature, pH, dissolved oxygen, ammonia.
- Feed reminders.
- Fish growth and disease assistance.
- Harvest prediction.
- River fishermen safety module using weather/river/restriction data.
- Danger score and emergency voice alert.

## 9.6 Weather intelligence

- Provider adapter for weather API.
- Current weather and forecast.
- Heavy rain, lightning, cyclone/storm, flood, river rise, hail, heat, cold, drought, wind, humidity.
- Location-aware alerts.
- Source and forecast timestamps.
- Cached responses and provider fallback.
- Alert rules mapped to actionable farm advice.

## 9.7 Smart alerts

- In-app notification center.
- Push notification.
- Voice notification/Text-to-Speech on supported device workflows.
- Emergency severity and red alert UI.
- Repeat policy with user safety limits.
- Acknowledgement state.
- SMS/WhatsApp adapters remain optional and disabled until configured.

## 9.8 Voice assistant

- Bangla and English.
- Speech-to-text from device/provider adapter.
- Intent routing: crop help, camera open, fertilizer, weather, marketplace, price, consultation.
- Text-to-speech response.
- Confirmation before destructive/financial/order actions.
- Typed fallback.
- Conversation history and privacy controls.

## 9.9 Marketplace and e-commerce

- Listings for farm outputs, livestock, poultry, fish, equipment, seeds, fertilizers, pesticides, feeds, and medicine.
- Search, filters, location, voice search.
- Cart, checkout, order tracking, delivery status.
- Direct buyer/seller negotiation and chat.
- Bulk purchase and optional auction workflow.
- Reviews and ratings.
- AI image cleanup/background removal adapter.
- AI description generation.
- Market price suggestion.
- Best selling time/price recommendation with clear confidence and source.
- Payments through external gateway directly against orders; no internal wallet.

## 9.10 Market price intelligence

- District/upazila commodity price records.
- Source and collection timestamp.
- Trend chart.
- AI explanation of price trend.
- Sell-now/wait suggestion clearly identified as advisory.
- Admin correction and source audit.

## 9.11 Expert consultation

- Agriculture specialists and veterinary doctors.
- Appointment booking.
- Availability.
- Chat.
- Voice/video integration through provider adapter.
- Prescription/document upload.
- Consultation history.
- Emergency routing.

## 9.12 News and government services

- Agriculture news.
- Government incentives.
- Agriculture office notices.
- New technology content.
- Subsidy, loan, farmer registration, and government project links/instructions.
- Admin CMS with publish schedule and audience targeting.

## 9.13 Invoice system

- Farmer/buyer/seller invoices.
- Server-generated PDF.
- QR code referencing a verification endpoint.
- Printable web view.
- Immutable invoice number and audit trail.

## 9.14 Admin panel

- User/farmer management.
- Role and verification approvals.
- Marketplace/product moderation.
- Weather and alert monitoring.
- AI provider/model/key-health dashboard.
- Reports and analytics.
- Payment/order oversight.
- Advertisements/CMS.
- Support tickets.
- Image-profile creation, upload progress, quality review, activation, archive, and re-indexing.
- Audit log viewer.

## 9.15 Community and planning extras from the PDF

- Community forum.
- Live market rates.
- Farm calendar.
- Production and profit/loss reports.
- Offline mode with queued sync for selected records.

---

## 10. Client Responsibilities

### Flutter

- Authentication and secure token lifecycle.
- Mobile-first role-aware navigation.
- Camera/gallery image capture and batch upload.
- Upload progress, retry, and cancellation.
- Farm/crop/livestock/poultry/fish dashboards.
- Alerts, push notifications, voice playback.
- Marketplace and consultation workflows.
- Offline cache for selected read data and queued drafts.
- Never call Gemini/Qdrant directly.

### Next.js

- Admin authentication and RBAC.
- Management dashboards.
- Image-profile bulk uploader supporting 10â€“500 files with chunking, progress, failed-file retry, and duplicate reporting.
- AI configuration health view without exposing secrets.
- Moderation, CMS, reports, alerts, and audit logs.
- Server-side API proxy only where justified; canonical business API remains NestJS.

### NestJS

- All authorization and business rules.
- PostgreSQL persistence through TypeORM.
- Upload orchestration.
- Background jobs.
- Gemini and future provider routing.
- Qdrant indexing/search.
- Notification dispatch.
- WebSocket progress events.
- Swagger/OpenAPI documentation.
- Observability, audit, validation, rate limits, and error handling.

---

## 11. Security, Privacy, and Reliability

- Validate all DTOs with whitelist and forbid unknown fields.
- Helmet, CORS allowlist, compression, request size limits.
- JWT rotation and refresh-token revocation.
- Password hashing with bcrypt and safe cost.
- Per-route throttling; stricter limits for AI and uploads.
- MIME sniffing, extension checks, image decode validation.
- Malware scanning hook for documents.
- Presigned URLs with short expiry.
- Private object buckets by default.
- Signed read URLs.
- Encrypt secrets and use deployment secret manager.
- Remove EXIF GPS unless explicitly required and consented.
- User consent for AI processing and retention.
- Deletion workflow coordinates PostgreSQL records, storage objects, and Qdrant points.
- Idempotency keys for checkout, payments, and ingestion confirmation.
- Centralized logs with request IDs and secret redaction.
- PostgreSQL backup/restore and Qdrant snapshot procedures.
- Graceful degradation when AI/Qdrant/weather providers are unavailable.

---

## 12. Testing Strategy

### Backend

- Unit tests for services, guards, provider routing, confidence aggregation.
- Integration tests with a PostgreSQL test database.
- Qdrant integration tests against test collection.
- Upload validation tests.
- AI provider contract tests using mocks.
- E2E tests for auth, listings, diagnosis, profile ingestion, and search.

### Flutter

- Widget tests for login, scanner, result, marketplace, alerts.
- Repository/data-source tests.
- Golden tests for critical Bangla layouts.
- Integration tests for upload and auth flows.

### Next.js

- Component tests for admin tables/forms/uploader.
- API client tests.
- Playwright E2E for admin login, moderation, image-profile creation and activation.

### AI/vector evaluation

Create a versioned labeled evaluation dataset containing:

- known positive images per profile
- visually similar negatives
- unknown classes
- poor-quality images
- multiple angles/backgrounds/lighting

Measure:

- top-1 accuracy
- top-3 recall
- false-positive rate
- unknown rejection rate
- confidence calibration
- performance by class/profile

Do not release a 70â€“80% confidence claim before this evaluation.

---

## 13. Delivery Phases

### Phase 0 â€” Foundation

- Normalize environment configuration.
- Complete auth/roles and API conventions.
- PostgreSQL indexes, TypeORM migration, backup, restore, and seed strategy.
- Redis/BullMQ and object storage setup.
- CI checks for backend/frontend/flutter.
- Docker Compose for local dependencies.

### Phase 1 â€” Existing MVP completion

- Stabilize current auth, marketplace, admin, alerts, market price, diagnosis demo.
- Replace demo/mock data with API-backed records.
- Add tests and API documentation.

### Phase 2 â€” AI gateway and Gemini

- Provider-neutral interfaces.
- Gemini multi-key pool.
- structured output validation.
- AI usage logging, throttling, retries, and circuit breaker.
- crop diagnosis and assistant integration.

### Phase 3 â€” Qdrant image profiles

- Image profile schema and admin UI.
- 10â€“500 image upload pipeline.
- image normalization/deduplication.
- embeddings and Qdrant upsert.
- centroid profile generation.
- similarity search and confidence aggregation.
- evaluation tools and threshold configuration.

### Phase 4 â€” Farm management

- Digital farm profile.
- crop cycles and dashboard.
- irrigation/fertilizer/pest/harvest modules.
- farm calendar and reports.

### Phase 5 â€” Weather and alerts

- weather provider.
- river/flood/storm rules.
- push and voice alerts.
- acknowledgement and emergency UX.

### Phase 6 â€” Livestock, poultry, fisheries

- records, schedules, health tracking, production, alerts, diagnosis routing.

### Phase 7 â€” Marketplace completion

- cart/checkout/order/delivery/payment.
- invoices and QR verification.
- buyer negotiation, auction option, recommendations.

### Phase 8 â€” Consultation, news, government services

- specialists, appointments, chat/video adapter, prescriptions.
- CMS and public information modules.

### Phase 9 â€” Hardening and release

- load testing.
- security review.
- disaster recovery test.
- AI/vector quality gates.
- accessibility and Bangla UX review.
- app-store and production deployment readiness.

---

## 14. Definition of Done

A task is complete only when:

- code exists in the correct app/module;
- validation and authorization are enforced server-side;
- database indexes/schema are defined;
- API is documented;
- UI includes loading, empty, error, and success states;
- tests cover primary and failure paths;
- no secrets are exposed;
- logs and audit fields are present where required;
- Bangla and English behavior is reviewed;
- build/lint/test commands pass;
- `done.md` is updated with evidence paths and validation results.

---

## 15. Required Local Environment Variables

Backend categories:

```env
NODE_ENV=
PORT=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SYNCHRONIZE=
ACCESS_TOKEN=
REFRESH_TOKEN_SECRET=
REDIS_URL=
MINIO_URL=
MINIO_REGION=
MINIO_BUCKET=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
QDRANT_URL=
QDRANT_API_KEY=
QDRANT_SAMPLE_COLLECTION=agri_image_samples_v1
QDRANT_PROFILE_COLLECTION=agri_image_profiles_v1
AI_DEFAULT_PROVIDER=gemini
# Gemini keys are stored encrypted through the admin integration settings API.
GEMINI_TEXT_MODEL=
GEMINI_VISION_MODEL=
IMAGE_EMBEDDING_PROVIDER=
IMAGE_EMBEDDING_MODEL=
WEATHER_API_BASE_URL=
WEATHER_API_KEY=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
```

Flutter/Next.js may contain only public configuration such as API base URL and public app IDs.

---

## 16. Final Scope Validation

This plan includes the PDFâ€™s current-use features:

- crop disease and crop health
- irrigation, fertilizer, pests, harvest/yield
- weather and emergency alerts
- voice assistant
- marketplace/e-commerce and price guidance
- all listed user roles
- invoices
- chatbot and consultation
- news/government services
- multilingual and notifications
- admin/CMS/reports
- community, market rates, calendar, reporting, offline mode
- crop, livestock, poultry, fisheries, river safety
- digital farm profile

This plan intentionally excludes:

- Wallet System
- the PDF section titled Future AI Features
- technologies that replace the current Flutter + NestJS + Next.js stack

This plan additionally incorporates the owner-requested Qdrant image-profile service, multi-key Gemini routing, and future provider extensibility.


---

# 17. Architecture Addendum â€” Weather, Voice, Alerts, Performance, Roles, and Nested Routing

This addendum overrides any earlier generic wording where a more specific decision is stated below.

## 17.1 Weather provider: Windy API

Windy is the selected weather provider for the first production version.

### Provider boundary

Create a backend abstraction so Windy can later be replaced or complemented without touching Flutter screens:

```ts
interface WeatherProvider {
  getCurrentWeather(input: WeatherPointRequest): Promise<CurrentWeatherResult>;
  getForecast(input: WeatherForecastRequest): Promise<WeatherForecastResult>;
  getHazards(input: WeatherHazardRequest): Promise<WeatherHazardResult>;
}
```

Implementation classes:

- `WindyWeatherProvider` â€” active provider.
- `MockWeatherProvider` â€” tests and local development.
- `FallbackWeatherProvider` â€” optional future provider.

### Windy integration rules

- Windy API keys exist only in NestJS environment variables.
- Flutter and Next.js never call Windy directly.
- Backend normalizes Windy responses to the projectâ€™s own weather DTOs.
- All weather values include:
  - provider name;
  - model name if returned;
  - latitude/longitude;
  - forecast timestamp;
  - provider data timestamp;
  - unit;
  - confidence/quality indicator when available.
- Cache forecast data by geohash/location and forecast window.
- Avoid one external request per mobile screen refresh.
- Use Redis to cache popular locations.
- Apply request coalescing so simultaneous users in one area share one Windy request.
- Store critical hazard snapshots in PostgreSQL for audit and notification decisions.
- Separate display weather from emergency alert decisions.

### Weather domains to normalize

- current temperature;
- apparent temperature;
- minimum/maximum temperature;
- precipitation and probability;
- accumulated rainfall;
- wind speed and gust;
- wind direction;
- humidity;
- pressure;
- cloud cover;
- visibility where available;
- thunderstorm/lightning indicators where available;
- severe rain;
- heat/cold stress;
- drought-supporting indicators;
- river/flood data from a separate government or hydrology adapter when Windy does not provide authoritative river-level data.

### Hazard engine

Windy supplies weather data; AgriVision owns the rules that convert weather into agricultural alerts.

```text
Windy forecast
  -> normalized weather snapshot
  -> hazard rules engine
  -> farm/crop/location context
  -> severity and recommended action
  -> notification orchestration
```

Each hazard rule must define:

- rule ID and version;
- geographic scope;
- input fields;
- threshold;
- persistence window;
- severity;
- cooldown;
- repeat behavior;
- Bangla and English message templates;
- agriculture-specific recommended action;
- expiry time.

Example hazards:

- heavy rain affecting drainage;
- strong wind affecting fruit, greenhouse structures, or river fishing;
- extreme heat affecting poultry, cattle, irrigation, and workers;
- cold stress;
- lightning risk;
- storm/cyclone risk;
- high humidity and crop disease risk;
- prolonged dry period and irrigation warning.

### Required weather packages

Backend:

- `@nestjs/axios` or native `fetch` wrapper for Windy HTTP calls;
- `class-validator` and `class-transformer` for provider DTO validation;
- `cache-manager` with Redis store;
- `@nestjs/schedule` for scheduled forecast refresh and hazard evaluation;
- BullMQ for large alert fan-out;
- `pino`/Nest logger-compatible structured logging;
- optional geospatial helper library such as `ngeohash` for location cache keys.

Flutter:

- existing `dio` for backend weather endpoints;
- existing `geolocator` for location;
- `connectivity_plus` for network-aware refresh;
- `intl` for dates and units;
- local persistence such as `isar` or existing cache layer for last-known forecasts;
- no Windy secret or direct Windy API package in Flutter.

## 17.2 Internet-connected voice architecture

The voice assistant is online-first. The goal is low-latency capture, fast partial feedback, simple device processing, and backend-controlled intelligence.

### Recommended Flutter voice flow

```text
User holds/taps microphone
  -> Flutter captures speech
  -> on-device/plugin speech recognition provides partial text when available
  -> final transcript sent to NestJS
  -> NestJS intent router + Gemini/provider gateway
  -> structured response
  -> Flutter renders text immediately
  -> Flutter TTS speaks response
```

### Recommended Flutter packages

Add after compatibility testing:

- `speech_to_text` â€” simple online speech recognition bridge using platform services;
- `flutter_tts` â€” fast device text-to-speech response;
- `record` â€” optional raw audio capture when server-side transcription is needed;
- `audio_session` â€” microphone/TTS focus management;
- `just_audio` â€” playback of streamed/generated audio and alert previews;
- `connectivity_plus` â€” detect internet state;
- `permission_handler` â€” already present, for microphone/notification permissions;
- `wakelock_plus` â€” only during an active critical voice workflow, never permanently;
- `rxdart` only if stream debouncing is not already handled by the selected state architecture.

Preferred first version:

- use `speech_to_text` for recognition;
- use `flutter_tts` for speech output;
- send text, not continuous raw audio, to the backend;
- fall back to typed input when speech recognition fails;
- optionally use `record` later for server transcription.

### Voice latency requirements

- microphone UI feedback begins immediately;
- partial transcript appears during speech where platform support permits;
- final transcript is submitted once silence/end is detected;
- cancel previous request when user starts a new request;
- show text response before TTS finishes initializing;
- cache common static TTS phrases where legally and technically appropriate;
- use short structured answers first, then expandable detail;
- timeout and retry do not duplicate actions.

### Voice intent design

Do not let Gemini directly navigate or execute actions. Gemini returns a validated intent:

```json
{
  "intent": "OPEN_CROP_SCANNER",
  "entities": {
    "crop": "rice"
  },
  "requiresConfirmation": false,
  "spokenReply": "à¦•à§à¦¯à¦¾à¦®à§‡à¦°à¦¾ à¦–à§à¦²à¦›à¦¿à¥¤"
}
```

Intent categories:

- navigation;
- crop help;
- disease scan;
- farm record query;
- weather query;
- alert explanation;
- marketplace search;
- product listing draft;
- market price query;
- order status;
- consultation booking;
- livestock/poultry/fish query;
- unknown/help.

Actions involving checkout, payment, deleting data, publishing a listing, or booking must require explicit confirmation.

### Backend voice modules

- `VoiceAssistantModule`;
- `VoiceIntentService`;
- `ConversationService`;
- `SpeechProvider` interface for future server transcription;
- `TtsProvider` interface for future cloud voice;
- Gemini intent parser with JSON schema validation;
- rate limiting and abuse controls;
- conversation retention policy.

## 17.3 Replaceable communication services

SMS, WhatsApp, email, push, and voice-call services must use adapters so the provider can be replaced through configuration.

```ts
interface NotificationChannelProvider {
  send(message: NotificationMessage): Promise<NotificationDeliveryResult>;
}
```

Providers:

- `OneSignalPushProvider` â€” initial push provider.
- `SmsProvider` â€” interface plus disabled placeholder implementation.
- `WhatsAppProvider` â€” interface plus disabled placeholder implementation.
- `EmailProvider` â€” SMTP/API adapter.
- `VoiceCallProvider` â€” future emergency call adapter.
- `InAppProvider` â€” always available.

Never reference a vendor SDK inside business modules. Business modules publish a notification command to `NotificationOrchestrator`; the selected provider handles delivery.

Required data:

- notification ID;
- user/segment IDs;
- channel;
- template key and version;
- locale;
- severity;
- idempotency key;
- scheduled/expiry time;
- provider response ID;
- delivery/open/acknowledgement state;
- failure reason and retry count.

## 17.4 Siren alerts while phone is locked or app is closed

Critical weather alerts require native operating-system notification behavior. Flutter code alone cannot guarantee unlimited alarm behavior on every device because Android/iOS impose strict background and notification policies.

### Android design

Implement a native Android alert layer integrated with Flutter:

- high-importance notification channel named for emergency agricultural/weather alerts;
- custom siren sound bundled as an app resource;
- full-screen intent only for genuinely urgent, policy-compliant alarms;
- heads-up notification;
- lock-screen visibility;
- vibration pattern;
- ongoing notification during an active emergency when appropriate;
- action buttons: acknowledge, view details, mute this event;
- local notification scheduling for already-received alert payloads;
- boot persistence only when necessary and compliant;
- exact alarms only if genuinely required and after checking platform permission/policy;
- foreground service only for an active safety event, not permanent background execution.

Flutter packages to evaluate:

- `flutter_local_notifications` for channels, custom sound, actions, scheduling, and full-screen intent support;
- `onesignal_flutter` already present for remote push;
- `audioplayers` or `just_audio` for siren playback while app process is active;
- `android_alarm_manager_plus` only if an actual scheduled local alarm use case remains after policy review;
- `timezone` for reliable local scheduling;
- `device_info_plus` for manufacturer/version-specific support diagnostics.

Native Android files may require:

- notification channel creation;
- full-screen alarm activity;
- lock-screen flags/API calls;
- broadcast receiver for notification actions;
- foreground-service declaration for active emergency playback;
- Android 13+ notification permission handling;
- Android 14+ full-screen intent and exact alarm compliance.

### iOS design

- standard critical notifications cannot be assumed;
- Critical Alerts entitlement requires Apple approval;
- without that entitlement, use time-sensitive notifications and normal custom sounds within platform rules;
- document this limitation clearly in product requirements.

### Safety and abuse controls

- siren only for `CRITICAL` severity, never ordinary forecasts;
- signed/authenticated push payload;
- alert expiry checked on device;
- duplicate event ID suppression;
- maximum repeat count and interval;
- quiet-hours override only for critical severity;
- user acknowledgement stops repeats for that event;
- admin cannot casually trigger a siren without privileged permission and audit log;
- test mode uses a visibly marked test alert and softer behavior.

## 17.5 Smooth and fast application requirements

### Flutter performance architecture

- feature-first folder structure;
- repository/data-source separation;
- immutable models generated with Freezed;
- JSON serialization generated, not hand-written for large models;
- `signals` or one consistent state approach; avoid mixing many state systems;
- `get_it` for dependency registration already present;
- Dio singleton with interceptors;
- cancel tokens for obsolete searches/requests;
- pagination for listings, alerts, news, users, and messages;
- lazy loading for images and tabs;
- image thumbnails instead of originals in lists;
- isolate usage for expensive local JSON/image preprocessing only;
- no heavy AI inference on the UI isolate;
- avoid rebuilding full dashboard when one card changes;
- stable keys and const widgets;
- skeleton states instead of blocking spinners;
- prefetch the next likely page carefully;
- cache last successful data with stale-while-revalidate behavior;
- offline drafts for forms/uploads;
- resumable/chunked image upload;
- compress client images to a sensible upload resolution while retaining originals only when required;
- background upload managed through platform-supported mechanisms;
- release-mode profiling on low/mid-range Android devices common in Bangladesh.

### Backend performance

- database indexes for every common filter/sort;
- cursor pagination for large collections;
- Redis cache for weather, public market prices, CMS, and role permissions;
- queue AI/image/notification fan-out work;
- never hold HTTP requests open for 500-image processing;
- WebSocket/SSE or polling job status;
- stream file uploads rather than loading entire files into memory;
- connection pooling;
- response compression only where beneficial;
- request body/file limits;
- N+1 query prevention;
- separate worker process for BullMQ;
- graceful shutdown;
- metrics for p50/p95/p99 latency;
- load tests for login, dashboard, listing search, weather, alert fan-out, and image ingestion.

### Next.js performance

- server components for read-heavy admin pages where appropriate;
- client components only for interactive tables/forms/uploaders;
- pagination and virtualization for large lists;
- direct-to-object-storage upload via presigned URL;
- no base64 image uploads;
- dynamic import for charts and heavy admin modules;
- route-level loading/error boundaries;
- avoid exposing backend or provider secrets.

### Performance targets

Initial measurable targets:

- app cold-start target appropriate to supported devices and measured in release builds;
- first dashboard cached content visible within approximately one second after shell load;
- normal API p95 under 500â€“800 ms excluding third-party/AI operations;
- weather cache hit response p95 under 300 ms;
- list scrolling without visible jank at 60 Hz on selected baseline devices;
- voice transcript UI responds immediately and network answer begins within a few seconds under normal connectivity;
- uploads survive temporary connectivity loss;
- long AI/vector jobs always expose progress.

Targets must be validated, not assumed.

## 17.6 Expanded user and actor model

The platform has many user types, but role combinations must be controlled rather than creating one completely separate app for each actor.

Primary account roles:

- farmer;
- wholesale buyer;
- retail/public buyer;
- student/volunteer/field assistant;
- agriculture specialist;
- veterinary doctor;
- input/equipment seller;
- medicine seller;
- logistics/delivery partner;
- market data contributor;
- government/agriculture officer;
- content editor;
- support agent;
- moderator;
- finance/order operations officer without wallet authority;
- admin;
- super admin;
- public/guest user.

Role design rules:

- a user may hold multiple approved roles;
- active role/workspace may be switched without creating duplicate accounts;
- each role has granular permissions;
- sensitive professional roles require verification;
- every assisted action records both owner and acting assistant;
- guest/public access is read-only and limited;
- admin privileges are never inferred from mobile UI state;
- government officer data access must be scoped by jurisdiction and purpose;
- support agents may impersonate only through a controlled, audited support mode if ever enabled;
- separate tenant/organization concepts can be introduced later without changing core user IDs.

Recommended permission examples:

- `farm.read.own`
- `farm.write.own`
- `farm.write.assisted`
- `diagnosis.request`
- `diagnosis.review`
- `listing.publish.own`
- `listing.moderate`
- `order.manage.own`
- `consultation.prescribe`
- `weather.alert.publish`
- `cms.publish`
- `image_profile.manage`
- `admin.user.verify`

## 17.7 Flutter nested routing plan

The current app already uses AutoRoute and an `EmptyShellRoute` tab structure. Continue with nested routes; do not put every page directly under one flat root router.

### Root route groups

```text
/
â”œâ”€ splash
â”œâ”€ auth/
â”‚  â”œâ”€ login
â”‚  â”œâ”€ register
â”‚  â”œâ”€ otp
â”‚  â”œâ”€ forgot-password
â”‚  â””â”€ verification-pending
â”œâ”€ onboarding/
â”‚  â”œâ”€ language
â”‚  â”œâ”€ role-selection
â”‚  â”œâ”€ profile
â”‚  â””â”€ permissions
â””â”€ app/                       # authenticated shell
   â”œâ”€ home/                   # nested stack
   â”œâ”€ farms/                  # nested stack
   â”œâ”€ diagnose/               # nested stack
   â”œâ”€ marketplace/            # nested stack
   â”œâ”€ alerts/                 # nested stack
   â”œâ”€ assistant/              # nested stack/modal routes
   â”œâ”€ consultations/          # nested stack
   â””â”€ account/                # nested stack
```

### Example nested route tree

```text
app/home
â”œâ”€ dashboard
â”œâ”€ weather-details
â”œâ”€ market-summary
â””â”€ quick-actions

app/farms
â”œâ”€ farm-list
â”œâ”€ farm/:farmId
â”‚  â”œâ”€ overview
â”‚  â”œâ”€ crops
â”‚  â”‚  â”œâ”€ crop-list
â”‚  â”‚  â”œâ”€ crop/:cropCycleId
â”‚  â”‚  â”œâ”€ observations
â”‚  â”‚  â””â”€ plans
â”‚  â”œâ”€ livestock
â”‚  â”œâ”€ poultry
â”‚  â”œâ”€ fisheries
â”‚  â”œâ”€ calendar
â”‚  â””â”€ reports

app/diagnose
â”œâ”€ choose-domain
â”œâ”€ capture
â”œâ”€ review-images
â”œâ”€ processing/:jobId
â”œâ”€ result/:diagnosisId
â””â”€ specialist-review/:diagnosisId

app/marketplace
â”œâ”€ browse
â”œâ”€ search
â”œâ”€ category/:category
â”œâ”€ listing/:listingId
â”œâ”€ seller/:sellerId
â”œâ”€ cart
â”œâ”€ checkout
â”œâ”€ orders
â”‚  â””â”€ order/:orderId
â”œâ”€ sell
â”‚  â”œâ”€ draft
â”‚  â”œâ”€ photos
â”‚  â”œâ”€ pricing
â”‚  â”œâ”€ preview
â”‚  â””â”€ publish
â””â”€ deals

app/alerts
â”œâ”€ inbox
â”œâ”€ event/:eventId
â”œâ”€ weather-map
â”œâ”€ settings
â””â”€ history

app/consultations
â”œâ”€ specialists
â”œâ”€ specialist/:id
â”œâ”€ booking/:id
â”œâ”€ appointments
â”œâ”€ session/:id
â””â”€ prescriptions

app/account
â”œâ”€ profile
â”œâ”€ roles
â”œâ”€ language
â”œâ”€ notification-settings
â”œâ”€ privacy
â”œâ”€ security
â””â”€ help
```

### Routing rules

- root router contains only top-level flow boundaries;
- each major feature owns its nested routes;
- bottom navigation tabs use shell routes and retain independent navigation stacks;
- switching tabs preserves each tabâ€™s stack and scroll state;
- detail pages live under their feature route;
- modal actions use modal/bottom-sheet routes only when appropriate;
- role guards and verification guards are attached at branch level;
- deep links resolve directly to nested pages after authentication;
- unauthenticated deep links are stored and resumed after login;
- route arguments use IDs, not entire large model objects;
- no business logic inside route definitions;
- route observers record analytics without personal/sensitive payloads;
- regenerate AutoRoute code in CI and fail if generated code is stale.

### Suggested routing file organization

```text
farmer/lib/core/router/
â”œâ”€ app_router.dart
â”œâ”€ app_router.gr.dart
â”œâ”€ guards/
â”‚  â”œâ”€ auth_guard.dart
â”‚  â”œâ”€ verification_guard.dart
â”‚  â”œâ”€ role_guard.dart
â”‚  â””â”€ connectivity_guard.dart
â”œâ”€ routes/
â”‚  â”œâ”€ auth_routes.dart
â”‚  â”œâ”€ home_routes.dart
â”‚  â”œâ”€ farm_routes.dart
â”‚  â”œâ”€ diagnosis_routes.dart
â”‚  â”œâ”€ marketplace_routes.dart
â”‚  â”œâ”€ alert_routes.dart
â”‚  â”œâ”€ consultation_routes.dart
â”‚  â””â”€ account_routes.dart
â””â”€ observers/
   â””â”€ app_route_observer.dart
```

The current `app_router.dart` is already partially nested. Refactor it into feature-owned route lists before the route count becomes too large.

## 17.8 Full package plan

Packages must be added only when used and after compatibility/license review.

### Flutter packages already present and retained

- `auto_route`, `auto_route_generator`;
- `dio`;
- `get_it`;
- `freezed`, `freezed_annotation`;
- `json_serializable`, `json_annotation`;
- `flutter_secure_storage`;
- `shared_preferences`;
- `cached_network_image`;
- `permission_handler`;
- `geolocator`;
- `image_picker`;
- `onesignal_flutter`;
- `intl`;
- `logger`;
- `path_provider`;
- `share_plus`;
- QR/scanner packages;
- `signals`;
- existing query/cache packages.

### Flutter packages proposed

- `speech_to_text`;
- `flutter_tts`;
- `record`;
- `audio_session`;
- `just_audio`;
- `flutter_local_notifications`;
- `timezone`;
- `connectivity_plus`;
- `device_info_plus`;
- `wakelock_plus`;
- `workmanager` for carefully scoped deferrable background sync where platform rules allow;
- `sentry_flutter` or equivalent crash/performance monitoring;
- `firebase_performance` only if Firebase is selected and privacy/cost are accepted;
- `image` only for lightweight client-side preprocessing, while heavy work remains server-side;
- `file_picker` for admin-like multi-file workflows if needed on Flutter;
- `mime` for local pre-validation;
- optional `isar` for robust offline structured storage after architectural approval.

Avoid adding multiple packages that solve the same state, navigation, audio, or notification problem.

### NestJS/backend packages proposed

- `@nestjs/axios`;
- `@nestjs/schedule`;
- `@nestjs/bullmq` and `bullmq`;
- `ioredis`;
- `@qdrant/js-client-rest`;
- `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`;
- `sharp`;
- `multer` only for controlled multipart endpoints;
- `class-validator`, `class-transformer`;
- `zod` or JSON-schema validator for AI structured outputs, selecting one consistent validation approach;
- `@nestjs/throttler`;
- `helmet`;
- `compression`;
- `nestjs-pino`/`pino` optional structured logging;
- `prom-client` for metrics;
- `@sentry/node` optional error monitoring;
- `uuid`;
- `mime-types`/file-type detection library;
- `socket.io` or Nest WebSocket package already aligned with the project;
- `pdfkit`/Playwright-based PDF strategy after choosing one invoice renderer;
- `qrcode` for invoice verification codes;
- official Gemini SDK selected according to current supported API;
- OpenTelemetry packages only if observability scope justifies them.

### Next.js packages proposed

- existing React/Next stack;
- `@tanstack/react-query` if a client data layer is required;
- `react-hook-form` plus `zod` resolver for complex admin forms;
- `react-dropzone` for image-profile bulk upload;
- a virtualized list/table package for large datasets;
- `recharts` or another single chart library;
- Sentry Next.js SDK or equivalent;
- no provider API secret in client-side environment variables.

## 17.9 Strong production-readiness requirements

Before production release:

- threat model completed;
- permission matrix reviewed;
- low-connectivity behavior tested;
- low-memory Android behavior tested;
- locked-screen alert behavior tested on multiple Android vendors;
- notification permission denial flow tested;
- duplicate/expired emergency alert suppression tested;
- Windy quota and outage behavior tested;
- Gemini multi-key exhaustion behavior tested;
- Qdrant outage and rebuild tested;
- backup restore drill completed;
- image deletion coordinates PostgreSQL, object storage, and Qdrant data;
- app remains usable for core non-AI workflows when Gemini is unavailable;
- weather display shows last-updated time when offline;
- all AI, weather, and market advice is presented as advisory with data freshness;
- app store policies for background, alarm, full-screen intent, microphone, and notification usage are reviewed before submission.


---

# 18. Final Product Rules Addendum â€” OneSignal, Siren Alerts, AI Fallback, Caching, Design System, and Feature Documentation

This section is authoritative and overrides earlier generic notification or design wording.

## 18.1 OneSignal is the mandatory notification provider

All remote push notifications must use OneSignal. The application may use local notifications and native alarm behavior for on-device presentation, but remote notification delivery must always originate through the OneSignal integration.

### Required notification flow

```text
Windy/weather data or application event
  -> NestJS event/hazard engine
  -> NotificationOrchestrator
  -> OneSignalPushProvider
  -> device push delivery
  -> Flutter/native notification handler
  -> standard notification or critical siren workflow
```

Rules:

- Business modules publish domain events; they never call OneSignal directly.
- `OneSignalPushProvider` is the only production remote-push implementation.
- OneSignal app ID may exist in Flutter as public configuration.
- OneSignal REST/API secrets remain in NestJS only.
- Every push includes a unique event ID, type, severity, issue time, expiry time, locale, and deep-link target.
- OneSignal external user IDs/tags map users to roles, districts, farms, crops, livestock types, and alert subscriptions.
- Server-side authorization decides the audience; client tags alone are not trusted for sensitive delivery.
- Delivery, open, acknowledgement, and failure state are stored where available.
- Duplicate event IDs are suppressed on both backend and device.
- Expired weather alerts must never trigger a siren.
- Notification payloads must be minimal and must not expose sensitive farm or medical data on the lock screen.

### OneSignal segmentation examples

- users near a geographic hazard area;
- farmers with a specific crop type;
- poultry farmers during extreme heat;
- river fishermen in a dangerous forecast zone;
- users who enabled critical weather alerts;
- specialists receiving urgent consultation requests;
- sellers receiving order events.

## 18.2 Weather-triggered audio siren policy

The siren is an additional presentation layer on top of OneSignal push delivery. It is not a separate remote-notification provider.

### Event examples that may trigger a siren

- extreme heat dangerous to people, poultry, livestock, or crops;
- cyclone or severe storm;
- dangerous wind/gust;
- flash-flood or flood threat when an authoritative source exists;
- river fishing danger;
- severe lightning risk;
- other events explicitly classified as `CRITICAL` by the hazard engine.

Normal rain, ordinary heat, informational forecasts, market updates, and routine reminders must not use the siren.

### Siren decision flow

```text
OneSignal push received
  -> verify event ID and payload shape
  -> verify issue/expiry time
  -> verify severity == CRITICAL
  -> verify event not acknowledged or muted
  -> verify local permission/platform capability
  -> show lock-screen/high-priority notification
  -> play packaged siren using supported native/local notification mechanism
  -> repeat only according to bounded policy
```

The backend decides severity. The device enforces expiry, duplicate suppression, acknowledgement, and platform permission state.

## 18.3 Qdrant-first recognition with AI fallback

Qdrant is used to reduce unnecessary AI calls, improve speed, reuse known visual profiles, and provide consistent matching for previously indexed classes.

### Required decision pipeline

```text
Uploaded image(s)
  -> validation and normalization
  -> embedding generation
  -> Qdrant similarity search
  -> confidence calibration
     -> high-confidence match: return known profile + optional lightweight AI explanation
     -> medium-confidence match: return alternatives and request more evidence or use AI review
     -> no/low-confidence match: send image/context to Gemini AI analysis
  -> save result, provenance, confidence, and model versions
```

Rules:

- Qdrant is always attempted first for supported image-profile domains.
- AI fallback occurs when:
  - no candidate is returned;
  - confidence is below the configured threshold;
  - candidates disagree strongly;
  - the profile/model version is unavailable;
  - Qdrant is temporarily unavailable;
  - the user requests a deeper explanation;
  - safety rules require broader analysis.
- A Qdrant failure must not make the entire diagnosis feature unavailable.
- The fallback path must have timeout, retry, quota, and circuit-breaker protection.
- When both Qdrant and AI are unavailable, store the job as pending/retryable and show a truthful non-diagnostic message.
- Results must label their origin:
  - `VECTOR_MATCH`;
  - `AI_ANALYSIS`;
  - `VECTOR_PLUS_AI`;
  - `SPECIALIST_REVIEW`.
- High-confidence vector matching may avoid a full vision call, but an inexpensive text-generation call may create localized guidance from the trusted profile record.
- Known remedies and safety guidance should come from reviewed profile content where possible, not be regenerated differently on every request.

### Cost and latency optimization

- cache embedding results by image checksum and model version;
- cache active profile centroid data where appropriate;
- cache reviewed profile explanations;
- batch query images;
- use one AI fallback request with the best normalized images and context rather than repeated calls;
- avoid sending duplicate images to AI;
- use Qdrant filters for domain/crop/species/model version before nearest-neighbor search.

## 18.4 Cache-by-default strategy

The application should cache any data that is safe, useful, and has a clear invalidation/freshness policy.

### Cache layers

1. Flutter memory cache for active session data.
2. Flutter persistent cache for last-known safe read data.
3. Next.js request/server cache for suitable public/read-heavy data.
4. NestJS in-process short-lived cache for tiny immutable/config values.
5. Redis distributed cache for shared API responses and locks.
6. CDN/object-storage caching for public thumbnails and static assets.
7. Qdrant for reusable vector retrieval, not as a replacement for PostgreSQL.

### Recommended cached data

- weather forecasts by area and forecast window;
- market-price summaries;
- public news and government notices;
- product categories and safe metadata;
- farm dashboard summaries with short TTL and event invalidation;
- listing search result pages with careful invalidation;
- profile thumbnails;
- AI reviewed/static profile guidance;
- feature flags and public configuration;
- user permissions for very short TTL with invalidation on role changes;
- route-independent lookup tables;
- query image embeddings by checksum/model version.

### Data that must not be carelessly cached

- passwords, tokens, OTPs, raw provider secrets;
- unencrypted sensitive health or prescription data;
- stale payment status;
- authorization decisions without invalidation;
- expired emergency alerts;
- raw private images in public caches.

### Cache policy required for every cacheable resource

- key format;
- owner/tenant scope;
- TTL;
- stale-while-revalidate window;
- invalidation events;
- maximum size;
- encryption/privacy classification;
- offline behavior;
- source timestamp;
- cache version.

### Fast UX behavior

- show cached content immediately;
- display freshness/last-updated information where relevant;
- refresh in background;
- preserve current content if refresh fails;
- use skeletons only when no useful cached content exists;
- use subtle refresh indicators rather than replacing valid content with a full-page loader.

## 18.5 Mandatory visual style: modern glassmorphism

Flutter and Next.js must use one consistent modern glassmorphism design system. Inspiration may be collected from Dribbble, Mobbin, and Behance, but designs must not be copied directly. The team must extract patterns, then create an original, accessible, agriculture-focused system.

Dribbble provides mobile, web, dashboard, ecommerce, onboarding, and product-design inspiration; Mobbin is a reference library for real mobile/web interaction patterns; Behance provides broader project, branding, illustration, and visual-system references. These are inspiration sources, not implementation specifications. 

### Core visual language

- translucent glass surfaces;
- controlled background blur;
- soft borders/highlights;
- layered depth;
- agriculture-inspired imagery and colors;
- modern rounded geometry;
- clear type hierarchy;
- high-quality icons;
- restrained gradients;
- strong visual states for alerts and risk;
- consistent light and dark themes if dark mode is supported.

### Glassmorphism safety rules

- readability is more important than blur;
- use sufficiently opaque fallback surfaces on low-contrast backgrounds;
- avoid glass-on-glass nesting beyond two layers;
- do not apply blur to every component;
- lists and long forms should prioritize stable, solid-enough surfaces;
- critical red alerts must remain highly legible;
- support reduced transparency and reduced motion where platforms provide it;
- keep blur radius and shadow complexity low on low-end devices;
- provide non-blur fallback for unsupported/slow devices;
- test contrast against actual photos and gradient backgrounds;
- do not sacrifice touch-target size for visual style.

### Design tokens

Create shared documented tokens for:

- colors and semantic colors;
- glass surface opacity levels;
- blur tiers;
- border opacity;
- elevation/shadow tiers;
- radii;
- spacing;
- typography;
- icon sizes;
- animation durations and curves;
- skeleton shapes;
- alert severity;
- chart colors;
- form states.

Flutter tokens belong in a central theme/design-system package or folder. Next.js tokens belong in CSS variables/Tailwind theme or an equivalent centralized system. The values should visually match across clients.

### Design reference workflow

For each major feature:

1. Collect 3â€“5 relevant references from Dribbble, Mobbin, or Behance.
2. Record the reference URLs in the feature documentation.
3. Identify useful patterns: hierarchy, navigation, card layout, spacing, flow, feedback.
4. Do not copy proprietary illustrations, branding, screenshots, or exact layouts.
5. Create an original wireframe.
6. Validate the flow against product requirements.
7. Implement with shared design tokens.
8. Review accessibility and performance.
9. Capture final screenshots in `features.md` or linked evidence when practical.

## 18.6 Skeleton loading is mandatory in Flutter and Next.js

Use skeletons for content-shaped loading states, not generic spinning indicators for every screen.

### Flutter skeleton rules

- create reusable skeleton primitives in the design system;
- skeleton should match the approximate shape of final content;
- use on dashboard cards, lists, weather cards, marketplace grids, profile headers, chat/consultation lists, and admin-like mobile pages;
- avoid indefinite shimmer that consumes battery/GPU;
- respect reduced motion;
- stop animations when off-screen;
- cached content should normally replace skeletons immediately;
- errors must replace skeletons with actionable error states;
- use a lightweight implementation and profile blur + shimmer together on low-end devices.

### Next.js skeleton rules

- use `loading.tsx` at suitable route segments;
- use component-level Suspense fallbacks for slower subsections;
- preserve page layout to avoid cumulative layout shift;
- create shared glass skeleton components;
- table skeletons should reflect expected columns/rows;
- uploader skeleton/progress states must show actual progress when known;
- never show skeleton after a definitive empty or error response.

### Loading-state hierarchy

1. cached content plus background refresh;
2. skeleton matching content;
3. explicit progress for uploads/long jobs;
4. small spinner for compact button actions only;
5. error/empty state when resolved.

## 18.7 Design performance rules

Glassmorphism can be expensive. Therefore:

- blur only stable background regions;
- avoid animated large-area backdrop filters;
- limit simultaneous translucent layers;
- use raster/cache boundaries carefully in Flutter;
- profile scrolling lists with glass cards;
- use solid/translucent fallback on low-end devices;
- avoid huge background images;
- serve responsive image sizes;
- cache decoded thumbnails;
- lazy-load non-visible sections;
- Next.js should avoid unnecessary client-side glass effects and heavy JS animation;
- benchmark skeleton and blur performance together.

## 18.8 Required feature documentation file

A separate file named `features.md` is the implementation handoff and user-testing record.

Every future developer or AI agent that completes or changes a checklist item in `done.md` must update `features.md` in the same change.

Required entry fields:

- feature ID and name;
- completion date;
- status;
- summary of what was implemented;
- user roles affected;
- user-visible behavior;
- how to access/use it;
- prerequisites and configuration;
- API endpoints;
- database collections/indexes;
- background jobs/queues;
- notification behavior;
- cache behavior and invalidation;
- security/permission rules;
- files changed;
- packages added/removed;
- environment variables;
- migration/seed steps;
- exact manual testing steps;
- automated tests and commands;
- expected result;
- known limitations;
- rollback notes;
- screenshots/reference links when available;
- related `done.md` checklist items.

Completion rule:

```text
Code implemented
+ tests pass
+ done.md updated
+ features.md entry added/updated
= feature may be marked complete
```

Without a `features.md` entry and test evidence, an item must remain `[~]` or `[ ]`.


## 18.9 `features.md` must remain empty until real implementation exists

`features.md` must remain completely empty at the planning stage.

No template, placeholder, planned feature, architecture note, checklist, or example entry may be written there before a feature is actually implemented and tested.

Only after a real feature is completed may the developer or AI agent append a detailed entry covering:

- what was implemented;
- how the feature works;
- how to access and use it in Flutter;
- how to access and use it in Next.js, when applicable;
- backend APIs and permissions;
- packages, environment variables, migrations, queues, cache rules, and notification behavior;
- exact manual testing steps;
- automated test commands and results;
- known limitations and rollback steps;
- links to the related `done.md` items.

If a feature exists only in planning, design, mockup, or partial UI form, `features.md` must not be updated for it.


---

# 19. Dashboard Routing, Resilient Infrastructure, Unlimited Gemini Keys, and Marketplace Actor Plan

## 19.1 Next.js dashboard route convention

Every authenticated web workspace must start with `/dashboard`.

Canonical routes:

```text
/dashboard/admin
/dashboard/farmer
/dashboard/buyer
/dashboard/wholesale-buyer
/dashboard/seller
/dashboard/machinery-seller
/dashboard/medicine-seller
/dashboard/agent
/dashboard/agriculture-specialist
/dashboard/veterinary-doctor
/dashboard/government-officer
/dashboard/support
```

Rules:

- `/` redirects to `/dashboard/admin` during the current admin-first development stage.
- `/dashboard` redirects to `/dashboard/admin` until role-aware post-login routing is implemented.
- After login, the server/client must route the user to the correct role workspace.
- A user with multiple approved roles may switch workspaces without signing into another account.
- Admin pages must remain under `/dashboard/admin/...`.
- Seller pages must remain under `/dashboard/seller/...` or the specialized seller workspace.
- No feature page should be placed at an unrelated root route.
- Each workspace will use nested route groups for overview, inventory, listings, orders, messages, analytics, settings, and role-specific workflows.

Recommended nested routes:

```text
/dashboard/admin/
â”œâ”€ overview
â”œâ”€ users
â”œâ”€ roles
â”œâ”€ marketplace
â”œâ”€ orders
â”œâ”€ content
â”œâ”€ integrations
â”œâ”€ alerts
â”œâ”€ reports
â””â”€ settings

/dashboard/farmer/
â”œâ”€ overview
â”œâ”€ farms
â”œâ”€ crops
â”œâ”€ livestock
â”œâ”€ poultry
â”œâ”€ fisheries
â”œâ”€ diagnoses
â”œâ”€ sell
â”œâ”€ listings
â”œâ”€ orders
â”œâ”€ consultations
â””â”€ settings

/dashboard/buyer/
â”œâ”€ overview
â”œâ”€ marketplace
â”œâ”€ saved-searches
â”œâ”€ offers
â”œâ”€ orders
â”œâ”€ deliveries
â”œâ”€ messages
â””â”€ settings

/dashboard/seller/
â”œâ”€ overview
â”œâ”€ products
â”œâ”€ inventory
â”œâ”€ orders
â”œâ”€ deliveries
â”œâ”€ messages
â”œâ”€ analytics
â””â”€ settings

/dashboard/machinery-seller/
â”œâ”€ overview
â”œâ”€ machinery
â”œâ”€ parts
â”œâ”€ rentals
â”œâ”€ service-areas
â”œâ”€ orders
â”œâ”€ deliveries
â””â”€ settings
```

## 19.2 Unlimited Gemini API-key pool

The admin dashboard may store more than one Gemini API key and must not impose an arbitrary product-level maximum.

Operational safeguards still apply:

- reject empty/invalid-looking entries;
- deduplicate identical keys before encryption;
- never return full keys after save;
- assign an internal key ID/alias;
- track health, cooldown, quota failure, latency, and last successful use;
- allow admin disable/enable without deleting the key;
- use least-recently-used or weighted round-robin routing;
- rotate to another healthy key on quota/rate-limit errors;
- do not rotate across all keys for permanent request-validation errors;
- cap request-level retries even when many keys exist;
- never expose keys to Flutter or the Next.js browser runtime after submission.

The same Gemini key pool may serve text and image/vision requests. Model names remain separately configurable because text and image requests may use different Gemini model IDs. Qdrant image embeddings remain a separate provider/model decision because vector generation is not the same output as Gemini image analysis.

## 19.3 Redis and Qdrant are optional startup dependencies

Redis and Qdrant failures must never stop the NestJS application from starting.

Startup behavior:

```text
PostgreSQL unavailable -> backend startup fails (primary system of record)
Redis unavailable      -> log error, disable distributed cache/queue-dependent paths, continue
Qdrant unavailable     -> log error, disable vector match, use AI fallback where available, continue
MinIO unavailable      -> log warning/error, disable upload-dependent paths, continue
Gemini unavailable     -> non-AI features continue; AI jobs fail gracefully or queue for retry
Windy unavailable      -> show cached/last-known weather and provider-unavailable state
OneSignal unavailable  -> store notification event and retry without crashing the API
```

Rules:

- Redis client uses short startup timeout and no infinite retry loop.
- Qdrant health check uses short timeout.
- Each optional service exposes availability status to internal services.
- Feature services must check dependency availability before use.
- Redis cache misses/unavailability fall back to PostgreSQL/direct provider calls where safe.
- Qdrant unavailability routes supported diagnosis requests to Gemini fallback.
- Error logs must be actionable but must not leak credentials.
- Health/readiness endpoints should report degraded state separately from fatal PostgreSQL failure.

## 19.4 Marketplace actors and catalogs

The marketplace is not only farmer-to-buyer crop sales. It supports multiple commercial directions.

### Actor A â€” Farmer as crop/farm-output seller

May sell:

- rice, wheat, corn and other grains;
- vegetables;
- fruits;
- fish;
- cattle, goat, buffalo, sheep;
- chicken, duck, eggs;
- milk, honey and other farm outputs.

Required workflow:

```text
Farmer creates listing
-> photos and crop/product details
-> quantity/unit/grade/harvest date
-> location and delivery/pickup options
-> market-price comparison
-> moderation/verification when required
-> publish
-> buyer search/offer/order
-> stock reservation
-> payment/delivery
-> invoice/review
```

Farmer filters and management:

- status;
- product/category;
- date range;
- available/reserved/sold quantity;
- active/expired listings;
- buyer offers;
- delivery state;
- payment state;
- district/upazila;
- price range.

### Actor B â€” Buyer/wholesale buyer purchasing crops

Buyer marketplace filters:

- category and commodity;
- crop variety;
- district/upazila and radius;
- quantity range;
- unit;
- grade/quality;
- harvest date/freshness;
- minimum/maximum price;
- government-price comparison;
- available delivery/pickup;
- verified farmer;
- listing status;
- seller rating;
- wholesale/bulk availability.

Buyer features:

- saved searches;
- favorite listings;
- compare listings;
- make/counter offers;
- bulk purchase request;
- order and delivery tracking;
- invoices;
- farmer chat;
- review/rating;
- repeat order.

### Actor C â€” External seller selling machinery and agricultural inputs

This seller may be an individual business, dealer, manufacturer, distributor, or approved shop.

May sell or rent:

- tractor;
- power tiller;
- sprayer;
- irrigation equipment;
- pumps;
- greenhouse equipment;
- harvesting equipment;
- tools and spare parts;
- seeds;
- fertilizers;
- pesticides;
- fish/poultry/cattle feed;
- approved veterinary/agricultural medicine.

Machinery/input product fields:

- seller/business ID;
- product category and subcategory;
- brand;
- model;
- condition: new/used/refurbished;
- sale/rental/service type;
- price or rental rate;
- negotiable status;
- stock quantity;
- warranty;
- specifications JSONB;
- compatible crop/farm type;
- service/delivery regions;
- installation support;
- photos/videos/documents;
- approval/moderation state;
- rating/reviews.

Farmer-facing machinery filters:

- category;
- brand/model;
- new/used;
- buy/rent;
- price/rental range;
- horsepower/capacity/specifications;
- delivery area;
- warranty;
- verified seller;
- in-stock status;
- rating;
- nearest seller/service center.

### Catalog separation

Use a shared marketplace foundation but distinct product types:

```text
AGRICULTURAL_OUTPUT
LIVESTOCK
POULTRY
FISHERIES
MACHINERY
MACHINERY_PART
SEED
FERTILIZER
PESTICIDE
FEED
MEDICINE
EQUIPMENT_RENTAL
SERVICE
```

Do not force machinery specifications into crop-listing columns. Use type-specific detail tables/entities or validated JSONB specifications with indexed common fields.

### Marketplace data flow

```text
Next.js/Flutter filter state
-> validated query DTO
-> NestJS marketplace search service
-> PostgreSQL indexed filters/full-text search
-> Redis cache for popular public searches when available
-> paginated response
-> client skeleton/cached result
```

Required pagination:

- cursor-based pagination for large listing feeds;
- stable sort by created date/id, price, distance, popularity, or relevance;
- filter state encoded in URL on Next.js;
- filter state preserved in Flutter route/state;
- no unbounded `take(100)` production list endpoints.

### Marketplace service boundaries

Recommended modules:

- marketplace catalog;
- agricultural listings;
- machinery/input products;
- inventory;
- search/filter;
- offers/negotiation;
- cart;
- orders;
- payments;
- delivery/logistics;
- invoices;
- reviews;
- moderation;
- seller analytics.

## 19.5 Current implementation status versus plan

Already implemented foundation:

- farmer crop listing creation/search;
- buyer/farmer offers and deals;
- medicine seller inventory and nearby search;
- role dashboard route foundation;
- PostgreSQL entities and transactions;
- React Query/Axios foundation;
- Flutter Dio foundation.

Still required:

- generalized marketplace product model;
- machinery seller onboarding and verification;
- machinery/input product CRUD;
- advanced filters and cursor pagination;
- carts, orders, delivery, payment and invoices;
- saved searches and favorites;
- seller analytics;
- moderation workflows;
- full role-aware dashboard pages;
- Redis-backed popular-query caching;
- search ranking and optional PostgreSQL full-text search.



---

# 19. Public Browsing, Seller Category Approval, Product Guidance, and Tool-Building Knowledge

This section adds the latest owner requirements. These features are planned work and must not be marked complete until backend rules, UI, tests, and practical `features.md` instructions exist.

## 18.1 Public home and marketplace browsing

- The public home page and marketplace/store browsing pages must be accessible without login.
- Guests may view categories, subcategories, listings, product details, public seller profiles, prices, availability, educational tool guides, and public search results.
- Authentication is required only when the visitor attempts a protected action, including:
  - creating or publishing a listing;
  - applying as a seller;
  - requesting category permission;
  - placing an order or offer;
  - saving/favoriting where server persistence is required;
  - contacting a seller through protected chat;
  - adding private farm information;
  - requesting diagnosis history or specialist review.
- Protected actions must open a clear login/register flow and preserve the intended destination/action.
- After successful login, the user returns to the original page and resumes the pending action safely.
- Backend authorization remains authoritative; hiding a button is not sufficient security.

## 18.2 Farmers may also become sellers

- A farmer account may also hold an approved seller role on the same user account.
- Do not create a second account merely because a farmer wants to sell products.
- The user may switch between farmer and seller workspaces using the existing multi-role design.
- Seller approval and category permissions are separate from general account verification.

## 18.3 Admin-managed nested marketplace taxonomy

Create an admin-managed taxonomy that supports unlimited practical depth:

- category;
- subcategory;
- nested child categories;
- localized Bangla and English names;
- slug;
- description;
- image/icon;
- sort order;
- active/inactive status;
- product type and safety classification;
- whether professional documents or licenses are required;
- whether products in the node require moderation before publication.

Recommended model:

`MarketplaceCategory`

- id;
- parentId nullable;
- nameBn;
- nameEn;
- slug;
- descriptionBn/descriptionEn;
- imageUrl;
- depth/path;
- sortOrder;
- status;
- requiresSellerApproval;
- requiresDocumentReview;
- createdBy/updatedBy;
- timestamps.

Rules:

- Taxonomy management occurs in the Next.js admin panel.
- Admins can create, edit, reorder, activate, archive, and move nodes.
- Deleting a category with listings or active seller permissions must be blocked or handled through a controlled migration/archive flow.
- Public APIs return only active taxonomy nodes.
- Listing forms load categories dynamically from the API rather than hard-coding enums.

## 18.4 Seller application by category and subcategory

- A user can apply to sell from the public Next.js website after login.
- The application allows selection of one or more category or subcategory nodes.
- Each requested node may require documents, notes, business details, licenses, location, and experience.
- Admin reviews each requested category independently.
- Approval for one category must not automatically allow selling in another category.
- One seller may hold multiple approved category permissions.
- The seller may later request additional categories without repeating already approved categories.
- Admin can approve, reject, suspend, expire, or revoke each category permission with reviewer notes and an audit event.

Recommended model:

`SellerCategoryPermission`

- id;
- userId;
- categoryId;
- status: pending/approved/rejected/suspended/revoked/expired;
- requestedAt;
- approvedAt;
- expiresAt nullable;
- reviewerId;
- reviewerNotes;
- supporting documents;
- createdAt/updatedAt.

Publishing rule:

- A listing may be drafted in any visible category.
- A listing cannot be submitted/published unless the seller has an active permission for that category or an explicitly inherited parent/child permission according to configured policy.
- The backend must enforce this rule transactionally.

## 18.5 Product knowledge required from sellers

For agricultural inputs, medicines, pesticides, fertilizers, feed, equipment, and similar products, listing creation must collect structured knowledge instead of only a short description.

Required or conditionally required fields:

- Bangla and English title;
- full description;
- intended use cases;
- applicable crop/animal/fish/poultry types;
- target problem, disease, pest, deficiency, or operational need;
- symptoms or conditions for which the product may be relevant;
- usage instructions;
- dosage/rate where legally and safely appropriate;
- application method;
- contraindications and situations where it should not be used;
- safety warnings, protective equipment, withholding period, and storage;
- active ingredient/composition where applicable;
- manufacturer and registration/license data;
- evidence/source provided by seller;
- images and documents;
- moderation and verification status.

Safety rules:

- Seller text must not become a guaranteed diagnosis or medical claim.
- Restricted products require stronger moderation and verified seller permissions.
- AI-generated wording must be labeled, reviewed by the seller, and validated before publication.
- Product recommendations must always show safety warnings and encourage specialist review for uncertain/high-risk cases.

## 18.6 Low-AI-first product recommendation architecture

Goal: use deterministic search and vector retrieval first, and call generative AI only when necessary.

Recommended flow for typed or voice symptom search:

1. Normalize Bangla/English transcript or text.
2. Extract known crop, animal, symptom, season, location, and context using rules/dictionaries first.
3. Generate/query a text embedding only when lexical/filter search is insufficient or vector search is configured.
4. Search PostgreSQL filters plus Qdrant vectors built from approved product knowledge.
5. Rank only active products from approved sellers with valid category permission.
6. Return one or two strongest candidates plus alternatives, evidence fields, warnings, and confidence band.
7. Use Gemini/provider gateway only to clarify ambiguous input, summarize retrieved evidence, or interpret an image when the local/vector path cannot confidently resolve the request.
8. Never let the model invent a product that is not present and active in the marketplace database.

Recommended vector text for each product:

- title;
- description;
- use cases;
- target crops/animals;
- target conditions;
- symptoms;
- active ingredient/composition;
- instructions;
- exclusions and safety notes;
- category path.

## 18.7 Crop image-to-product assistance

1. Farmer uploads or captures crop images and optionally adds symptoms by voice/text.
2. Existing image-profile/Qdrant matching attempts to identify crop, condition, or known visual class.
3. If confidence is insufficient, the provider-neutral vision AI may produce a structured, non-guaranteed interpretation.
4. Backend converts the result into normalized condition/symptom terms.
5. Product retrieval searches only approved marketplace products and verified product-use records.
6. Return one or two likely relevant products only when evidence and safety constraints permit.
7. Also return non-product actions, prevention, and a specialist escalation option.
8. Store the evidence chain: image match, model/version if used, retrieved product IDs, scores, and disclaimer.

## 18.8 Admin-managed practical tool-building guides

Create a separate hierarchical knowledge taxonomy for practical farm tools, structures, repairs, and do-it-yourself guides.

Examples:

- irrigation tools;
- poultry equipment;
- fish-farming equipment;
- storage structures;
- composting tools;
- simple machinery;
- farm repairs;
- livestock housing;
- safety equipment.

Taxonomy requirements:

- unlimited practical nested category structure;
- Bangla/English names and descriptions;
- category image;
- sort order and active status;
- admin management in Next.js.

`ToolGuide`

- id;
- categoryId;
- titleBn/titleEn;
- summary;
- required materials;
- required tools;
- safety warnings;
- estimated difficulty/time/cost;
- ordered steps;
- tags and searchable phrases;
- published status;
- creator/reviewer/audit fields.

`ToolGuideStep`

- guideId;
- sequence;
- title/instruction Bangla and English;
- imageUrl nullable;
- YouTube URL nullable;
- safety note nullable;
- optional materials/tools for this step.

Admin editing requirements:

- Upload step images sequentially.
- Reorder steps and images with drag-and-drop using `react-sortablejs` or a maintained equivalent after compatibility/security review.
- Add, edit, remove, and reorder YouTube links alongside image steps.
- Preview the mobile presentation before publishing.
- Validate YouTube URLs and avoid arbitrary unsafe embeds.

## 18.9 Tool-guide discovery

Farmers can find a guide through:

- category and nested subcategory browsing with images;
- Bangla/English text search;
- Bangla voice search;
- tapping a visual category card;
- uploading/scanning an existing tool image.

Voice flow:

1. Capture Bangla speech.
2. Convert to text using the configured speech service/device support.
3. Search exact terms, synonyms, tags, and vectorized guide text.
4. Use AI only to clarify an ambiguous request or suggest a normalized query.
5. Return matching guides with direct category context.

Image flow:

1. Normalize uploaded image.
2. Search tool image profiles/sample vectors in Qdrant.
3. Show multiple likely matches and related guides.
4. A raw similarity score must not be displayed as a literal probability.
5. A 50–60% calibrated confidence band may be shown only after labeled evaluation demonstrates that interpretation.
6. Low-confidence results must be labeled as possible matches and ask for another angle or manual category selection.

## 18.10 Testing and completion gates

Before marking any item in this section complete, validate:

- guest home/store access and protected-action login return flow;
- nested taxonomy CRUD, reordering, archive/move constraints, and localization;
- multi-category seller application and independent admin decisions;
- server-side prevention of unauthorized category publishing;
- category revocation immediately blocking new publication while preserving audit/history;
- product structured fields and safety validation;
- deterministic/vector-first recommendation with AI fallback disabled/enabled;
- guarantee that recommendations contain only active database products;
- image/voice/text search primary and failure paths;
- tool-guide step drag-and-drop persistence;
- safe YouTube validation and rendering;
- vector confidence calibration using labeled tests;
- backend, Next.js, Flutter tests and practical `features.md` usage instructions.


## OTP provider configuration contract

The implemented OTP and password-reset flow uses the following environment configuration:

```env
OTP_PROVIDER_URL=
OTP_PROVIDER_API_KEY=
OTP_EXPIRES_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
OTP_DAILY_LIMIT=10
OTP_EXPOSE_CODE_IN_DEVELOPMENT=true
```

Rules:

- The backend sends OTP requests to `OTP_PROVIDER_URL`.
- The provider API key is sent through the `x-api-key` request header.
- Both `OTP_PROVIDER_URL` and `OTP_PROVIDER_API_KEY` are required in production.
- In development, leaving the provider URL or API key empty skips real SMS delivery.
- `OTP_EXPOSE_CODE_IN_DEVELOPMENT=true` may expose `developmentCode` only outside production for local testing.
- OTP expiry, resend cooldown, maximum attempts, and daily request limits are controlled by the matching environment values.
- Password-reset OTPs follow the same provider, expiry, cooldown, attempt, and rate-limit rules.
- Provider secrets must never be returned to clients, written to logs, or stored in audit payloads.


## Marketplace implementation note ? 2026-07-17

Completed in this pass:

1. Removed the active Stripe dependency from Next.js checkout; orders now remain unpaid until a future bKash/other gateway adapter is configured.
2. Completed the deterministic recommendation path by adding Unicode-safe tokenization and retaining catalog-only explainable ranking/evaluation.
3. Added the missing saved-search delete API route.
4. Added Next.js favorite/saved-search management UI with apply/remove/delete behavior.
5. Verified backend Nest build and frontend Next.js production build.

Completed follow-up: Flutter parity for favorites and saved searches is implemented, and dedicated Flutter widget tests now cover saved marketplace listing and deletion flows. Recommendation-specific automated coverage remains a separate quality task.
