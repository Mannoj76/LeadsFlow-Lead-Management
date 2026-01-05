#!/usr/bin/env pwsh
<#
.SYNOPSIS
LeadsFlow CRM - Diagnostic Script
.DESCRIPTION
Runs comprehensive diagnostics to identify issues
#>

Clear-Host
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "     LeadsFlow CRM - Diagnostic Report" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node and npm
Write-Host "[SYSTEM CHECK]" -ForegroundColor Yellow
Write-Host ""
$node = & node --version
$npm = & npm --version
Write-Host "Node.js: $node"
Write-Host "npm:     $npm"
Write-Host ""

# 2. Check directories
Write-Host "[PROJECT STRUCTURE]" -ForegroundColor Yellow
Write-Host ""
$dirs = @(
    "server",
    "src",
    "server/src",
    "server/src/models",
    "server/src/routes",
    "server/src/utils",
    "src/app/components",
    "src/app/services"
)

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir" -ForegroundColor Green
    } else {
        Write-Host "✗ $dir" -ForegroundColor Red
    }
}
Write-Host ""

# 3. Check key files
Write-Host "[CRITICAL FILES]" -ForegroundColor Yellow
Write-Host ""
$files = @(
    "package.json",
    "server/package.json",
    "server/src/index.ts",
    "server/tsconfig.json",
    "src/main.tsx",
    "vite.config.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file" -ForegroundColor Red
    }
}
Write-Host ""

# 4. Check ports
Write-Host "[PORT AVAILABILITY]" -ForegroundColor Yellow
Write-Host ""

function Test-PortAvailable {
    param([int]$Port)
    $connection = New-Object System.Net.Sockets.TcpClient
    try {
        $connection.Connect('127.0.0.1', $Port)
        $connection.Close()
        return $false  # Port is in use
    } catch {
        return $true   # Port is available
    }
}

$port3000 = Test-PortAvailable 3000
$port5001 = Test-PortAvailable 5001

if ($port3000) {
    Write-Host "✓ Port 3000 available (Frontend)" -ForegroundColor Green
} else {
    Write-Host "✗ Port 3000 IN USE" -ForegroundColor Red
}

if ($port5001) {
    Write-Host "✓ Port 5001 available (Backend)" -ForegroundColor Green
} else {
    Write-Host "✗ Port 5001 IN USE" -ForegroundColor Red
}
Write-Host ""

# 5. Check npm packages
Write-Host "[DEPENDENCIES]" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend dependencies:" -ForegroundColor Cyan
Push-Location server
$backendDeps = & npm list --depth=0 --json 2>$null | ConvertFrom-Json
if ($backendDeps.dependencies) {
    $backendDeps.dependencies.PSObject.Properties | ForEach-Object {
        Write-Host "  ✓ $($_.Name) ($($_.Value.version))"
    }
} else {
    Write-Host "  ⚠ Could not parse dependencies"
}
Pop-Location
Write-Host ""

# 6. Summary
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "[RECOMMENDATIONS]" -ForegroundColor Yellow
Write-Host ""

if (-not $port3000 -or -not $port5001) {
    Write-Host "1. Kill existing Node processes:" -ForegroundColor Yellow
    Write-Host "   Get-Process node | Stop-Process -Force" -ForegroundColor Gray
}

Write-Host "2. Ensure all dependencies are installed:" -ForegroundColor Yellow
Write-Host "   cd server && npm install" -ForegroundColor Gray
Write-Host "   cd .. && npm install" -ForegroundColor Gray
Write-Host ""

Write-Host "3. To start servers, run:" -ForegroundColor Yellow
Write-Host "   .\START_SERVERS.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
