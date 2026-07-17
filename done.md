# AgriVision AI — Completion Audit

> This checklist records what is currently present in the repository and what remains to be implemented.
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
- [x] Backend uses MongoDB/Mongoose dependencies.
- [x] Backend includes Qdrant JavaScript client dependency.
- [x] Backend includes BullMQ dependencies.
- [x] Backend includes S3 SDK dependency.
- [x] Backend includes Sharp dependency.
- [x] Frontend uses Next.js 16 and React 19.
- [x] Flutter includes Dio, secure storage, AutoRoute, OneSignal, image picker, location, QR, and Stripe packages.
- [ ] Root Docker Compose for MongoDB, Redis, Qdrant, and object storage.
- [ ] Root monorepo command/documentation for starting all three applications.
- [ ] Unified CI workflow for backend, frontend, and Flutter.
- [ ] Production deployment documentation.

Evidence:

- `backend/package.json`
- `frontend/package.json`
- `farmer/pubspec.yaml`

---

## 2. Current Git Working Tree

The audit found uncommitted Flutter changes. These must not be overwritten without review.

- [~] Flutter routing/auth guard changes are in progress.
- [~] Admin workspace UI changes are in progress.
- [~] Agent assist UI changes are in progress.
- [~] Login and splash changes are in progress.
- [~] Diagnosis scanner/result UI changes are in progress.
- [~] Alerts and home UI changes are in progress.
- [~] Marketplace/sell/buyer UI changes are in progress.
- [~] Medicine seller UI changes are in progress.
- [~] Plants UI changes are in progress.
- [~] Main shell/main application changes are in progress.

Modified/untracked evidence:

- `farmer/lib/core/router/app_router.dart`
- `farmer/lib/core/router/auth_guard.dart`
- `farmer/lib/features/**`
- `farmer/lib/main.dart`
- `farmer/lib/pages/main_shell.dart`

Action:

- [ ] Review current diff before feature development.
- [ ] Run Flutter analyze/tests.
- [ ] Commit or safely checkpoint current work.

---

## 3. Backend Foundation

### Application setup

- [x] NestJS application entry point exists.
- [x] Root application module exists.
- [x] Swagger dependency exists.
- [x] Config module dependency exists.
- [x] Validation dependencies exist.
- [x] Helmet/compression/cookie dependencies exist.
- [ ] Verify global validation pipe uses whitelist and forbid-non-whitelisted.
- [ ] Verify CORS allowlist is environment-specific.
- [ ] Verify request ID middleware/interceptor.
- [ ] Verify standardized response/error envelope.
- [ ] Verify global exception filter.
- [ ] Verify secret redaction in logs.
- [ ] Verify backend health/readiness endpoints for MongoDB, Redis, Qdrant, and storage.

### Database

- [x] Mongoose integration dependency exists.
- [~] Multiple Mongoose entity files exist.
- [ ] Database index audit.
- [ ] Soft-delete strategy.
- [ ] migration/versioning strategy.
- [ ] seed scripts for roles/admin/demo data.
- [ ] backup/restore documentation.

### Queue and caching

- [x] BullMQ dependencies exist.
- [x] Cache-manager dependency exists.
- [ ] Redis connection configuration verified.
- [ ] Queue module verified.
- [ ] Dead-letter/retry policy.
- [ ] Worker health metrics.
- [ ] Idempotent job design.

### Object storage

- [x] AWS S3 SDK dependency exists.
- [ ] Storage service module verified.
- [ ] Presigned upload flow.
- [ ] Signed private read URLs.
- [ ] image metadata stripping.
- [ ] thumbnail generation.
- [ ] deletion synchronization.

---

## 4. Authentication, Users, and Roles

### Existing

- [x] User module files exist.
- [x] User controller/service/entity/DTO files exist.
- [x] JWT dependency exists.
- [x] Access-token guard exists.
- [x] Roles decorator exists.
- [x] Roles guard exists.
- [x] Verified-account guard exists.
- [~] Flutter login page exists.
- [~] Flutter auth data/domain/presentation structure exists.
- [~] Flutter auth guard is currently untracked/in progress.

Evidence:

- `backend/src/user/`
- `backend/src/auth/`
- `farmer/lib/features/auth/`

### Remaining

- [ ] Verify registration/login/refresh/logout endpoint behavior.
- [ ] Verify refresh-token rotation and revocation.
- [ ] Phone OTP workflow.
- [ ] password reset.
- [ ] account suspension/deletion.
- [ ] role approval workflow.
- [ ] specialist/veterinary credential verification.
- [ ] seller approval workflow.
- [ ] complete canonical roles:
  - [ ] FARMER
  - [ ] WHOLESALE_BUYER
  - [ ] STUDENT_VOLUNTEER
  - [ ] AGRICULTURE_SPECIALIST
  - [ ] VETERINARY_DOCTOR
  - [ ] SELLER
  - [ ] PUBLIC_USER
  - [ ] ADMIN
  - [ ] SUPER_ADMIN
- [ ] role-based Flutter navigation fully tested.
- [ ] admin role management UI.
- [ ] audit logs for role/status changes.

---

## 5. Admin Panel

### Existing

- [x] Backend admin module exists.
- [x] Admin controller/service/DTO/entity files exist.
- [x] Next.js admin dashboard components exist.
- [x] Admin overview component exists.
- [x] Admin market controls component exists.
- [x] Admin resource panels component exists.
- [x] Frontend admin API helper exists.
- [~] Flutter admin workspace exists and is modified.

Evidence:

- `backend/src/admin/`
- `frontend/components/admin/`
- `frontend/lib/admin-api.ts`
- `farmer/lib/features/admin/`

### Remaining

- [ ] Confirm Next.js authentication and secure session handling.
- [ ] Enforce admin RBAC in backend.
- [ ] user/farmer management completion.
- [ ] specialist/seller approvals.
- [ ] marketplace moderation.
- [ ] product management.
- [ ] weather monitoring dashboard.
- [ ] AI model/provider management.
- [ ] Gemini key-health dashboard without raw key display.
- [ ] reports and analytics.
- [ ] payment/order oversight.
- [ ] advertisements.
- [ ] CMS.
- [ ] support tickets.
- [ ] audit log viewer.
- [ ] image-profile management UI.

---

## 6. Marketplace and E-Commerce

### Existing

- [x] Backend listing module exists.
- [x] Listing controller/service/entity/DTO/search DTO exist.
- [x] Listing owner guard exists.
- [x] Backend goods module exists.
- [x] Backend deals/negotiation module exists.
- [x] Backend market-price module exists.
- [x] Backend medicine seller/catalog module exists.
- [~] Flutter marketplace page exists.
- [~] Flutter sell product page exists.
- [~] Flutter buyer listing browser exists.
- [~] Flutter buyer deals panel exists.
- [~] Flutter seller panels exist.
- [~] Medicine seller nearby panels exist.

Evidence:

- `backend/src/listings/`
- `backend/src/goods/`
- `backend/src/deals/`
- `backend/src/market-price/`
- `backend/src/medicine-sellers/`
- `farmer/lib/features/marketplace/`

### Remaining

- [ ] Confirm listing CRUD is API-backed and fully authorized.
- [ ] canonical marketplace category model.
- [ ] bulk purchase.
- [ ] live auction workflow.
- [ ] direct chat.
- [ ] product search filters and pagination.
- [ ] voice search.
- [ ] AI recommendation engine.
- [ ] shopping cart.
- [ ] checkout.
- [ ] payment gateway integration against orders.
- [ ] order tracking.
- [ ] delivery status.
- [ ] invoice creation.
- [ ] review/rating.
- [ ] AI image edit/background removal adapter.
- [ ] AI listing description generation.
- [ ] market price suggestion.
- [ ] best selling time.
- [ ] best price guidance.
- [ ] seller moderation and restricted-product controls.
- [ ] no internal wallet dependencies in checkout.

---

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
- [ ] No verified 5–10 key rotation pool.
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

- [ ] `ImageProfile` MongoDB schema.
- [ ] `ImageProfileAsset` schema.
- [ ] profile create/update/archive endpoints.
- [ ] domain/category/canonical label fields.
- [ ] model/version fields.
- [ ] configurable match thresholds.
- [ ] profile state machine: draft/processing/active/archived.
- [ ] admin permissions.

### 10–500 image bulk upload

- [ ] Next.js multi-file uploader.
- [ ] file count validation (10 minimum for activation, 500 maximum per profile operation).
- [ ] upload chunking (10–25 recommended).
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
- [ ] `0.70–0.8499` possible match; request more images/show alternatives.
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
- [ ] MongoDB/storage/Qdrant coordinated deletion.
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

## 27. Immediate Next Work Order

Execute in this order to reduce rework:

1. [ ] Review and checkpoint current uncommitted Flutter changes.
2. [ ] Run all three project build/lint/analyze commands and record failures.
3. [ ] harden backend bootstrap, config validation, response/errors, health endpoints.
4. [ ] verify and complete authentication/roles.
5. [ ] create local Docker Compose for MongoDB, Redis, Qdrant, and S3-compatible storage.
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

### Pass 1 — PDF scope coverage

- [x] Crop features captured.
- [x] Weather and alert features captured.
- [x] voice assistant captured.
- [x] marketplace/e-commerce captured.
- [x] all PDF user roles captured.
- [x] invoice/chat/consultation/news/government/admin captured.
- [x] livestock/poultry/fisheries/river safety captured.
- [x] Digital Farm captured.

### Pass 2 — Owner instruction compliance

- [x] Flutter retained.
- [x] NestJS retained.
- [x] Next.js retained.
- [x] Gemini first provider.
- [x] 5–10 Gemini key architecture specified.
- [x] future OpenAI/custom provider extensibility specified.
- [x] Qdrant image-profile workflow specified.
- [x] 10–500 image ingestion specified.
- [x] 70–80% confidence behavior treated as configurable/calibrated rather than raw similarity.
- [x] Wallet ignored.
- [x] Future AI Features ignored.
- [x] suggested replacement technologies ignored.

### Pass 3 — Repository reality check

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

# 30. Extended Completion Audit — Weather, Voice, Siren, Performance, Roles, and Routing

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

- [!] Do not mark “siren always works while app is closed” complete based only on emulator or one Android phone. It requires multi-device physical testing and platform-policy verification.

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
- [ ] support impersonation disabled by default.
- [ ] controlled/audited support mode if later enabled.

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
- [ ] 100–500 image selection/upload profiling where supported.
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

# 31. Final Rules Audit — OneSignal, Siren, Qdrant Fallback, Cache, Glassmorphism, Skeletons, and Feature Handoff

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

- [ ] Collect 3–5 relevant references.
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

# 32. Verified Implementation — PostgreSQL, Shared Backend Library, API Hooks, and Package Foundation

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
