param([switch]$DeleteVolumes)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

$ports = 3000, 4000
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {}
    }
}

if ($DeleteVolumes) {
  docker compose -f "$root\docker-compose.yml" down -v
  Write-Host 'AgriVision local services stopped and Docker volumes deleted.'
} else {
  docker compose -f "$root\docker-compose.yml" down
  Write-Host 'AgriVision local services stopped. Docker volumes were preserved.'
}
