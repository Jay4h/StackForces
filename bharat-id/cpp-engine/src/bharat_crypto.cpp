#include <napi.h>
#include <string>
#include <sstream>
#include <iomanip>

// Platform-specific crypto includes
#ifdef _WIN32
  // Windows: Use built-in CryptoAPI or fallback to simple hash
  #include <windows.h>
  #include <wincrypt.h>
  #pragma comment(lib, "advapi32.lib")
#elif __APPLE__
  // macOS: Use CommonCrypto
  #include <CommonCrypto/CommonDigest.h>
#else
  // Linux: Use OpenSSL
  #include <openssl/sha.h>
#endif

namespace BharatCrypto {

/**
 * Convert byte array to hex string
 */
std::string bytesToHex(const unsigned char* data, size_t length) {
  std::stringstream ss;
  ss << std::hex << std::setfill('0');
  for (size_t i = 0; i < length; i++) {
    ss << std::setw(2) << static_cast<int>(data[i]);
  }
  return ss.str();
}

/**
 * Cross-platform SHA-256 implementation
 */
std::string computeSHA256(const std::string& input) {
  unsigned char hash[32]; // SHA-256 produces 32 bytes
  
#ifdef _WIN32
  // Windows CryptoAPI implementation
  HCRYPTPROV hProv = 0;
  HCRYPTHASH hHash = 0;
  
  if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
    throw std::runtime_error("Failed to acquire crypto context");
  }
  
  if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to create hash");
  }
  
  if (!CryptHashData(hHash, (const BYTE*)input.c_str(), input.length(), 0)) {
    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to hash data");
  }
  
  DWORD hashLen = 32;
  CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0);
  
  CryptDestroyHash(hHash);
  CryptReleaseContext(hProv, 0);
  
#elif __APPLE__
  // macOS CommonCrypto implementation
  CC_SHA256(input.c_str(), input.length(), hash);
  
#else
  // Linux OpenSSL implementation
  SHA256_CTX sha256;
  SHA256_Init(&sha256);
  SHA256_Update(&sha256, input.c_str(), input.length());
  SHA256_Final(hash, &sha256);
#endif
  
  return bytesToHex(hash, 32);
}

/**
 * Generate Bharat-ID DID
 * Algorithm: SHA-256(publicKey + hardwareId + SALT)
 */
Napi::String GenerateDID(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  
  // Validate arguments
  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Expected 2 arguments: publicKey and hardwareId")
      .ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }
  
  if (!info[0].IsString() || !info[1].IsString()) {
    Napi::TypeError::New(env, "Arguments must be strings")
      .ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }
  
  // Extract arguments
  std::string publicKey = info[0].As<Napi::String>().Utf8Value();
  std::string hardwareId = info[1].As<Napi::String>().Utf8Value();
  
  // Bharat-ID secret salt
  const std::string SALT = "BHARAT_SOVEREIGN_2026";
  
  // Concatenate inputs
  std::string rawInput = publicKey + hardwareId + SALT;
  
  // Compute SHA-256 hash
  std::string hashHex;
  try {
    hashHex = computeSHA256(rawInput);
  } catch (const std::exception& e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }
  
  // Format as DID
  std::string did = "did:bharat:" + hashHex;
  
  return Napi::String::New(env, did);
}

/**
 * Module initialization
 */
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(
    Napi::String::New(env, "generateDID"),
    Napi::Function::New(env, GenerateDID)
  );
  
  return exports;
}

NODE_API_MODULE(bharat_crypto, Init)

} // namespace BharatCrypto
