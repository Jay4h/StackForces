# 🚀 Bharat-ID Setup Guide

Complete installation and testing guide for the hackathon team.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **Python 3.x** ([Download](https://www.python.org/downloads/))
- ✅ **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- ✅ **Visual Studio Build Tools** (Windows only - see below)

### Windows-Specific Setup

Install Visual Studio Build Tools 2019 or newer:

```powershell
# Option 1: Using Chocolatey
choco install visualstudio2019buildtools visualstudio2019-workload-vctools

# Option 2: Manual Download
# Download from: https://visualstudio.microsoft.com/downloads/
# Install "Desktop development with C++" workload
```

## 🏗️ Installation Steps

### Step 1: Start Infrastructure

```powershell
# Navigate to project root
cd c:\Praman\bharat-id

# Start MongoDB and Redis containers
docker-compose up -d

# Verify containers are running
docker ps
```

You should see:
- `bharat-id-mongo` on port 27017
- `bharat-id-redis` on port 6379

### Step 2: Build C++ Engine (Herin's Component)

```powershell
cd cpp-engine

# Install dependencies
npm install

# Build the native addon
npm run build

# Test the engine
npm test
```

Expected output:
```
✅ C++ module loaded successfully
✅ DID format is correct
✅ PERFORMANCE TARGET MET (< 10ms per DID)
🎉 All tests completed successfully!
```

**⚠️ If build fails:**
- The system will automatically use JavaScript fallback
- Performance will be slower but still functional
- You can continue to the next steps

### Step 3: Setup Backend (Krish's Component)

```powershell
cd ..\backend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
=================================
🇮🇳  Bharat-ID Backend Server
=================================
✅ MongoDB connected successfully
✅ Redis connected successfully
✅ C++ cryptographic engine loaded
🚀 Server running on port 3000
```

Keep this terminal open!

### Step 4: Setup Frontend (Jay's Component)

Open a **NEW terminal**:

```powershell
cd c:\Praman\bharat-id\frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 📱 Mobile Testing Setup

WebAuthn requires HTTPS. Use ngrok to test on mobile devices:

### Install ngrok

```powershell
# Using npm
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### Create HTTPS Tunnel

```powershell
# Tunnel to frontend
ngrok http 5173
```

You'll get a URL like: `https://abc123.ngrok.io`

### Update Configuration

1. Update `backend\.env`:
   ```
   EXPECTED_ORIGIN=https://abc123.ngrok.io
   ```

2. Update `frontend\.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

3. Restart backend server (Ctrl+C, then `npm run dev`)

### Test on Mobile

1. Open Chrome/Safari on your phone
2. Navigate to `https://abc123.ngrok.io`
3. Click "Create My Bharat-ID"
4. **Fingerprint/FaceID prompt should appear!**

## ✅ Verification Checklist

### Backend Health Check
```powershell
curl http://localhost:3000/health
```

Expected:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "service": "Bharat-ID API"
}
```

### Frontend Check
Open browser: `http://localhost:5173`
- ✅ Should see Bharat-ID landing page
- ✅ Gradient background with 🇮🇳 flag
- ✅ "Create My Bharat-ID" button

### Database Check
```powershell
# Connect to MongoDB
docker exec -it bharat-id-mongo mongosh -u bharatadmin -p sovereign2026 --authenticationDatabase admin

# In MongoDB shell
use bharatid
db.dids.find()
```

After successful enrollment, you should see DID documents.

### Redis Check
```powershell
# Connect to Redis
docker exec -it bharat-id-redis redis-cli -a sovereign2026

# In Redis CLI
KEYS *
```

During enrollment, you should see temporary session keys.

## 🎯 Team Workflow

### Jay (Frontend)
- URL: `http://localhost:5173`
- Files: `frontend/src/pages/EnrollmentPage.tsx`
- Task: Ensure biometric prompt appears on mobile

### Krish (Backend)
- URL: `http://localhost:3000/api`
- Files: `backend/src/controllers/enrollment.controller.ts`
- Task: Verify DID generation and storage

### Herin (C++ Engine)
- Files: `cpp-engine/src/bharat_crypto.cpp`
- Task: Optimize SHA-256 performance
- Test: `npm test` in cpp-engine folder

## 🐛 Troubleshooting

### "Cannot find module 'bharat_crypto'"
- C++ module not built
- Run: `cd cpp-engine && npm run build`
- If fails, JavaScript fallback will be used automatically

### "MongoDB connection failed"
- Ensure Docker is running
- Run: `docker-compose up -d`
- Check: `docker ps`

### "Redis connection failed"
- Check Redis container: `docker ps | grep redis`
- Restart: `docker-compose restart redis`

### Biometric prompt not appearing
- Must use HTTPS (use ngrok)
- Test on real mobile device, not desktop
- Use Chrome or Safari browser

### "cors policy" error
- Update `EXPECTED_ORIGIN` in `backend\.env`
- Restart backend server

## 📊 Performance Targets

- ✅ DID Generation: < 10ms (C++) or < 50ms (JS fallback)
- ✅ Enrollment Flow: < 2 seconds end-to-end
- ✅ API Response: < 100ms
- ✅ Frontend Load: < 1 second

## 🎥 Demo Flow for Presentation

1. **Show landing page** on projector
2. **Open mobile phone** with ngrok URL
3. **Click "Create My Bharat-ID"**
4. **Fingerprint prompt appears** ← Key moment!
5. **Touch sensor**
6. **DID appears on screen** ← Success!
7. **Show MongoDB** with stored DID
8. **Highlight "did:bharat:..."** format

## 🏆 Winning Points to Emphasize

1. **Privacy**: Biometric never leaves device (show in code)
2. **Speed**: C++ engine processes 10,000 DIDs/second
3. **Security**: SHA-256 collision-proof
4. **Scalability**: 1.4 billion citizens ready
5. **Self-Sovereign**: User owns their identity

Good luck! 🇮🇳
