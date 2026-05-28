# ─── FitCoach PWA Public Tunnel (ngrok) ────────────────────────────────────
# Creates a public HTTPS URL for sharing the PWA with remote team members.
# Requires: npx ngrok (auto-installed if missing)
# Usage: .\scripts\dev-ngrok.ps1

$ErrorActionPreference = "Stop"

# ── Build ─────────────────────────────────────────────────────────────────
Write-Host "Building FitCoach..." -ForegroundColor Cyan
pnpm build

# ── Start server in background ────────────────────────────────────────────
Write-Host "Starting local server on port 3000..." -ForegroundColor Cyan
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    pnpm start -- --hostname 0.0.0.0
}

# Wait for server to be ready
Start-Sleep -Seconds 3

# ── Start ngrok ───────────────────────────────────────────────────────────
Write-Host "Starting ngrok tunnel..." -ForegroundColor Cyan
$npxPath = (Get-Command npx -ErrorAction SilentlyContinue)?.Source
if (-not $npxPath) {
    Write-Host "npx not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

$ngrokJob = Start-Job -ScriptBlock {
    param($npxPath)
    & $npxPath ngrok http 3000 --log stdout
} -ArgumentList $npxPath

# Wait for ngrok to initialize
Start-Sleep -Seconds 5

# Fetch the public URL from ngrok API
$ngrokUrl = $null
for ($i = 0; $i -lt 10; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
        $ngrokUrl = $resp.tunnels | Where-Object { $_.public_url -match "https:" } | Select-Object -First 1 -ExpandProperty public_url
        if ($ngrokUrl) { break }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $ngrokUrl) {
    Write-Host "Failed to get ngrok URL. Check http://127.0.0.1:4040" -ForegroundColor Red
    exit 1
}

# ── Generate QR code for easy sharing ─────────────────────────────────────
$projectRoot = Split-Path -Parent $PSScriptRoot
$qrPath = Join-Path -Path $projectRoot -ChildPath "qr-ngrok.png"
$qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$([System.Uri]::EscapeDataString($ngrokUrl))"
try {
    Invoke-WebRequest -Uri $qrApiUrl -OutFile $qrPath -ErrorAction Stop | Out-Null
    $qrGenerated = $true
} catch {
    $qrGenerated = $false
}

Write-Host "" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  FitCoach PWA Public URL (ngrok)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "  Public URL: $ngrokUrl" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Green
if ($qrGenerated) {
    Write-Host "  QR code saved to: $qrPath" -ForegroundColor Cyan
    Write-Host "  Scan the QR code to open on your phone." -ForegroundColor Cyan
}
Write-Host "  Share this link with your team." -ForegroundColor Cyan
Write-Host "  Then install (Add to Home Screen / Install App)." -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

# ── Keep running until interrupted ──────────────────────────────────────
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Shutting down..." -ForegroundColor Cyan
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -ErrorAction SilentlyContinue
    Stop-Job $ngrokJob -ErrorAction SilentlyContinue
    Remove-Job $ngrokJob -ErrorAction SilentlyContinue
}
