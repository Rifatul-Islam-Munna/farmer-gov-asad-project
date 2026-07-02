# Farmer Government Flutter App

The mobile application is located in this `farmer/` directory. Do not create a second Flutter project for the same app.

## Environment

Copy the example file and set the backend URL:

```bash
cp .env.example .env
```

For the Android emulator, the local backend normally uses:

```env
API_URL=http://10.0.2.2:4000
```

Set `ONESIGNAL_APP_ID` only when a OneSignal application is ready.

## Install and Generate Code

The project uses Freezed, JsonSerializable, and AutoRoute code generation.

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```

Use watch mode while developing models or routes:

```bash
dart run build_runner watch --delete-conflicting-outputs
```

## Quality Checks

Run the backend checks first:

```bash
cd ../backend
npm install
npm run build
npx eslint "{src,apps,libs,test}/**/*.ts"
```

Then run the Farmer app checks:

```bash
cd ../farmer
dart run build_runner build --delete-conflicting-outputs
flutter analyze
flutter test
```

## Run

```bash
flutter run
```

## Current Foundation

- Green agricultural splash screen.
- Typed login and role-aware registration.
- Secure token storage.
- `.env`-configured Dio client.
- Global HTTP 401 session handling.
- CachedQuery initialization.
- Optional OneSignal initialization.
- Nested AutoRoute tab stacks for Home, Marketplace, Post, and Profile.
- Server-backed sign out.

See `PLAN.md` for the complete product plan and `TASKS.md` for the implementation checklist.
