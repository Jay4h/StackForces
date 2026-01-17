# Bharat-ID Mobile Setup Script
# This script helps you set up ngrok tunnels for mobile testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📱  Bharat-ID Mobile Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
Write-Host "Checking ngrok..." -ForegroundColor Yellow
try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "✅ ngrok is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Visit: https://ngrok.com/download" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Starting ngrok tunnels..." -ForegroundColor Yellow
Write-Host ""

# Start frontend tunnel
Write-Host "1. Frontend tunnel (port 5173)..." -ForegroundColor Cyan
Start-Process -FilePath "ngrok" -ArgumentList "http","5173" -WindowStyle Minimized
Start-Sleep -Seconds 3

# Get frontend URL
try {
    $frontendInfo = Invoke-RestMethod -Uri http://localhost:4040/api/tunnels
    $frontendUrl = ($frontendInfo.tunnels | Where-Object { $_.proto -eq 'https' })[0].public_url
    Write-Host "   ✅ Frontend: $frontendUrl" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend tunnel starting... Check http://localhost:4040" -ForegroundColor Yellow
    $frontendUrl = "https://YOUR-FRONTEND-NGROK-URL.ngrok-free.app"
}

Write-Host ""
Write-Host "2. Backend tunnel (port 3000)..." -ForegroundColor Cyan
Write-Host "   Opening in a new window..." -ForegroundColor Yellow
Start-Process -FilePath "ngrok" -ArgumentList "http","3000"
Start-Sleep -Seconds 3

# Try to get backend URL (may be on different port)
try {
    $backendInfo = Invoke-RestMethod -Uri http://localhost:4041/api/tunnels
    $backendUrl = ($backendInfo.tunnels | Where-Object { $_.proto -eq 'https' })[0].public_url
    Write-Host "   ✅ Backend: $backendUrl" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend tunnel starting... Check the ngrok window or http://localhost:4041" -ForegroundColor Yellow
    $backendUrl = "https://YOUR-BACKEND-NGROK-URL.ngrok-free.app"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Mobile Access Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Frontend URL (open this on your mobile):" -ForegroundColor Yellow
Write-Host "   $frontendUrl" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "2. Backend URL (you'll need this):" -ForegroundColor Yellow
Write-Host "   $backendUrl" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "3. Update frontend to use backend URL:" -ForegroundColor Yellow
Write-Host "   Create file: frontend/.env" -ForegroundColor White
Write-Host "   Add: VITE_API_URL=$backendUrl/api" -ForegroundColor White
Write-Host ""
Write-Host "4. Restart frontend server after creating .env file" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Check ngrok web interfaces:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:4040" -ForegroundColor White
Write-Host "   Backend: http://localhost:4041 (or check the ngrok window)" -ForegroundColor White
Write-Host ""
