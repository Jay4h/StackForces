@echo off
echo =================================
echo 🧹 Deep Clean & Reinstall
echo =================================

echo [1/4] Terminatinig Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/4] Removing old node_modules (this may take a moment)...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules"
if exist "backend\node_modules" rmdir /s /q "backend\node_modules"
if exist "cpp-engine\node_modules" rmdir /s /q "cpp-engine\node_modules"

echo [3/4] Removing lock files...
if exist "package-lock.json" del /q "package-lock.json"
if exist "frontend\package-lock.json" del /q "frontend\package-lock.json"
if exist "backend\package-lock.json" del /q "backend\package-lock.json"

echo [4/4] Installing fresh dependencies (Root)...
call npm install

echo.
echo =================================
echo ✅ Clean Complete!
echo =================================
echo You can now run start-project.bat
pause
