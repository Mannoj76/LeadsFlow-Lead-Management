@echo off
REM ============================================
REM LeadsFlow CRM - Start Both Servers
REM Professional Startup Script
REM ============================================

setlocal enabledelayedexpansion

REM Colors
cls
color 0A

echo.
echo ════════════════════════════════════════════════════════════
echo       LeadsFlow CRM - Professional Startup Script
echo ════════════════════════════════════════════════════════════
echo.

REM Check if Node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 04
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Kill any existing Node processes
echo [1/5] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Verify project directories exist
echo [2/5] Verifying project structure...
if not exist "server" (
    color 04
    echo ERROR: Server directory not found!
    pause
    exit /b 1
)

if not exist "package.json" (
    color 04
    echo ERROR: Frontend package.json not found!
    pause
    exit /b 1
)

REM Install dependencies
echo [3/5] Installing dependencies...
cd server
call npm install --silent >nul 2>&1
cd ..
call npm install --silent >nul 2>&1

REM Start Backend
echo [4/5] Starting Backend Server (Port 5001)...
echo.
start "LeadsFlow Backend" cmd /k "cd server && npm run dev"
timeout /t 4 /nobreak >nul

REM Start Frontend
echo [5/5] Starting Frontend Server (Port 3000)...
echo.
start "LeadsFlow Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Display status
echo.
echo ════════════════════════════════════════════════════════════
echo ✓ Both servers are now starting!
echo ════════════════════════════════════════════════════════════
echo.
echo BACKEND:  http://localhost:5001
echo FRONTEND: http://localhost:3000
echo.
echo Waiting for servers to fully start (20 seconds)...
echo.

REM Wait and verify
timeout /t 20 /nobreak

REM Test connectivity
echo.
echo Testing Backend Connectivity...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is responding
) else (
    color 0E
    echo ⚠ Backend is starting (may take a moment)
)

echo.
echo Testing Frontend Connectivity...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Frontend is responding
) else (
    color 0E
    echo ⚠ Frontend is starting (may take a moment)
)

echo.
echo ════════════════════════════════════════════════════════════
echo IMPORTANT: Keep this window open to run the servers!
echo When you're done, close both server windows to stop them.
echo ════════════════════════════════════════════════════════════
echo.

REM Keep the launcher window open
pause
