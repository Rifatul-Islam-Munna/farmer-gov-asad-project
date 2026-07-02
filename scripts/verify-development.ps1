$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Backend: install"
Set-Location "$Root/backend"
npm install --no-audit --no-fund

Write-Host "==> Backend: build"
npm run build

Write-Host "==> Backend: lint"
npx eslint "{src,apps,libs,test}/**/*.ts"

Write-Host "==> Farmer: packages"
Set-Location "$Root/farmer"
flutter pub get

Write-Host "==> Farmer: generate Freezed, JSON and AutoRoute"
dart run build_runner build --delete-conflicting-outputs

Write-Host "==> Farmer: analyze"
flutter analyze

Write-Host "==> Farmer: tests"
flutter test

Write-Host "==> Development verification passed"
