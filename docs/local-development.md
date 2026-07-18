# Local Development

## Prerequisites

- Node.js 22
- npm
- Flutter stable
- PostgreSQL 16 or Docker Desktop
- Docker Compose for Redis, Qdrant and MinIO

## Start infrastructure

From the project root:

```powershell
docker compose up -d
```

Default local services:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Qdrant HTTP: `localhost:6333`
- Qdrant gRPC: `localhost:6334`
- MinIO API: `localhost:9000`
- MinIO console: `localhost:9001`

Docker volumes are persistent. `docker compose down` stops containers without deleting data. Use `docker compose down -v` only when intentionally deleting local infrastructure data.

## Configure applications

1. Copy or complete `backend/.env` using `backend/.env.example`.
2. Point PostgreSQL, Redis, Qdrant and MinIO variables to the local ports above.
3. Configure the Next.js backend base URL.
4. Configure Flutter `API_URL` for the target device. Android emulator localhost must use `10.0.2.2`.

Provider secrets such as Gemini, Windy and OneSignal are entered through the protected Next.js admin dashboard and encrypted by NestJS. `CONFIG_ENCRYPTION_KEY` remains backend-only.

## Start all applications

```powershell
.\scripts\start-all.ps1
```

Options:

```powershell
.\scripts\start-all.ps1 -SkipInfrastructure
.\scripts\start-all.ps1 -SkipFlutter
```

The script opens separate PowerShell terminals for NestJS, Next.js and Flutter.

## Stop applications

```powershell
.\scripts\stop-all.ps1
```

This stops local listeners on ports 3000 and 4000 and stops Compose containers while preserving volumes.

To intentionally delete local PostgreSQL, Redis, Qdrant and MinIO volumes:

```powershell
.\scripts\stop-all.ps1 -DeleteVolumes
```

This permanently removes local infrastructure data and should not be used during normal development.

## Manual commands

Backend:

```powershell
cd backend
npm ci
npm run start:dev
```

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Flutter:

```powershell
cd farmer
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

## Validation before continuing a feature section

```powershell
cd backend
npm run lint
npm run build
npm test -- --runInBand

cd ..\frontend
npm run lint
npm run build

cd ..\farmer
flutter analyze
flutter test
```

Do not mark a feature complete in `done.md` until its implementation, client flow, failure behavior and practical test steps in `features.md` are all present.
