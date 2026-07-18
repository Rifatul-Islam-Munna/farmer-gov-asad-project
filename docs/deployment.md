# Production Deployment Baseline

## Required services

- NestJS backend
- Next.js dashboard
- PostgreSQL
- Redis
- Qdrant
- S3-compatible object storage/MinIO
- OneSignal
- Windy
- Gemini or another configured AI provider

PostgreSQL is required. Redis, Qdrant and object storage may start in degraded mode, but their dependent features must report unavailability clearly.

## Backend deployment

1. Set `NODE_ENV=production`.
2. Set `DB_SYNCHRONIZE=false`.
3. Use a reviewed TypeORM migration process.
4. Store `ACCESS_TOKEN`, `REFRESH_TOKEN_SECRET` and `CONFIG_ENCRYPTION_KEY` in a deployment secret manager.
5. Configure a strict `CORS_ORIGINS` allowlist.
6. Terminate HTTPS at the load balancer or reverse proxy.
7. Run more than one backend replica only after Redis-backed coordination is available for queues, locks and shared rate limits.
8. Expose `/health/live` for liveness and `/health/ready` for readiness.
9. Do not expose Swagger publicly unless protected.

## Next.js deployment

1. Set the server/public backend URL according to the environment.
2. Build with `npm ci && npm run build`.
3. Do not put Gemini, Windy, OneSignal REST secrets or `CONFIG_ENCRYPTION_KEY` in public environment variables.
4. Current local-storage admin authentication must be replaced with HTTP-only secure cookies and CSRF protection before public production release.

## Flutter release

1. Build with the production HTTPS API URL.
2. Configure Android and iOS signing.
3. Configure OneSignal application identifiers and native notification permissions.
4. Review microphone, camera, location, background execution, alarm and notification declarations.
5. Test low-memory devices and locked-screen alert behavior.
6. Ensure no provider secret is bundled in the application.

## PostgreSQL

- Use managed PostgreSQL where possible.
- Enable automated encrypted backups.
- Perform restore drills.
- Monitor connection count, long transactions, locks and slow queries.
- Review migrations before deployment.
- Keep `DB_SYNCHRONIZE=false` in production.

## Redis and BullMQ

- Use authenticated TLS Redis in production.
- Configure memory limits and eviction policy deliberately.
- Monitor worker heartbeats, failed jobs and queue age after real workers are implemented.
- Queue failure must not terminate unrelated HTTP APIs.

## Qdrant

- Use authenticated TLS endpoints.
- Snapshot collections regularly.
- Version collections or payloads by embedding model.
- Keep PostgreSQL as the canonical source of business records.
- Test Qdrant outage and AI fallback behavior.

## Object storage

- Keep buckets private by default.
- Use short-lived signed URLs.
- Configure lifecycle and retention rules.
- Scan uploaded documents and enforce feature-specific MIME/size limits before public launch.
- Coordinate database, object and Qdrant deletion through an outbox/worker process.

## Release gate

Before release, all commands must pass:

```text
backend: npm run lint, npm run build, npm test
frontend: npm run lint, npm run build
flutter: flutter analyze, flutter test
```

Also verify:

- login, refresh and logout;
- account suspension;
- admin role controls;
- listing create/search/filter/offer;
- health/readiness;
- provider degradation;
- database backup restore;
- no secrets in Git or client bundles.
