#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Backend: install"
cd "$ROOT_DIR/backend"
npm install --no-audit --no-fund

echo "==> Backend: build"
npm run build

echo "==> Backend: lint"
npx eslint "{src,apps,libs,test}/**/*.ts"

echo "==> Farmer: packages"
cd "$ROOT_DIR/farmer"
flutter pub get

echo "==> Farmer: generate Freezed, JSON and AutoRoute"
dart run build_runner build --delete-conflicting-outputs

echo "==> Farmer: analyze"
flutter analyze

echo "==> Farmer: tests"
flutter test

echo "==> Development verification passed"
