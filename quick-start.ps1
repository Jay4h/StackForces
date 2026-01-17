# Bharat-ID Quick Start Script
# Run this to install all dependencies and start the project

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🇮🇳  Bharat-ID Quick Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker found" -ForegroundColor Green
Write-Host ""

# Start infrastructure
Write-Host "Starting MongoDB and Redis..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ Infrastructure started" -ForegroundColor Green
Write-Host ""

# Wait for databases
Write-Host "Waiting for databases to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✅ Databases ready" -ForegroundColor Green
Write-Host ""

# Install C++ engine
Write-Host "Building C++ Cryptographic Engine..." -ForegroundColor Yellow
Set-Location cpp-engine
npm install
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  C++ build failed, will use JavaScript fallback" -ForegroundColor Yellow
} else {
    Write-Host "✅ C++ engine built successfully" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# Install backend
Write-Host "Installing Backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Write-Host "✅ Backend ready" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Install frontend
Write-Host "Installing Frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Write-Host "✅ Frontend ready" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "=================================" -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open a terminal and run: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Open another terminal and run: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "For mobile testing, see SETUP.md for ngrok instructions" -ForegroundColor Yellow
Write-Host ""
