param(
  [switch]$SkipInfrastructure,
  [switch]$SkipFlutter
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

function Test-PortInUse {
  param([Parameter(Mandatory = $true)][int]$Port)

  return $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
}

if (-not $SkipInfrastructure) {
  docker compose -f "$root\docker-compose.yml" up -d
}

if (Test-PortInUse -Port 4000) {
  Write-Warning 'Backend was not started because port 4000 is already in use. Stop the existing backend first or continue using it.'
} else {
  $backend = Start-Process powershell -PassThru -ArgumentList '-NoExit', '-Command', "Set-Location '$root\backend'; npm run start:dev"
  Write-Host "Backend terminal PID: $($backend.Id)"
}

if (Test-PortInUse -Port 3000) {
  Write-Warning 'Frontend was not started because port 3000 is already in use. Stop the existing frontend first or continue using it.'
} else {
  $frontend = Start-Process powershell -PassThru -ArgumentList '-NoExit', '-Command', "Set-Location '$root\frontend'; npm run dev"
  Write-Host "Frontend terminal PID: $($frontend.Id)"
}

if (-not $SkipFlutter) {
  $flutter = Start-Process powershell -PassThru -ArgumentList '-NoExit', '-Command', "Set-Location '$root\farmer'; flutter run"
  Write-Host "Flutter terminal PID: $($flutter.Id)"
}

Write-Host 'AgriVision service startup checks completed.'
