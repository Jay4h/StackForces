@echo off
setlocal enabledelayedexpansion

echo =================================
echo 🇮🇳  Starting Bharat-ID Project
echo =================================

REM Check if Docker is running
echo.
echo [1/3] Checking Infrastructure...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running! 
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Starting databases...
docker-compose up -d
echo ✅ Infrastructure ready.

REM Install Dependencies (Individual installs to avoid C++ build errors)
echo.

REM Start Backend
echo.
echo [1/2] Launching Backend Server...
set "BACKEND_CMD=cd backend"
if not exist "backend\node_modules" (
    set "BACKEND_CMD=!BACKEND_CMD! && echo Installing Backend dependencies... && npm install"
) else (
    set "BACKEND_CMD=!BACKEND_CMD! && echo Backend dependencies found..."
)
set "BACKEND_CMD=!BACKEND_CMD! && echo Starting server... && npm run dev"
start "Bharat-ID Backend" cmd /k "!BACKEND_CMD!"

REM Start Frontend
echo.
echo [2/2] Launching Frontend Server...
set "FRONTEND_CMD=cd frontend"
if not exist "frontend\node_modules" (
    set "FRONTEND_CMD=!FRONTEND_CMD! && echo Installing Frontend dependencies... && npm install"
) else (
    set "FRONTEND_CMD=!FRONTEND_CMD! && echo Frontend dependencies found..."
)
set "FRONTEND_CMD=!FRONTEND_CMD! && echo Starting frontend... && npm run dev"
start "Bharat-ID Frontend" cmd /k "!FRONTEND_CMD!"

echo.
echo =================================
echo 🎉 Project started successfully!
echo =================================
echo.
echo Important: If you see errors, close all windows and run: npm install
echo.
echo App will be available at: http://localhost:5173
echo.
pause
