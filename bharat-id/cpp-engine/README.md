# Bharat-ID C++ Cryptographic Engine

High-performance native addon for DID generation using SHA-256.

## Features

- ⚡ **Ultra-fast**: < 10ms per DID generation
- 🔒 **Secure**: SHA-256 cryptographic hashing
- 🌐 **Cross-platform**: Windows, macOS, Linux
- 🎯 **Deterministic**: Same inputs always produce same DID

## Building

### Prerequisites

- Node.js 18+
- Python 3.x
- **Windows**: Visual Studio Build Tools 2019+
- **macOS**: Xcode Command Line Tools
- **Linux**: build-essential, libssl-dev

### Compilation

```bash
npm install
npm run build
```

## Testing

```bash
npm test
```

Expected output:
- Format validation: `did:bharat:<64-hex-chars>`
- Determinism: Same inputs = Same DID
- Uniqueness: Different inputs = Different DIDs
- Performance: < 10ms per generation

## Usage

```javascript
const bharatCrypto = require('./build/Release/bharat_crypto');

const did = bharatCrypto.generateDID(
  'publicKey_base64',
  'hardwareId'
);

console.log(did); // did:bharat:7x92...
```

## Algorithm

```
DID = "did:bharat:" + SHA256(publicKey + hardwareId + "BHARAT_SOVEREIGN_2026")
```

## Integration

The backend automatically uses this C++ engine when available, with graceful fallback to JavaScript implementation if compilation fails.
