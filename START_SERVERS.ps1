#!/usr/bin/env pwsh
<#
.SYNOPSIS
LeadsFlow CRM - Professional Startup Script
.DESCRIPTION
Starts both Backend (port 5001) and Frontend (port 3000) servers with proper error handling
.EXAMPLE
.\START_SERVERS.ps1
#>

# Colors and formatting
$colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-Status {
    param([string]$Message, [string]$Type = 'Info')
    $color = $colors[$Type]
    Write-Host $Message -ForegroundColor $color
}

function Test-Port {
    param([int]$Port)
    $connection = New-Object System.Net.Sockets.TcpClient
    try {
        $connection.Connect('127.0.0.1', $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Header
Clear-Host
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     LeadsFlow CRM - Professional Startup Script" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Node.js
Write-Status "[1/6] Checking Node.js installation..." -Type Info
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Status "ERROR: Node.js is not installed!" -Type Error
    Write-Status "Install from: https://nodejs.org" -Type Error
    exit 1
}
$nodeVersion = & node --version
Write-Status "✓ Node.js $nodeVersion found" -Type Success

# Step 2: Verify directories
Write-Status "[2/6] Verifying project structure..." -Type Info
$projectRoot = Get-Location
$serverDir = Join-Path $projectRoot "server"
$frontendPackage = Join-Path $projectRoot "package.json"

if (-not (Test-Path $serverDir)) {
    Write-Status "ERROR: Server directory not found!" -Type Error
    exit 1
}
if (-not (Test-Path $frontendPackage)) {
    Write-Status "ERROR: Frontend package.json not found!" -Type Error
    exit 1
}
Write-Status "✓ Project structure verified" -Type Success

# Step 3: Kill existing processes
Write-Status "[3/6] Cleaning up existing processes..." -Type Info
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Status "✓ Existing processes cleaned" -Type Success

# Step 4: Install dependencies
Write-Status "[4/6] Installing dependencies..." -Type Info

Write-Host "  Installing backend dependencies..." -NoNewline
Push-Location $serverDir
& npm install --silent 2>&1 | Out-Null
Pop-Location
Write-Status " Done!" -Type Success

Write-Host "  Installing frontend dependencies..." -NoNewline
& npm install --silent 2>&1 | Out-Null
Write-Status " Done!" -Type Success

# Step 5: Start Backend
Write-Status "[5/6] Starting Backend Server (Port 5001)..." -Type Info
Push-Location $serverDir
Start-Process -FilePath "pwsh" -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Pop-Location
Start-Sleep -Seconds 3
Write-Status "✓ Backend startup initiated" -Type Success

# Step 6: Start Frontend
Write-Status "[6/6] Starting Frontend Server (Port 3000)..." -Type Info
Start-Process -FilePath "pwsh" -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Status "✓ Frontend startup initiated" -Type Success

# Wait for servers to start
Write-Host ""
Write-Status "Waiting for servers to fully start (30 seconds)..." -Type Info
$counter = 0
$maxWait = 30

while ($counter -lt $maxWait) {
    $backendReady = Test-Port 5001
    $frontendReady = Test-Port 3000
    
    if ($backendReady -and $frontendReady) {
        break
    }
    
    Start-Sleep -Seconds 1
    $counter++
}

# Final Status Report
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$backendReady = Test-Port 5001
$frontendReady = Test-Port 3000

if ($backendReady) {
    Write-Status "✓ Backend is READY at http://localhost:5001" -Type Success
} else {
    Write-Status "⚠ Backend is starting (may take a moment)" -Type Warning
}

if ($frontendReady) {
    Write-Status "✓ Frontend is READY at http://localhost:3000" -Type Success
} else {
    Write-Status "⚠ Frontend is starting (may take a moment)" -Type Warning
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Status "SERVERS STARTED SUCCESSFULLY!" -Type Success
Write-Host ""
Write-Status "Frontend:  http://localhost:3000" -Type Info
Write-Status "Backend:   http://localhost:5001" -Type Info
Write-Status "API Docs:  http://localhost:5001/health" -Type Info
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
