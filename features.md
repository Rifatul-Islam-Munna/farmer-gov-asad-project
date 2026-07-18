# Implemented Features

## FEATURE-001 â€” PostgreSQL and TypeORM Backend Foundation

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

Login:

1. go to login page enter username and password and lcik the buutton it will b elogin


---

# Feature Writing Rule

From now on, every completed feature must be documented in this simple practical format:

```md
Feature Name:

Where to use:
1. exact page or route

How to test:
1. first user action
2. second user action
3. button to click
4. expected result

Failure test:
1. wrong or missing input
2. expected error message

Available in:
- Flutter
- Next.js
- Backend API
```

Do not write only technical implementation details. Always explain how a normal user can open and test the feature.

---

CONFIG_ENCRYPTION_KEY:

Where it is used:
1. It is stored only in `backend/.env`.
2. NestJS uses it to encrypt Gemini, Windy and OneSignal secrets before saving them in PostgreSQL.
3. Next.js and Flutter must never receive this key.

Why we use it:
1. The admin enters provider API keys from the Next.js dashboard.
2. Sending those provider keys directly to PostgreSQL as plain text would be unsafe.
3. NestJS uses `CONFIG_ENCRYPTION_KEY` to convert those keys into encrypted text.
4. When NestJS needs to call Gemini, Windy or OneSignal, it decrypts the stored value inside the backend.
5. If someone reads the PostgreSQL table without this encryption key, they should not be able to read the original provider secrets.

How to configure:
1. Open `backend/.env`.
2. Add one long random value:

   ```env
   CONFIG_ENCRYPTION_KEY=your-long-random-secret
   ```

3. Do not use a short password such as `123456`.
4. Do not add this value to Flutter `.env`.
5. Do not add this value to Next.js public environment variables.
6. Do not change it after encrypted settings have been saved unless a key-rotation process is implemented.

How to test:
1. Start the backend and Next.js dashboard.
2. Log in as admin.
3. Open `/dashboard/admin`.
4. Open **AI & providers**.
5. Add a Gemini test key and save it.
6. Refresh the page.
7. The key should appear masked, not as the original full key.
8. Check the PostgreSQL `integration_settings` table.
9. The saved value should look encrypted and must not contain the original Gemini key in plain text.

Failure test:
1. Stop the backend.
2. Remove `CONFIG_ENCRYPTION_KEY` from `backend/.env`.
3. Start the backend again.
4. Try to save provider settings.
5. The save must fail safely.
6. The provider key must not be stored as plain text.

Important:
1. Losing this key means previously encrypted provider settings may no longer be decryptable.
2. Committing this key to Git would expose all encrypted provider settings.
3. Use a secret manager in production.

---

Login:

Where to use:
1. Flutter login page.
2. Next.js admin login page at `/dashboard/admin`.
3. Backend API endpoint `POST /user/login-user`.

How to test in Flutter:
1. Open the Flutter app.
2. Go to the login page.
3. Enter a registered phone number or email.
4. Enter the correct password.
5. Click the login button.
6. The app should save the access token.
7. The user should be redirected to the correct authenticated page.
8. Close and reopen the app.
9. The user session should remain available if the token is still valid.

How to test in Next.js:
1. Open `http://localhost:3000/dashboard/admin`.
2. Enter the configured admin email and password.
3. Click the login button.
4. The admin dashboard should open.
5. Dashboard requests such as `/admin/dashboard` should return data.

How to test from Swagger:
1. Start the backend.
2. Open `http://localhost:4000/docs`.
3. Find `POST /user/login-user`.
4. Enter a registered phone number or email and password.
5. Click **Execute**.
6. The response should contain `access_token` and user data.
7. Copy the token.
8. Click Swagger **Authorize**.
9. Enter the Bearer token.
10. Call `GET /user/get-my-profile`.
11. The logged-in user profile should be returned.

Expected result:
1. Correct credentials return HTTP 200.
2. The response contains `access_token`.
3. The response contains the logged-in user.
4. Protected endpoints work with the token.

Failure test:
1. Enter the wrong password.
2. The login must fail with a readable error.
3. Enter an unknown phone number or email.
4. The login must fail without creating a new user.
5. Call a protected endpoint without a token.
6. The backend must return HTTP 401.
7. Use an expired or invalid token in Flutter.
8. The app should clear the session and return to login.


---

Role Dashboard UI:

Where to use:
1. Next.js admin dashboard: `http://localhost:3000/dashboard/admin`.
2. Farmer dashboard: `http://localhost:3000/dashboard/farmer`.
3. Buyer dashboard: `http://localhost:3000/dashboard/buyer`.
4. Wholesale buyer dashboard: `http://localhost:3000/dashboard/wholesale-buyer`.
5. Seller dashboard: `http://localhost:3000/dashboard/seller`.
6. Machinery seller dashboard: `http://localhost:3000/dashboard/machinery-seller`.
7. Medicine seller dashboard: `http://localhost:3000/dashboard/medicine-seller`.
8. Agent dashboard: `http://localhost:3000/dashboard/agent`.
9. Agriculture specialist dashboard: `http://localhost:3000/dashboard/agriculture-specialist`.
10. Veterinary doctor dashboard: `http://localhost:3000/dashboard/veterinary-doctor`.
11. Government officer dashboard: `http://localhost:3000/dashboard/government-officer`.
12. Support dashboard: `http://localhost:3000/dashboard/support`.

How to test:
1. Open PowerShell in `frontend/`.
2. Run `npm run dev`.
3. Open one of the dashboard routes above.
4. Confirm the page shows a role-specific heading.
5. Confirm the page shows four summary cards.
6. Confirm the page shows role-specific quick actions.
7. Confirm the page shows recent activity cards.
8. Resize the browser to mobile, tablet and desktop width.
9. Confirm cards stack correctly and text does not overflow.
10. Open another role route and confirm the content changes for that role.

Expected result:
1. Farmer sees crop scan, farm records, weather and marketplace actions.
2. Buyer sees crop search, offers, deliveries and supplier actions.
3. Seller sees products, inventory, orders and analytics actions.
4. Machinery seller sees machinery, rental calendar, parts and service-area actions.
5. Agent sees farmer registration, delegated listing and OTP consent actions.
6. Specialist and veterinary roles see case, consultation and follow-up actions.
7. All dashboards use the same responsive glass design system.

Failure test:
1. Open `http://localhost:3000/dashboard/random-role`.
2. The page must return the Next.js 404 page.
3. Run `npm run build`.
4. The build must complete without TypeScript or route errors.

Available in:
- Next.js

---

Flutter Role Home Card:

Where to use:
1. Open the Flutter app.
2. Log in with any approved role account.
3. Open the Home tab.

How to test:
1. Log in as a farmer.
2. Open Home.
3. Confirm the role card says the farmer title and description.
4. Confirm the card shows the farmer icon and farmer safety tip.
5. Log out.
6. Log in as buyer, agent, medicine seller or admin.
7. Open Home again.
8. Confirm the role card content changes based on the logged-in role.
9. Scroll the page and confirm the role card remains readable with the existing glass background.
10. Tap the existing role action items below the card and confirm they open the expected tab or panel.

Expected result:
1. Farmer sees farming-focused content.
2. Buyer sees marketplace and negotiation-focused content.
3. Agent sees farmer-assistance content.
4. Medicine seller sees stock and shop-location content.
5. Admin sees management-focused content.
6. The card uses the same modern glass style as the rest of the application.
7. No overflow appears on a small mobile screen.

Failure test:
1. Use an account with an unknown or missing role value.
2. The home page must safely use the farmer/default content instead of crashing.
3. Run `flutter analyze` and confirm no issues.
4. Run `flutter test` and confirm all tests pass.

Available in:
- Flutter

---

Git Working Tree Review:

Where to use:
1. Project root: `D:\custom-coding\project-gov-farmer`.
2. Tracking checklist: `done.md` section 2.

How to test:
1. Open PowerShell in the project root.
2. Run `git status`.
3. Run `git diff --stat`.
4. Confirm every modified file belongs to the current planned work.
5. Confirm no unexpected Flutter work was removed.
6. Run Flutter analyze and tests.
7. Run Next.js lint and production build.
8. Open `done.md` section 2 and confirm the reviewed items are marked complete.
9. Open `features.md` and confirm the new UI has practical test instructions.

Expected result:
1. Git shows only intentional project changes.
2. Existing routes and feature files remain present.
3. Flutter validation passes.
4. Next.js validation passes.
5. The project is ready for the next checklist section.

Failure test:
1. If Git shows an unknown deleted or modified file, do not continue to the next section.
2. Review the diff and restore or document the change first.
3. If Flutter or Next.js validation fails, section 2 must not be considered complete.

Available in:
- Repository workflow


---

Backend Health and Request Tracking:

Where to use:
1. Liveness endpoint: `http://localhost:4000/health/live`.
2. Readiness endpoint: `http://localhost:4000/health/ready`.
3. Any backend endpoint that returns success or error.

How to test:
1. Open PowerShell in `backend/`.
2. Run `npm run start`.
3. Open `http://localhost:4000/health/live`.
4. Confirm the response shows `success: true`, `status: ok`, uptime, request ID and timestamp.
5. Open `http://localhost:4000/health/ready`.
6. Confirm PostgreSQL shows `available: true` and `required: true`.
7. Confirm Redis, Qdrant and storage each show configured, available and required status.
8. Send a request with header `x-request-id: my-test-request`.
9. Confirm the same ID appears in the response header and body.
10. Call a protected endpoint without a token.
11. Confirm the error response has `success: false` and its request ID.

Expected result:
1. Liveness returns HTTP 200 while the NestJS process is running.
2. Readiness returns `ready` or `degraded` when PostgreSQL is available.
3. Optional Redis, Qdrant or MinIO failure does not stop the API.
4. PostgreSQL failure prevents the backend from becoming ready.
5. Every normal JSON response contains a traceable request ID.

Failure test:
1. Stop PostgreSQL and start the backend.
2. The backend must fail because PostgreSQL is required.
3. Configure an invalid Redis or Qdrant URL.
4. The backend must log the dependency failure but still start.
5. `GET /health/ready` must report the optional dependency as unavailable/degraded.

Available in:
- Backend API
- Swagger

---

Standard API Response Envelope:

Where to use:
1. Any successful backend JSON endpoint.
2. Any validation, authorization or server error endpoint.

How to test:
1. Start the backend.
2. Call `GET /`.
3. Confirm the response includes `success: true`, `requestId` and `timestamp`.
4. Call `GET /goods`.
5. Confirm existing `data` remains available and the response also includes the standard envelope fields.
6. Call `GET /user/get-my-profile` without a token.
7. Confirm the response includes `success: false`, HTTP status, message, path, method, request ID and timestamp.

Expected result:
1. Existing Flutter and Next.js response data is not removed.
2. Success and error responses have consistent tracing fields.
3. PostgreSQL errors are not returned as raw database stack messages.

Failure test:
1. Send an invalid request body to `POST /user`.
2. Confirm validation messages are readable.
3. Try a duplicate unique value.
4. Confirm a controlled conflict response appears.

Available in:
- Flutter API calls
- Next.js API calls
- Swagger

---

PostgreSQL Seed Command:

Where to use:
1. Backend project folder.
2. Development or controlled staging database only.

How to test:
1. Configure PostgreSQL in `backend/.env`.
2. Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` if an admin seed is required.
3. Open PowerShell in `backend/`.
4. Run `npm run seed`.
5. Confirm the terminal prints `Idempotent seed hooks completed successfully`.
6. Check PostgreSQL for starter goods categories, goods, market prices and medicines.
7. Run `npm run seed` a second time.
8. Confirm unique rows are updated or reused instead of duplicated.

Expected result:
1. The seed command exits successfully.
2. PostgreSQL connection closes after completion.
3. Running it repeatedly does not create duplicate catalog records.
4. Configured admin login works after seeding.

Failure test:
1. Use invalid PostgreSQL credentials.
2. Run `npm run seed`.
3. The command must fail without claiming success.

Available in:
- Backend operations

---

Soft Delete Foundation:

Where to use:
1. Any TypeORM entity inheriting `BaseAppEntity`.
2. Backend repository/service code using `softDelete`, `softRemove` or `restore`.

How to test:
1. Start the backend with `DB_SYNCHRONIZE=true` in development.
2. Inspect an entity table such as `users` or `listings`.
3. Confirm the table contains a nullable `deletedAt` column.
4. From a development script or future delete endpoint, call TypeORM `softDelete(id)`.
5. Query the row normally.
6. Confirm it is not returned.
7. Query with `withDeleted: true`.
8. Confirm the row is returned with `deletedAt` populated.
9. Call `restore(id)`.
10. Confirm the row appears in normal reads again.

Expected result:
1. Normal reads exclude soft-deleted rows.
2. The physical row remains available for audit or restore.
3. Restore clears the soft-delete state.

Failure test:
1. Do not use hard delete for audit-sensitive orders, deals or user records without a retention process.
2. If a service accidentally calls `delete`, review and replace it before marking that feature complete.

Available in:
- Backend TypeORM services

---

Resilient Queue Foundation:

Where to use:
1. Backend services that inject `ResilientQueueService`.
2. Future AI, notification, media and report jobs.

How to test without Redis:
1. Remove or invalidate `REDIS_URL`.
2. Start the backend.
3. Call `ResilientQueueService.add(...)` from a development test/service.
4. Confirm it returns `queued: false` with a reason.
5. Confirm the API process continues running.

How to test with Redis:
1. Start Redis.
2. Configure `REDIS_URL`.
3. Add a test job with a unique `jobId`.
4. Confirm the job appears in Redis/BullMQ.
5. Add the same job ID again.
6. Confirm duplicate job behavior is controlled by BullMQ idempotency.
7. Inspect the job options.
8. Confirm attempts and exponential backoff are configured.

Expected result:
1. Redis failure does not crash the backend.
2. Jobs use bounded retries.
3. Completed and failed jobs have retention limits.
4. Caller-provided job IDs can prevent duplicate work.

Failure test:
1. Use an unavailable Redis port.
2. Add a job.
3. Confirm an actionable queue error is logged without printing Redis credentials.

Important limitation:
1. Real AI, notification, media and report workers are not implemented yet.
2. Worker heartbeat, Prometheus metrics and dead-letter queues remain incomplete.

Available in:
- Backend services

---

MinIO Image and Signed URL Foundation:

Where to use:
1. Backend services that inject `MinioService`.
2. Future scanner, profile, listing, document and product upload endpoints.

How to test after MinIO is configured:
1. Set `MINIO_URL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` and `MINIO_BUCKET` in `backend/.env`.
2. Start MinIO.
3. Start the backend.
4. Confirm the backend logs that the bucket is ready.
5. Call `getSignedUploadUrl` with an object key and content type.
6. Upload a file using the returned URL.
7. Call `getSignedReadUrl` and open the returned private URL.
8. Call `uploadSanitizedImage` with a JPEG or PNG file.
9. Confirm it returns an original WebP key and thumbnail WebP key.
10. Download both images.
11. Confirm the thumbnail is smaller and the original metadata is not retained.
12. Call `deleteObjects` with both keys.
13. Confirm both objects are removed.

Expected result:
1. Private objects are accessed through expiring signed URLs.
2. Image uploads are rotated correctly, resized, converted to WebP and stripped of original metadata.
3. A thumbnail is generated.
4. Original and thumbnail keys can be deleted together.

Failure test:
1. Start the backend without MinIO credentials.
2. Confirm the backend still starts.
3. Call a MinIO operation.
4. Confirm it returns service unavailable instead of crashing the process.

Important limitation:
1. Public authenticated upload controller endpoints are not implemented yet.
2. Real MinIO integration tests require working credentials.

Available in:
- Backend storage services

---

PostgreSQL Backup and Restore Process:

Where to use:
1. `backend/docs/database-operations.md`.

How to test:
1. Create a custom-format backup using the documented `pg_dump` command.
2. Record the backup timestamp, app version, checksum and retention date.
3. Create a separate restore-test database.
4. Restore the backup using `pg_restore`.
5. Point a test backend instance to the restored database.
6. Open `/health/ready`.
7. Test login, profile, listings and admin dashboard.
8. Compare important table counts with the source database.
9. Record restore duration and any errors.
10. Delete the restore-test database securely after verification.

Expected result:
1. The restored backend starts successfully.
2. Critical user and marketplace flows work.
3. Row counts and schema match the expected backup state.

Failure test:
1. If restore fails or smoke tests fail, the backup must not be considered valid.
2. Do not restore directly over production during testing.

Available in:
- Backend/database operations


---

Refresh Token Login:

Where to use:
1. Backend endpoint `POST /user/login-user`.
2. Backend endpoint `POST /user/refresh-token`.
3. Swagger at `http://localhost:4000/docs`.

How to test:
1. Register or use an existing active account.
2. Call `POST /user/login-user` with the correct phone/email and password.
3. Confirm the response contains `access_token`, `refresh_token` and user data.
4. Copy the refresh token.
5. Call `POST /user/refresh-token` with:

   ```json
   {
     "refreshToken": "copied-refresh-token"
   }
   ```

6. Confirm a new access token and a new refresh token are returned.
7. Compare the old and new refresh tokens.
8. Confirm they are different.
9. Try using the old refresh token again.

Expected result:
1. Login returns HTTP 200.
2. Refresh returns HTTP 200.
3. Refresh token rotates on every successful refresh.
4. Reusing the old refresh token returns HTTP 401.
5. PostgreSQL `auth_sessions` contains only the token hash, not the raw refresh token.

Failure test:
1. Send a random refresh token.
2. The backend must return HTTP 401.
3. Use an expired or revoked refresh token.
4. The backend must return HTTP 401.

Available in:
- Backend API
- Swagger

---

Server-side Logout:

Where to use:
1. Backend endpoint `POST /user/logout`.
2. Flutter logout action.
3. Next.js admin logout action.

How to test:
1. Log in and copy the access token.
2. Call a protected endpoint and confirm it works.
3. Call `POST /user/logout` with the Bearer access token.
4. Call `GET /user/get-my-profile` again with the same access token.

Expected result:
1. Logout returns a success message.
2. All active refresh sessions for the account are revoked.
3. The old access token immediately returns HTTP 401.
4. The client clears its local session.

Failure test:
1. Call logout without a token.
2. The backend must return HTTP 401.

Available in:
- Flutter
- Next.js
- Backend API

---

Multi-role User Management:

Where to use:
1. Next.js admin page at `http://localhost:3000/dashboard/admin`.
2. Open the Users section.
3. Backend endpoint `PATCH /admin/users/:id/roles`.

How to test:
1. Log in as admin.
2. Open Users.
3. Find a farmer account.
4. Confirm the current active role has an `active` badge.
5. Check the Buyer role checkbox while keeping Farmer checked.
6. Wait for the update request to complete.
7. Refresh the page.
8. Confirm both Farmer and Buyer badges appear.
9. Confirm the original active role remains visible.
10. Try removing every role.

Expected result:
1. One account can hold multiple approved roles.
2. At least one role is always required.
3. Role changes revoke existing sessions.
4. The user must sign in again after role changes.
5. An audit event is created.

Failure test:
1. Call the roles endpoint with a farmer token.
2. It must return HTTP 403.
3. Send an empty roles array.
4. It must return a validation/conflict error.

Available in:
- Next.js admin
- Backend API

---

Account Suspension:

Where to use:
1. Next.js admin Users section.
2. Backend endpoint `PATCH /admin/users/:id/account-status`.

How to test:
1. Log in as admin.
2. Open Users.
3. Choose an active non-admin test account.
4. Change Account status from Active to Suspended.
5. Try logging in with that account.
6. Try using any old access token belonging to that account.
7. Change the account back to Active.
8. Log in again.

Expected result:
1. Suspended account login returns HTTP 403.
2. Previously issued access tokens return HTTP 401.
3. Refresh sessions are revoked.
4. Reactivated account can log in again.
5. Suspension and reactivation are written to audit logs.

Failure test:
1. Attempt the status change with a non-admin account.
2. It must return HTTP 403.

Available in:
- Next.js admin
- Backend API

---

Verification Approval:

Where to use:
1. Next.js admin Users section.
2. Backend endpoint `PATCH /admin/users/:id/verification`.

How to test:
1. Register a role that requires approval, such as seller, agent, specialist or veterinary doctor.
2. Log in as admin.
3. Open Users.
4. Confirm the new account shows Pending.
5. Change verification to Approved.
6. Refresh the page.
7. Confirm the account shows Approved.

Expected result:
1. Verification state is separate from role.
2. Verification change invalidates old sessions.
3. Verification change is stored in audit logs.
4. Verified-account guarded endpoints accept the account after a new login.

Failure test:
1. Reject the account.
2. Confirm verified-only endpoints return HTTP 403.

Available in:
- Next.js admin
- Backend API

---

Authentication Audit Logs:

Where to use:
1. Backend endpoint `GET /admin/audit-logs`.
2. Swagger with an admin Bearer token.

How to test:
1. Log in as a normal test user.
2. Log out.
3. As admin, change that user's roles.
4. Suspend and reactivate the user.
5. Approve or reject verification.
6. Call `GET /admin/audit-logs?limit=50`.

Expected result:
1. The response includes recent login/logout events.
2. Role changes include before and after values.
3. Account status changes include before and after values.
4. Verification changes include before and after values.
5. Actor user ID and target user ID are present.
6. Only admin/super-admin can read the endpoint.

Failure test:
1. Call the endpoint with a farmer token.
2. It must return HTTP 403.
3. Call it without a token.
4. It must return HTTP 401.

Available in:
- Backend API
- Swagger

---

Admin User Access UI:

Where to use:
1. `http://localhost:3000/dashboard/admin`.
2. Open Users.

How to test:
1. Confirm each user appears inside a responsive access-management card.
2. Confirm verification status is visible.
3. Confirm account status is visible.
4. Confirm all approved roles appear as badges.
5. Confirm the active role has a different badge style.
6. Resize the browser to mobile, tablet and desktop widths.
7. Change verification, account status and roles.
8. Confirm the page refreshes data after each successful change.

Expected result:
1. User access controls remain readable at all screen sizes.
2. Role checkboxes call the dedicated roles endpoint.
3. Verification selector calls the verification endpoint.
4. Account status selector calls the account-status endpoint.
5. Errors appear as readable dashboard notifications.

Failure test:
1. Stop the backend.
2. Attempt a role or status change.
3. The dashboard must show a readable error and must not silently pretend the update succeeded.

Available in:
- Next.js admin

---

Authentication Remaining Work:

1. OTP delivery, password reset, Flutter token refresh, Next.js secure cookie sessions, CSRF protection, role switching and professional document review are implemented.
2. Full Supertest end-to-end coverage for every authentication and RBAC scenario remains incomplete.


---

Next.js System and Audit Dashboard:

Where to use:
1. Start the backend.
2. Start the Next.js frontend.
3. Open `http://localhost:3000/dashboard/admin`.
4. Log in as admin.
5. Open **System & audit** from the left navigation.

How to test:
1. Confirm four dependency cards appear.
2. Confirm PostgreSQL shows Available.
3. Confirm Redis, Qdrant and Object storage show Available, Unavailable or Not configured.
4. Confirm each card states whether the dependency is required or optional.
5. Click Refresh.
6. Confirm the status updates without reloading the whole page.
7. Perform an audited action, such as changing a user's role or account status.
8. Return to **System & audit**.
9. Click Refresh.
10. Confirm the new audit event appears.
11. Confirm the audit event shows action, entity type, actor, target and time.
12. For a role/status change, confirm Before and After values appear.

Expected result:
1. PostgreSQL is marked as a required dependency.
2. Redis, Qdrant and storage are marked optional.
3. Optional dependency failure is displayed as degraded but does not crash the dashboard.
4. Audit events are readable and ordered from newest to oldest.
5. Raw provider secrets are never displayed in audit details.

Failure test:
1. Stop Redis or set an invalid Redis URL.
2. Restart the backend.
3. Open **System & audit**.
4. Confirm Redis shows Unavailable or Degraded.
5. Confirm the admin dashboard still loads.
6. Call the audit endpoint with a farmer token.
7. Confirm the backend returns HTTP 403.

Available in:
- Next.js admin
- Backend API

---

Flutter Admin Control Center:

Where to use:
1. Open the Flutter app.
2. Log in with an approved admin account.
3. Open the admin workspace from the role-specific home/admin action.

How to test:
1. Confirm the top header says **Admin control center**.
2. Confirm four metric cards appear for Users, Pending, Listings and Deals.
3. Confirm the System health card appears.
4. Confirm PostgreSQL, Redis, Qdrant and Storage status chips appear.
5. Pull down on the page to refresh.
6. Confirm the metrics and health status reload.
7. Find a pending account.
8. Tap Approve or Reject.
9. Confirm a success toast appears.
10. Confirm the account disappears from the pending list after refresh.
11. Scroll to Recent audit activity.
12. Confirm recent actions and actor IDs are visible.
13. Enter a notice title and message.
14. Select a target role.
15. Tap Publish notice.
16. Confirm a success toast appears.

Expected result:
1. Admin metrics load from `/admin/dashboard`.
2. Health data loads from `/health/ready`.
3. Pending users load from `/admin/users/pending`.
4. Audit events load from `/admin/audit-logs`.
5. Notice publishing uses `/admin/guidance`.
6. Layout remains readable on small phones and larger tablets.
7. Pull-to-refresh reloads all admin data.

Failure test:
1. Stop the backend.
2. Open the admin workspace.
3. Confirm a retry card appears instead of an application crash.
4. Leave notice title or message empty.
5. Tap Publish notice.
6. Confirm a warning toast appears and no request is sent.
7. Log in with a non-admin account and try to open admin endpoints.
8. Confirm the backend returns HTTP 403.

Available in:
- Flutter
- Backend API

---

Admin Marketplace Controls:

Where to use:
1. Open `http://localhost:3000/dashboard/admin`.
2. Use Listings, Deals, Prices & goods and Inventory sections.

How to test Listings:
1. Open Listings.
2. Search by product name, code, owner ID, status or address.
3. Change a listing status.
4. Refresh the page.
5. Confirm the new status remains.

How to test Deals:
1. Open Deals.
2. Search by deal ID, buyer ID, farmer ID or status.
3. Change deal status to a valid value.
4. Refresh and confirm the update.

How to test Prices and goods:
1. Open Prices & goods.
2. Review current market prices and goods catalog.
3. Add or update a market price using valid values.
4. Confirm the updated row appears after refresh.

How to test Inventory:
1. Open Inventory.
2. Search by shop, medicine/product name or address.
3. Update stock, price or active status.
4. Refresh and confirm the update.

Expected result:
1. Search filters the current section only.
2. Valid updates are saved through protected admin endpoints.
3. The UI refreshes after a successful change.
4. Errors are shown as readable messages.

Failure test:
1. Stop the backend and attempt an update.
2. Confirm the dashboard reports an error.
3. Use a non-admin token.
4. Confirm backend admin endpoints return HTTP 403.

Important limitation:
1. Marketplace moderation currently changes status only.
2. Moderation reason, reviewer notes, appeal state and evidence review are not implemented yet.
3. Machinery/input product administration depends on the future generalized product model.

Available in:
- Next.js admin
- Backend API

---

Admin Panel Remaining Work:

1. Secure HTTP-only sessions, CSRF protection, protected routes, professional document review, audit filters/export and image-profile management are implemented.
2. Advanced reports and historical uptime charts remain incomplete.
3. Payment, refund and delivery oversight remain incomplete because those modules do not exist yet.
4. Advertisements, CMS and support tickets remain incomplete.


---

Marketplace Buyer Search and Filters:

Where to use:
1. Open the Flutter app.
2. Log in as buyer, wholesale buyer or another role allowed to browse public marketplace listings.
3. Open the Marketplace page.

How to test:
1. Confirm the page shows real backend listings, not fixed demo products.
2. Enter a product name such as rice, fish, tractor or fertilizer in the search field.
3. Submit the search.
4. Tap the filter icon.
5. Choose a category.
6. Enter a district/location.
7. Enter minimum and maximum price.
8. Enter minimum available quantity.
9. Enable Delivery available.
10. Enable Negotiable only.
11. Choose a sort option.
12. Tap Apply filters.
13. Confirm only matching listings appear.
14. Use Previous and Next to move between pages.
15. Confirm the page number, total pages and total listing count update.

Expected result:
1. Search calls `GET /listings`.
2. Category, location, price, quantity, delivery and negotiable filters are sent to the backend.
3. Sorting works for newest, price and quantity.
4. Each listing card shows category, available quantity, location, minimum price and applicable tags.
5. Pagination never loads more than the configured page size.
6. Live market-price cards still load from the backend below the listing browser.

Failure test:
1. Enter a price range that cannot match any listing.
2. Confirm the app shows `No matching listings found`.
3. Stop the backend and search again.
4. Confirm a readable error card appears instead of an application crash.
5. Send a page size greater than 50 directly to the API.
6. Confirm validation rejects it.

Available in:
- Flutter
- Backend API

---

Marketplace Seller Listing:

Where to use:
1. Open the Flutter app.
2. Log in as an approved farmer or permitted seller role.
3. Open the Sell product/listing page.

How to test:
1. Choose a marketplace category.
2. Enter the product name and product code.
3. Enter a clear description.
4. Enter quantity and unit.
5. Enter government, market and minimum prices.
6. Enter pickup location.
7. Enter grade or quality when applicable.
8. Enable Delivery available if delivery is offered.
9. Enable Price negotiable when buyers may negotiate.
10. Tap Publish listing.
11. Confirm a success message appears.
12. Scroll to My listings.
13. Confirm the new listing appears with quantity, price and status.
14. Open the buyer marketplace and filter by the selected category.
15. Confirm the new listing appears there.

Expected result:
1. The listing is stored in PostgreSQL.
2. Category and transaction type are stored.
3. Description, grade, delivery and negotiable values are returned by the API.
4. Existing crop listing clients still work because agricultural output and sale are the defaults.
5. Unauthorized users cannot publish listings.

Failure test:
1. Leave required fields empty.
2. Confirm Flutter form validation prevents submission.
3. Enter non-numeric quantity or price.
4. Confirm validation prevents submission.
5. Submit a minimum price more than twice the market price.
6. Confirm the backend rejects it as unusually high.
7. Try publishing with a buyer-only token.
8. Confirm the backend returns HTTP 403.

Available in:
- Flutter
- Backend API

---

Marketplace Listing API Pagination:

Where to use:
1. Swagger at `http://localhost:4000/docs`.
2. Endpoint `GET /listings`.

How to test:
1. Start the backend.
2. Open Swagger.
3. Call `GET /listings` with:

   ```text
   category=machinery
   deliveryAvailable=true
   minimumQuantity=1
   sortBy=priceHigh
   page=1
   pageSize=5
   ```

4. Execute the request.
5. Inspect the response.

Expected result:
1. `data` contains only matching published/reserved listings.
2. `pagination.page` equals 1.
3. `pagination.pageSize` equals 5.
4. `pagination.total` contains total matching rows.
5. `pagination.totalPages` is present.
6. `pagination.hasNextPage` is present.
7. Results are sorted by highest minimum price first.

Failure test:
1. Use an unsupported category.
2. Confirm validation returns HTTP 400.
3. Use `page=0`.
4. Confirm validation returns HTTP 400.
5. Use `pageSize=100`.
6. Confirm validation returns HTTP 400.

Available in:
- Backend API
- Swagger

---

Marketplace Offer Flow:

Where to use:
1. Flutter buyer marketplace.
2. Backend endpoints under `/offers` and `/deals`.

How to test:
1. Log in as buyer.
2. Open a listing with available quantity.
3. Tap Offer.
4. Enter a quantity lower than or equal to available quantity.
5. Enter a unit price.
6. Submit the offer.
7. Confirm a success toast appears.
8. Log in as the listing owner/farmer.
9. Open the offers/deals panel.
10. Counter, accept or reject the offer.
11. Complete acceptance from both sides.
12. Confirm a deal is created.
13. Confirm listing reserved quantity increases.

Expected result:
1. Buyers cannot offer more than the available quantity.
2. Only the buyer and listing owner can manage the negotiation.
3. Final stock reservation runs inside a PostgreSQL transaction with a row lock.
4. Concurrent acceptance cannot reserve more than the available stock.

Failure test:
1. Submit an offer with excessive quantity.
2. Confirm the backend rejects it.
3. Attempt to manage another user's offer.
4. Confirm the backend returns HTTP 403.

Available in:
- Flutter
- Backend API

---

Marketplace Current Limitations:

1. The generalized seller product entity is not implemented yet.
2. Machinery-specific specifications such as horsepower, model, warranty and rental calendar are not implemented yet.
3. Cart, checkout, payment, delivery, invoice and reviews are not implemented yet.
4. Bulk buying, auctions, chat, favorites and saved searches are not implemented yet.
5. Voice search and AI recommendations are not implemented yet.
6. Medicine inventory remains a separate specialized module.
7. These items remain incomplete in `done.md`.


---

Local Development Stack:

Where to use:
1. Project root: `D:\custom-coding\project-gov-farmer`.
2. Docker configuration: `docker-compose.yml`.
3. Start script: `scripts/start-all.ps1`.
4. Stop script: `scripts/stop-all.ps1`.
5. Full instructions: `docs/local-development.md`.

How to test infrastructure:
1. Install and start Docker Desktop.
2. Open PowerShell in the project root.
3. Run:

   ```powershell
   docker compose config --quiet
   ```

4. Confirm the command exits without an error.
5. Run:

   ```powershell
   docker compose up -d
   ```

6. Run:

   ```powershell
   docker compose ps
   ```

7. Confirm PostgreSQL, Redis, Qdrant and MinIO are running.
8. Open the MinIO console at `http://localhost:9001`.
9. Open Qdrant at `http://localhost:6333/collections`.
10. Start the backend and open `http://localhost:4000/health/ready`.
11. Confirm PostgreSQL is available.
12. Confirm Redis, Qdrant and storage report their current state.

How to test the unified start script:
1. Open PowerShell in the project root.
2. Run:

   ```powershell
   .\scripts\start-all.ps1
   ```

3. Confirm separate PowerShell windows open for NestJS, Next.js and Flutter.
4. Open `http://localhost:4000/health/live`.
5. Open `http://localhost:3000/dashboard/admin`.
6. Confirm the Flutter app starts on the selected device.

How to stop:
1. Run:

   ```powershell
   .\scripts\stop-all.ps1
   ```

2. Confirm ports 3000 and 4000 no longer have listeners.
3. Run `docker compose ps` and confirm the local containers are stopped.
4. Confirm Docker volumes still exist.

How to permanently delete local infrastructure data:
1. Only when you intentionally want a clean local database and storage, run:

   ```powershell
   .\scripts\stop-all.ps1 -DeleteVolumes
   ```

2. Confirm Docker volumes are deleted.

Expected result:
1. PostgreSQL runs on port 5432 by default.
2. Redis runs on port 6379 by default.
3. Qdrant HTTP runs on port 6333.
4. MinIO API runs on port 9000 and console on 9001.
5. Normal stop preserves data.
6. `-DeleteVolumes` permanently removes local infrastructure data.

Failure test:
1. Stop Docker Desktop.
2. Run `docker compose up -d`.
3. Confirm PowerShell shows a clear Docker connection error.
4. Occupy one of the configured ports and start Compose.
5. Confirm Docker reports the port conflict instead of silently starting an unusable service.

Available in:
- Repository workflow
- Backend local dependencies

---

Unified CI Workflow:

Where to use:
1. `.github/workflows/ci.yml`.
2. GitHub Actions after a push or pull request.

How to test locally before pushing:
1. In `backend/`, run:

   ```powershell
   npm ci
   npm run lint
   npm run build
   npm test -- --runInBand
   ```

2. In `frontend/`, run:

   ```powershell
   npm ci
   npm run lint
   npm run build
   ```

3. In `farmer/`, run:

   ```powershell
   flutter pub get
   dart run build_runner build --delete-conflicting-outputs
   flutter analyze
   flutter test
   ```

4. Push a branch or open a pull request.
5. Open GitHub Actions.
6. Confirm backend, frontend and Flutter jobs all run.

Expected result:
1. Backend lint, build and tests pass.
2. Next.js lint and production build pass.
3. Flutter generated files build, analyze passes and tests pass.
4. A failing command marks only that CI job as failed and blocks a clean merge decision.

Failure test:
1. Introduce a temporary lint error on a test branch.
2. Push the branch.
3. Confirm the relevant CI job fails.
4. Remove the temporary error and push again.
5. Confirm the job passes.

Available in:
- GitHub Actions
- Local validation workflow

---

Production Deployment Baseline:

Where to use:
1. `docs/deployment.md`.

How to test the documentation:
1. Open the deployment guide.
2. Confirm it requires `NODE_ENV=production`.
3. Confirm it requires `DB_SYNCHRONIZE=false` in production.
4. Confirm it requires reviewed TypeORM migrations.
5. Confirm secrets are placed in a deployment secret manager.
6. Confirm PostgreSQL backup and restore drills are required.
7. Confirm Redis, Qdrant and MinIO degradation behavior is documented.
8. Confirm current Next.js local-storage authentication is listed as a release blocker.
9. Confirm Flutter release permissions and OneSignal setup are listed.
10. Confirm the release gate includes backend, frontend and Flutter validation commands.

Expected result:
1. The deployment guide does not mention MongoDB as the active database.
2. PostgreSQL is clearly the canonical system of record.
3. Client applications never receive provider secrets.
4. Production automatic schema synchronization is disabled.
5. Known security blockers are visible instead of being marked complete.

Available in:
- Deployment and release operations



---

OTP and Password Reset:

Where to use:
1. Phone verification request and confirmation endpoints in Swagger at `http://localhost:4000/docs`.
2. Password-reset request and confirmation endpoints in Swagger.
3. Flutter and Next.js authentication screens that call these endpoints.

How to configure SMS delivery:
1. Open `backend/.env`.
2. Configure only the provider URL and API key:

   ```env
   OTP_PROVIDER_URL=https://your-sms-provider.example/send
   OTP_PROVIDER_API_KEY=your-provider-api-key
   OTP_EXPIRES_MINUTES=5
   OTP_RESEND_COOLDOWN_SECONDS=60
   OTP_MAX_ATTEMPTS=5
   OTP_DAILY_LIMIT=10
   OTP_EXPOSE_CODE_IN_DEVELOPMENT=true
   ```

3. The backend sends the API key in the `x-api-key` header.
4. The JSON request body contains `destination`, `code`, and `purpose`.
5. In production, both provider values are required.
6. In development, leave both provider values empty to skip real SMS delivery. When `OTP_EXPOSE_CODE_IN_DEVELOPMENT=true`, the response includes `developmentCode` for local testing.

How to test phone verification:
1. Log in with an unverified account.
2. Request a phone verification code.
3. In development, copy `developmentCode`; with a real provider, read the SMS.
4. Submit the code to the confirmation endpoint.
5. Reload the profile and confirm the phone is marked OTP verified.

How to test password reset:
1. Request a reset code using the account phone number or email.
2. Confirm the response does not reveal whether an unknown account exists.
3. Submit the destination, code, and a valid new password.
4. Sign in using the new password.
5. Confirm previous sessions no longer work.

Expected result:
1. Codes expire after the configured number of minutes.
2. Resending before the cooldown returns HTTP 429.
3. Too many wrong attempts returns HTTP 429.
4. Exceeding the daily limit returns HTTP 429.
5. A successful code can be consumed only once.
6. Production refuses OTP requests when the provider URL or API key is missing.

Failure test:
1. Enter an incorrect or expired code and confirm HTTP 401.
2. Remove one provider value in production and confirm delivery fails safely.
3. Configure a provider that returns a non-success response and confirm the API reports delivery failure.
4. Confirm provider API keys are never returned to Flutter, Next.js, logs, or API responses.

Available in:
- Backend API
- Swagger
- Flutter authentication flow
- Next.js authentication flow


---

Authenticated Feature Uploads:

Where to use:
1. Open Swagger at `http://localhost:4000/docs`.
2. Authenticate with an access token.
3. Use `POST /storage/presign` for direct-to-MinIO uploads.
4. Use `POST /storage/upload` for backend-validated multipart uploads.

Supported feature values:
- `profile`
- `listing`
- `moderation`
- `cms`
- `advertisement`
- `support`
- `report`
- `image-profile`

Presigned upload flow:
1. Send `feature`, `fileName`, `contentType`, and `size` to `/storage/presign`.
2. The backend validates the feature MIME policy and maximum size.
3. Upload the file to the returned URL within 300 seconds.
4. Persist the returned object key only after the related feature record is successfully created or updated.

Validated backend upload flow:
1. Send multipart form data to `/storage/upload` with `feature` and `file`.
2. The backend reads the file signature rather than trusting only the browser MIME declaration.
3. The request is rejected when the declared and detected MIME types differ.
4. The object is stored below a feature- and user-scoped key.

Feature policies:
1. Profile: JPEG, PNG, WebP; maximum 5 MB.
2. Listing: JPEG, PNG, WebP; maximum 12 MB.
3. Moderation/CMS: JPEG, PNG, WebP, PDF; maximum 15 MB.
4. Advertisement: JPEG, PNG, WebP, GIF; maximum 10 MB.
5. Support: JPEG, PNG, WebP, PDF, plain text; maximum 15 MB.
6. Report: PDF, CSV, XLSX; maximum 25 MB.
7. Image profile: JPEG, PNG, WebP; maximum 20 MB.

Failure tests:
1. Upload a renamed executable with an image extension and confirm rejection.
2. Send a PDF under the `profile` feature and confirm rejection.
3. Send a file above the feature limit and confirm rejection.
4. Send mismatched declared and detected MIME types and confirm rejection.
5. Call either endpoint without authentication and confirm HTTP 401.
6. Disable MinIO configuration and confirm storage operations fail with HTTP 503 rather than crashing the API.

Remaining storage work:
- Real MinIO integration tests still require configured test credentials.
- Database transaction/outbox coordination for object deletion is not complete.


---

Queue Worker Business Processing:

Implemented workers:
1. `media:image-profile-process-batch`
   - Loads the image profile from PostgreSQL.
   - Updates requested pending items to ready.
   - Persists thumbnail keys, quality scores, counters, status, and errors.
2. `ai:image-profile-reindex`
   - Loads the image profile.
   - Persists provider/model metadata, Qdrant collection name, indexed item count, index time, and resulting profile status.
3. `notifications:send-alert`
   - Loads the alert record.
   - Persists delivery status, channel, sent time, and worker job ID.
4. `reports:generate-report`
   - Generates and persists a structured report result containing report ID, format, filters, generation time, and summary metadata.

Persistence and retry behavior:
1. Every worker job creates or updates a `worker_job_records` row.
2. Queue name and BullMQ job ID form the idempotency key.
3. Re-delivery of a completed job returns its persisted result instead of applying the domain mutation again.
4. Domain changes run inside a PostgreSQL transaction.
5. Failed attempts persist the error and attempts count.
6. Exhausted retries continue to enter the existing dead-letter queue.
7. Apply migration `CreateWorkerJobRecords1721216500000` before running workers in a non-synchronized environment.

Real Redis integration test:
1. Start Redis, for example through the project Docker Compose stack.
2. In `backend`, set the test Redis URL:

   ```powershell
   $env:TEST_REDIS_URL='redis://localhost:6379'
   ```

3. Run:

   ```powershell
   npm test -- --runInBand src/lib/queue/redis.integration.spec.ts
   ```

4. The test creates a temporary queue, starts a real BullMQ worker, adds a job, waits for completion through `QueueEvents`, verifies the result, drains the queue, and closes all Redis connections.
5. Without `TEST_REDIS_URL`, the real-infrastructure test is skipped during ordinary unit-test runs.

Operational checks:
1. Use the existing worker health endpoint to confirm all four workers are running.
2. Use the Prometheus endpoint to inspect processed, failed, running, and heartbeat metrics.
3. Query `worker_job_records` to inspect payload, result, attempts, completion time, and errors.
4. Inspect `<queue>-dead-letter` when a job exhausts retries.

Failure tests:
1. Submit a missing image profile or alert ID and confirm the job fails and records the error.
2. Repeat a completed job ID and confirm no duplicate domain mutation occurs.
3. Stop Redis and confirm worker health changes and retry behavior is visible.
4. Restore Redis and confirm queued jobs resume.


---

MinIO Integration, Deletion Outbox, Support Mode, and Auth/RBAC E2E:

Real MinIO integration test:
1. Confirm MinIO is running and reachable.
2. Set test-only environment variables in the backend terminal:

   ```powershell
   $env:TEST_MINIO_URL='http://localhost:9000'
   $env:TEST_MINIO_ACCESS_KEY='<minio-access-key>'
   $env:TEST_MINIO_SECRET_KEY='<minio-secret-key>'
   $env:TEST_MINIO_BUCKET='agrivision-test'
   ```

3. Run:

   ```powershell
   npm test -- --runInBand src/lib/storage/minio.integration.spec.ts
   ```

4. The test creates the configured test bucket when needed, uploads a text object, reads it through a signed URL, deletes it, and confirms the object returns HTTP 404 afterward.
5. Keep these credentials local. Do not commit real MinIO credentials to `.env.example`, source code, logs, or documentation.

Database-coordinated object deletion:
1. Apply migration `CreateObjectDeletionOutbox1721216600000`.
2. When deleting a database record that owns MinIO objects, use the same TypeORM transaction and call `ObjectDeletionOutboxService.enqueue(manager, ...)` before committing.
3. The object key, owning entity type/ID, reason, state, attempt count, next attempt time, completion time, and last error are persisted.
4. A background processor checks pending rows every 10 seconds.
5. Successful MinIO deletion marks the row completed.
6. Failures use exponential retry delay and become terminally failed after ten attempts.
7. Operational staff can inspect `object_deletion_outbox` for pending or failed cleanup work without losing the owning database transaction history.

Audited support mode:
1. Support impersonation is disabled by default:

   ```env
   SUPPORT_IMPERSONATION_ENABLED=false
   ```

2. Enable it only after operational approval and access review.
3. An approved admin or super-admin calls `POST /admin/support/impersonate` with:

   ```json
   {
     "targetUserId": "<active-non-admin-user-id>",
     "reason": "Concrete support reason with ticket/reference"
   }
   ```

4. The endpoint rejects disabled support mode, non-admin callers, missing/short reasons, inactive targets, and administrative targets.
5. A successful request returns only a short-lived 15-minute access token. It does not create a refresh token.
6. The token carries `supportMode=true` and `impersonatorId` so downstream behavior can identify the support session.
7. Starting the session writes `support.impersonation.started` to the audit log with actor, target, reason, role, IP address, user agent, and expiry.
8. Support mode never grants admin RBAC merely because the token is an impersonation token; authorization continues to use the target account roles.
9. Disable the environment flag immediately when support access is not actively required.

Supertest authentication and RBAC coverage:
1. Run:

   ```powershell
   npm run test:e2e -- --runInBand test/auth-rbac.e2e-spec.ts
   ```

2. Covered scenarios include:
   - missing token;
   - invalid token;
   - expired token;
   - revoked token;
   - valid bearer token;
   - legacy `access_token` header;
   - unverified admin denial;
   - wrong-role denial;
   - verified admin access;
   - multi-role authorization;
   - support-mode token privilege isolation.

Failure checks:
1. Stop MinIO and confirm the real integration test fails cleanly rather than falsely passing.
2. Force an invalid object key/configuration and confirm the outbox row remains retryable with `lastError` populated.
3. Attempt support mode while disabled and confirm HTTP 403.
4. Attempt to impersonate an admin or suspended user and confirm HTTP 403.
5. Confirm the audit log records the real admin actor rather than only the target user.


---

Provider Key Health and Validation:

Where to use:
1. Sign in to the Next.js admin panel.
2. Open `AI & providers`.
3. Manage Gemini keys individually and test Gemini, Windy, or OneSignal from the server.

Gemini key controls:
1. Add one or more Gemini API keys.
2. Set `Enabled` or `Disabled` independently for each key.
3. Set a numeric priority. Lower numbers have higher selection priority.
4. Save before testing a newly added key so it receives a persistent key ID.
5. Stored keys remain encrypted and are returned to the browser only in masked form.

Health information shown per key:
- current health: unknown, healthy, degraded, quota, or failed;
- last successful validation time;
- last quota/rate-limit error time;
- cooldown-until time;
- usage/test count;
- last test time;
- last validation error.

Safe provider tests:
1. Gemini test calls the provider model-list endpoint from NestJS using the stored key.
2. Windy test sends a minimal point-forecast request for fixed coordinates from NestJS.
3. OneSignal test requests the configured app metadata from NestJS.
4. Keys are never sent back to the browser unmasked and are not placed in query strings or logs.
5. Every test has an eight-second server-side timeout.
6. HTTP 429 is classified as quota/rate-limit health and creates a 15-minute cooldown timestamp.
7. Other 4xx responses become failed health; 5xx responses become degraded health.
8. Successful validation records healthy status and `lastSuccessAt`.

API endpoint:

```text
POST /admin/integrations/test
```

Example Gemini request:

```json
{
  "provider": "gemini",
  "keyId": "<saved-key-id>"
}
```

Example Windy request:

```json
{
  "provider": "windy"
}
```

Example OneSignal request:

```json
{
  "provider": "onesignal"
}
```

Failure checks:
1. Disable a Gemini key and confirm the test endpoint rejects it.
2. Use an invalid key and confirm failed health and a safe HTTP-status error are persisted.
3. Simulate or receive HTTP 429 and confirm quota health, quota timestamp, and cooldown are stored.
4. Confirm refreshing the admin page preserves key priority, enabled state, counters, and health.
5. Confirm browser network responses contain only masked keys.

Current boundary:
- These controls manage and validate provider credentials.
- Full weighted routing, automatic runtime usage accounting for every AI request, circuit breaking, and provider failover remain part of the separate AI adapter implementation checklist.


---

Generalized Marketplace:

Public browsing:
1. Open the Next.js website at `/marketplace`.
2. Visitors can search and browse products without authentication.
3. Use text, category, sale/rental/auction filters, or supported-browser Bangla voice search.
4. Protected actions such as favorite, cart, checkout, bid, rent, or message redirect to `/login` and preserve the original marketplace return path.

Seller product creation in Flutter:
1. Open Marketplace and tap `Sell`.
2. Open the `Products` tab.
3. Enter the approved category code, title, description, use cases, symptoms/conditions, safety notes, price, stock, and offer type.
4. For machinery, add brand, model, year, horsepower, and additional JSONB specifications.
5. Mark restricted products and license requirements accurately.
6. Submit the product. It remains pending until admin moderation.

Buyer flows:
1. Sale products can be favorited or added to the persistent cart.
2. Checkout locks and decrements stock inside a PostgreSQL transaction and creates an order without any internal wallet.
3. Rental products open a date-range picker and reject conflicts with existing pending or confirmed bookings.
4. Auction products accept bids only while active and only above the current amount.
5. Buyer-seller messages are persisted; opening a conversation marks received messages read and unread counts are available.
6. Delivered orders can be reviewed once per buyer/product/order.

Admin marketplace operations:
1. Open the Next.js admin dashboard and choose `Marketplace operations`.
2. Review pending, restricted, rejected, suspended, and appealed products.
3. Enter a required moderation reason for approval, rejection, or suspension.
4. Restricted licensed products cannot be published unless the license is marked verified.
5. Review orders and update confirmed, processing, shipped, delivered, cancelled, and tracking-number states.
6. Payment status is controlled by signed gateway events and refund processing, not by the order-status form.

Search and recommendations:
1. PostgreSQL full-text search combines title, description, use cases, and symptoms.
2. Price, category, transaction type, and Haversine distance filters are supported.
3. Popular search responses are cached in Redis for 60 seconds and invalidated when products are created or moderated.
4. The current low-AI recommendation path returns only active marketplace products and never invents catalog items.
5. Provider/vector fallback remains disabled until a configured adapter and evaluation dataset are available.

Payments and refunds:
1. Configure Stripe test or production credentials only in backend environment variables:

   ```env
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   ```

2. `POST /billing/orders/:orderId/payment` creates an idempotent PaymentIntent against the persisted order.
3. Send Stripe events to `POST /billing/stripe/webhook`; the endpoint verifies the raw-body signature.
4. Successful payment confirms the order and stores payment time/reference.
5. Admin refunds use `POST /billing/orders/:orderId/refunds` with amount and reason.
6. Refunds are idempotent and reconcile payment/order status.
7. Real gateway testing requires valid Stripe test credentials and CLI/webhook forwarding.

Invoices:
1. Authorized buyers, involved sellers, and admins can open `GET /billing/orders/:orderId/invoice`.
2. The backend streams a PDF generated from the persisted order record.
3. Unauthorized users receive HTTP 403.

Auctions:
1. Sellers create an auction with start/end times, starting price, and optional reserve.
2. Bids use a pessimistic database lock to prevent concurrent lower winning bids.
3. A scheduled lifecycle job checks expired auctions every 30 seconds.
4. If the reserve is met, the winning bidder receives an unpaid order and stock is reduced.

Infrastructure and migrations:
1. Apply `CreateMarketplaceDomain1721216700000` when `DB_SYNCHRONIZE=false`.
2. Configure `REDIS_URL` to enable marketplace search caching.
3. The migration creates marketplace products, favorites, saved searches, cart, orders, rentals, bulk requests, auctions, bids, messages, reviews, payments, refunds, full-text GIN index, distance fields, and machinery indexes.

Validation commands:

```powershell
cd backend
npm run lint
npm run build
npm test -- --runInBand
$env:TEST_REDIS_URL='redis://localhost:6379'
npm test -- --runInBand src/marketplace/marketplace-cache.integration.spec.ts

cd ..\frontend
npm run lint
npm run build

cd ..\farmer
flutter analyze
flutter test
```

Current provider-dependent boundaries:
1. Stripe payment/refund code is complete but a live gateway transaction cannot be validated without project-owned Stripe test credentials.
2. Image background removal is represented by a provider-neutral request contract; no image-edit provider has been configured yet.
3. Listing-description generation and recommendation currently use deterministic low-AI behavior. A generative provider adapter must not be marked complete until provider credentials, persisted worker output, moderation UI, and evaluation tests exist.
4. Seasonal best-selling-time guidance needs a completed historical market-trend model and labeled validation data.


---

Marketplace Invoices, Reviews, AI Seller Tools, and Seasonal Guidance:

PDF invoices:
1. Invoices are generated in NestJS with the third-party `pdfkit` package from the persisted order record.
2. Next.js buyers open `My orders` and choose `Open invoice PDF`.
3. Next.js admins open `Marketplace operations` and choose `Invoice PDF` on an order.
4. Flutter buyers expand `My marketplace orders` and choose `Open PDF invoice`.
5. Flutter requests an authenticated five-minute signed URL from `GET /billing/orders/:orderId/invoice-link`; the URL does not expose an access token.
6. `INVOICE_SIGNING_SECRET` should be a separate production secret. `PUBLIC_API_URL` must be reachable from the mobile device.

Reviews and ratings:
1. Only the buyer of a delivered order can create a product review.
2. `GET /marketplace/products/:id/reviews` returns published reviews plus average rating, count, and one-to-five-star distribution.
3. Public Next.js product cards open a review summary dialog.
4. Admins use `Marketplace operations` to hide or republish abusive/irrelevant reviews without deleting history.

Provider-backed description generation:
1. Configure:

   ```env
   MARKETPLACE_TEXT_PROVIDER_URL=
   MARKETPLACE_TEXT_PROVIDER_API_KEY=
   MARKETPLACE_TEXT_PROVIDER_MODEL=
   ```

2. Flutter sellers open `Sell > Products > Seller AI and pricing tools`.
3. Choose a product and tap `Generate description`.
4. The request creates a `marketplace_ai_tasks` row and queues `ai:marketplace-description-generate`.
5. The worker calls the configured server-side provider, records provider/model/output/failure details, and never publishes automatically.
6. The seller must preview and choose `Apply` or `Reject`.

Background removal:
1. Configure:

   ```env
   IMAGE_EDIT_PROVIDER_URL=
   IMAGE_EDIT_PROVIDER_API_KEY=
   ```

2. Tap `Remove background` for a seller product that has an image.
3. The request creates a persisted task and queues `media:marketplace-background-remove`.
4. The provider must accept `imageUrl`, `operation=remove-background`, and `outputFormat=webp`, and return `outputUrl`, `url`, or `resultUrl`.
5. Flutter previews the returned image. The seller explicitly applies or rejects it.
6. Apply places the edited image first in the product image list and invalidates marketplace search cache.

Seasonal price and timing guidance:
1. Tap `Price guidance` in Flutter seller tools.
2. Suggested price uses the median active peer price and returns minimum/maximum peer range.
3. Seasonal guidance uses delivered-order quantity and revenue grouped by calendar month.
4. The response reports best months, current-month demand, and `high`, `medium`, `low`, or `insufficient-data` demand band.
5. Guidance identifies its source as delivered order history plus active peer prices; it is advisory, not a guaranteed future price.

Migration:
- Apply `CreateMarketplaceAiTasks1721216800000` when database synchronization is disabled.

Failure checks:
1. Leave a provider URL/key empty and confirm the queued task becomes failed with a visible safe error.
2. Return a provider response without description/output URL and confirm retry/DLQ behavior and task failure history.
3. Confirm generated text/images are never applied before seller approval.
4. Confirm an unauthorized user cannot request or apply another seller's task.
5. Confirm expired/tampered invoice links are rejected.
6. Hide a review and confirm it disappears from public aggregates while remaining visible to admins.


---

Simple Invoice Verification:

1. The backend continues generating invoices with `pdfkit`.
2. Every invoice contains:
   - a QR code;
   - a Code 128 barcode;
   - a printed verification code.
3. The QR code opens the public verification endpoint:

   ```text
   GET /billing/invoices/:orderId/verify?code=...
   ```

4. The verification response shows whether the invoice is valid and returns the live order number, order status, payment status, amount, currency, creation time, and verification time.
5. Anyone can scan and validate an invoice, but downloading the full invoice still requires an authorized order user or a short-lived signed mobile link.
6. Socket.IO is not used for invoice verification.
7. `pdfme` was reviewed as a future visual-template designer, but the current backend keeps the already-working `pdfkit` implementation to avoid unnecessary migration risk.

Why `INVOICE_SIGNING_SECRET` exists:
1. It prevents users from inventing valid QR codes or verification codes for fake invoices.
2. The server signs the order ID, order number, amount, currency, and creation time with HMAC-SHA256.
3. Anyone can scan the result, but only the server can create a matching valid signature.
4. When `INVOICE_SIGNING_SECRET` is empty, the backend falls back to `ACCESS_TOKEN`; production should use a separate random secret so invoice signatures can be rotated independently from login tokens.


---

Bulk Purchase Matching:

1. Buyers open Marketplace > Bulk purchase requests and publish title, category, description, quantity and unit.
2. Sellers open the same request list and submit unit price, available quantity, delivery days and an optional note.
3. Request details show offers sorted by lowest unit price and fastest delivery.
4. Only the request owner can select an offer.
5. Selection runs inside a PostgreSQL transaction with row locks.
6. The selected offer becomes `selected`, the request becomes `matched`, and remaining submitted offers become `rejected`.
7. Admins monitor all requests and selected offers from Next.js Marketplace operations.
8. Apply migration `CreateMarketplaceBulkOffers1721216900000` when synchronization is disabled.

Messaging scope:
- Realtime buyer-seller messaging is intentionally not part of the approved product scope.
- No Socket.IO dependency or realtime messaging UI is introduced.
- Existing legacy conversation endpoints remain isolated and unused.


---

Ephemeral Marketplace Chat:

1. Buyers open a generalized product and tap the chat icon.
2. Flutter connects to the `/marketplace-chat` Socket.IO namespace with the existing access token.
3. The backend verifies the access token before joining the user's private socket room.
4. Messages are delivered live only to the sender and receiver.
5. No message is written to PostgreSQL, Redis, MinIO, logs, queues, or any history table.
6. Closing the sheet, disconnecting, refreshing, or restarting the backend removes the conversation from memory.
7. There is no message-history API and no replay after reconnect.
8. The old persisted marketplace message REST routes are disabled so the active app cannot accidentally save chat messages.
9. Messages are limited to 1,000 characters and 20 messages per socket per minute.
10. Chat events explicitly include `ephemeral=true` and `persisted=false`.

Socket events:
- `chat:ready` confirms authenticated ephemeral mode.
- `chat:send` sends a live message.
- `chat:message` delivers the message to both participants.
- `chat:typing` supports temporary typing indicators without storage.
- `chat:error` reports authentication, validation, or rate-limit failures.

Important behavior:
- Both users must be online at the same time.
- Offline messages are not queued.
- Messages cannot be recovered after the chat closes.


---

Temporary Redis Marketplace Chat:

1. Marketplace chat uses Socket.IO only for live delivery.
2. Messages are stored in Redis lists, never PostgreSQL.
3. Every conversation key expires after 3,600 seconds (one hour).
4. Reopening the same product conversation within one hour loads the remaining Redis history.
5. Redis keeps at most the latest 100 messages per conversation.
6. Each sender has a Redis-backed 60-second cooldown. A second message before expiry is rejected with the remaining wait time.
7. The Flutter chat sheet disables typing/sending during cooldown and shows a second-by-second countdown.
8. Messages include `temporary=true`, `storage=redis`, `sentAt`, and `expiresAt`.
9. When Redis is unavailable, chat storage and sending fail safely instead of silently falling back to database persistence.
10. The persisted marketplace message REST endpoints remain disabled.

Redis keys:
- `marketplace:chat:conversation:<userA>:<userB>:<productId>` stores temporary messages for one hour.
- `marketplace:chat:cooldown:<senderId>` enforces one message every 60 seconds.

Important behavior:
- Messages can be viewed again only while their Redis TTL remains.
- After one hour, Redis deletes the conversation automatically.
- Restarting PostgreSQL has no effect on chat because chat is never written there.


## Marketplace completion update ? 2026-07-17

- Active checkout is gateway-neutral and creates unpaid orders without calling Stripe. This leaves a clean integration point for bKash or another provider later.
- The recommendation endpoint uses deterministic, explainable catalog-only ranking and returns evaluation metadata; it does not generate products.
- Next.js now provides a saved marketplace drawer for favorites and saved searches, including apply, remove, and delete actions.
- Backend saved-search deletion is exposed through `DELETE /marketplace/saved-searches/:id`.
- Remaining follow-up: match the saved marketplace experience in Flutter and add dedicated UI/e2e tests.
