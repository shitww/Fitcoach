# FitCoach PWA Mobile Dev Server
# Launch local server accessible from phones on same Wi-Fi.
# Generates a QR code image for easy scanning.
# Usage: .\scripts\dev-mobile.ps1

$ErrorActionPreference = 'Stop'

# ── Config ────────────────────────────────────────────────────────────────
$preferredPort = 3000
$maxPortSearch = 3010

# ── Build first ───────────────────────────────────────────────────────────
Write-Host 'Building FitCoach for mobile testing...' -ForegroundColor Cyan
pnpm build

function Stop-PortListeners([int]$p) {
    $pids = @()
    try {
        $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
    } catch { }

    # NOTE: PowerShell variables are case-insensitive; avoid $pid which conflicts with built-in $PID (read-only).
    foreach ($procId in $pids) {
        if (-not $procId) { continue }
        Write-Host "Port $p is already in use. Stopping PID $procId..." -ForegroundColor DarkYellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }

    # Wait up to ~5s for port release
    for ($i = 0; $i -lt 25; $i++) {
        $still = $null
        try { $still = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 } catch { }
        if (-not $still) { return $true }
        Start-Sleep -Milliseconds 200
    }
    return $false
}

function Find-FreePort([int]$start, [int]$end) {
    for ($p = $start; $p -le $end; $p++) {
        $inUse = $null
        try { $inUse = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 } catch { }
        if (-not $inUse) { return $p }
    }
    return $null
}

# ── Ensure we have a usable port (avoid EADDRINUSE) ───────────────────────
$port = $preferredPort
$released = Stop-PortListeners $port
if (-not $released) {
    Write-Host "Port $port is still in use. Searching for a free port..." -ForegroundColor DarkYellow
    $free = Find-FreePort ($preferredPort + 1) $maxPortSearch
    if (-not $free) {
        throw "No free port found in range $preferredPort-$maxPortSearch. Please close the process using the port and retry."
    }
    $port = $free
    Write-Host "Using port $port instead." -ForegroundColor DarkYellow
}

# ── Find local IP ─────────────────────────────────────────────────────────
function Get-PrimaryIPv4() {
    # Prefer the interface used for the default route (works for Wi‑Fi, hotspot, Ethernet).
    $route = $null
    try {
        $route = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue |
            Sort-Object -Property RouteMetric |
            Select-Object -First 1
    } catch { }

    if ($route -and $route.ifIndex) {
        try {
            $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $route.ifIndex -ErrorAction SilentlyContinue |
                Where-Object { $_.IPAddress -notmatch '^169\.254\.' } |
                Select-Object -First 1 -ExpandProperty IPAddress
            if ($ip) { return $ip }
        } catch { }
    }

    # Fallback: pick the first private IPv4 found.
    try {
        $fallback = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object {
                $_.IPAddress -match '^192\.168\.' -or $_.IPAddress -match '^10\.' -or $_.IPAddress -match '^172\.' 
            } |
            Select-Object -First 1 -ExpandProperty IPAddress
        if ($fallback) { return $fallback }
    } catch { }

    return '127.0.0.1'
}

$localIP = Get-PrimaryIPv4

$url = "http://${localIP}:${port}"

# ── Generate QR code ─────────────────────────────────────────────────────
$projectRoot = Split-Path -Parent $PSScriptRoot
$qrPath = Join-Path -Path $projectRoot -ChildPath 'qr-mobile.png'
$qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$([System.Uri]::EscapeDataString($url))"
try {
    Invoke-WebRequest -Uri $qrApiUrl -OutFile $qrPath -ErrorAction Stop | Out-Null
    $qrGenerated = $true
} catch {
    Write-Host '  [WARN] QR code generation failed (offline or API unreachable)' -ForegroundColor DarkYellow
    $qrGenerated = $false
}

Write-Host '' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host '  FitCoach PWA Mobile Dev Server' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host '' -ForegroundColor Green
Write-Host "  URL: $url" -ForegroundColor Yellow
Write-Host '' -ForegroundColor Green
if ($qrGenerated) {
    Write-Host "  QR code saved to: $qrPath" -ForegroundColor Cyan
    Write-Host '  Scan the QR code to open on your phone.' -ForegroundColor Cyan
} else {
    Write-Host '  Open the URL above on your phone (same Wi-Fi).' -ForegroundColor Cyan
}
Write-Host '  Then install (Add to Home Screen / Install App).' -ForegroundColor Cyan
Write-Host '' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Green
Write-Host ''

# Start server
Write-Host "Starting server on 0.0.0.0:$port..." -ForegroundColor Cyan
pnpm start -- --hostname 0.0.0.0 -p $port
