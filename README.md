# Bharat-ID: Self-Sovereign Identity System

**A decentralized identity framework for 1.4 billion citizens**

## 🎯 Vision

Moving from the "Centralized Honeypot" model to Self-Sovereign Identity (SSI), where:
- **Your device** = Your Digital Vault
- **Government** = Vouches for your identity
- **You** = Own and control your data

## 🏗️ Architecture
<img width="1010" height="567" alt="image" src="https://github.com/user-attachments/assets/32737b64-3a76-471e-ae62-9f090a9d1fc4" />

### Three-Layer Design

1. **Frontend (React + WebAuthn)** - High-velocity UI with biometric authentication
2. **Backend (Node.js + Express)** - API orchestration and session management
3. **C++ Engine** - High-performance cryptographic operations and DID generation

### Technology Stack

- **Frontend**: React, TypeScript, @simplewebauthn/browser, Vite
- **Backend**: Node.js, Express, @simplewebauthn/server, Redis, MongoDB
- **C++ Engine**: N-API, OpenSSL (SHA-256)
- **Infrastructure**: Docker, MongoDB, Redis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.x (for node-gyp)
- Visual Studio Build Tools (Windows)
- Docker Desktop

### Installation

```bash
# Install dependencies for all components
npm run install:all

# Start infrastructure (MongoDB + Redis)
docker-compose up -d

# Build C++ engine
cd cpp-engine && npm run build

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

### Mobile Testing (Required for Biometrics)

WebAuthn requires HTTPS. Use ngrok to create a secure tunnel:

```bash
# Install ngrok
npm install -g ngrok

# Create tunnel to frontend
ngrok http 5173
```

## 📁 Project Structure

```
bharat-id/
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/     # EnrollmentPage, LoginPage
│   │   └── services/  # webauthn-client
│   └── package.json
├── backend/           # Node.js API
│   ├── src/
│   │   ├── routes/    # enrollment.routes
│   │   ├── controllers/
│   │   ├── models/    # did.model
│   │   └── services/  # cpp-bridge
│   └── package.json
├── cpp-engine/        # Native C++ addon
│   ├── src/
│   │   └── bharat_crypto.cpp
│   ├── binding.gyp
│   └── package.json
└── docker-compose.yml
```

## 🔐 How It Works (Phase 1: Enrollment)

1. **User clicks** "Create My Bharat-ID"
2. **Frontend** requests challenge from backend
3. **Phone** prompts for fingerprint/FaceID
4. **Secure Enclave** generates public/private key pair
5. **Public key** sent to backend (private key NEVER leaves device)
6. **C++ engine** generates collision-proof DID using SHA-256
7. **MongoDB** stores DID + public key mapping

**Result**: User gets `did:bharat:7x92...` as their global identity

## 🎨 Features

### ✅ Phase 1: Digital Birth (Current)
- Biometric enrollment
- DID generation
- Secure key storage

### 🔜 Phase 2: Authentication
- Biometric login
- Consent management
- Zero-Knowledge Proofs

### 🔜 Phase 3: Applications
- Healthcare credentials
- Agricultural land ownership
- Smart city access

## 🏆 Competitive Edge vs Traditional Systems

| Feature | Aadhaar | Bharat-ID |
|---------|---------|-----------|
| Data Storage | Central database | User's device |
| Biometrics | Stored on servers | Never leaves phone |
| Privacy | Cross-platform tracking | Pairwise DIDs prevent tracking |
| Verification | Slow centralized API | Instant local verification |

## 👥 Team

- **Jay** - Frontend & Biometric Integration
- **Krish** - Backend & API Orchestration
- **Herin** - C++ Cryptographic Engine
- **Dhruvil** - Strategy & Pitch

## 📄 License

MIT License - Built for India 🇮🇳
=======

