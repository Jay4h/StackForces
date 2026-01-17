// Define Windows macros BEFORE any includes
#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#endif

#include <iomanip>
#include <memory> // Required for std::unique_ptr
#include <napi.h>
#include <set>    // Required for std::set in filterClaims
#include <sstream>
#include <stdexcept>
#include <string>

// Platform-specific crypto includes
#ifdef _WIN32
#include <windows.h>
#include <wincrypt.h>
#pragma comment(lib, "advapi32.lib")
#elif defined(__APPLE__)
#include <CommonCrypto/CommonDigest.h>
#include <CommonCrypto/CommonHMAC.h>
#else
// Linux - OpenSSL
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <openssl/core_names.h>
#endif

namespace BharatCrypto {

/**
 * Convert byte array to hex string
 */
std::string bytesToHex(const unsigned char *data, size_t length) {
  std::stringstream ss;
  ss << std::hex << std::setfill('0');
  for (size_t i = 0; i < length; i++) {
    ss << std::setw(2) << static_cast<int>(data[i]);
  }
  return ss.str();
}

/**
 * Cross-platform SHA-256 implementation
 * Fixed: Added RAII for Linux OpenSSL to prevent memory leaks
 */
std::string computeSHA256(const std::string &input) {
  unsigned char hash[32];

#ifdef _WIN32
  HCRYPTPROV hProv = 0;
  HCRYPTHASH hHash = 0;

  if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES,
                           CRYPT_VERIFYCONTEXT)) {
    throw std::runtime_error("Failed to acquire crypto context");
  }

  if (!CryptCreateHash(hProv, CALG_SHA_256, 0, 0, &hHash)) {
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to create hash");
  }

  if (!CryptHashData(hHash, (const BYTE *)input.c_str(),
                     static_cast<DWORD>(input.length()), 0)) {
    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to hash data");
  }

  DWORD hashLen = 32;
  if (!CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0) ||
      hashLen != 32) {
    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to read hash value");
  }

  CryptDestroyHash(hHash);
  CryptReleaseContext(hProv, 0);

#elif __APPLE__
  CC_SHA256(reinterpret_cast<const unsigned char *>(input.data()),
            static_cast<CC_LONG>(input.size()), hash);

#else
  // Linux OpenSSL implementation (RAII with std::unique_ptr)
  // This ensures EVP_MD_CTX_free is called even if an exception is thrown
  std::unique_ptr<EVP_MD_CTX, decltype(&EVP_MD_CTX_free)> ctx(EVP_MD_CTX_new(),
                                                              EVP_MD_CTX_free);

  if (!ctx) {
    throw std::runtime_error("Failed to create EVP_MD_CTX");
  }

  unsigned int outLen = 0;

  if (EVP_DigestInit_ex(ctx.get(), EVP_sha256(), nullptr) != 1 ||
      EVP_DigestUpdate(ctx.get(), input.data(), input.size()) != 1 ||
      EVP_DigestFinal_ex(ctx.get(), hash, &outLen) != 1) {
    throw std::runtime_error("Failed to compute SHA-256");
  }

  if (outLen != 32) {
    throw std::runtime_error("Unexpected SHA-256 length");
  }
#endif

  return bytesToHex(hash, 32);
}

/**
 * Cross-platform HMAC-SHA256 implementation for Pairwise DIDs
 * This ensures service-specific IDs are mathematically irreversible
 */
std::string computeHMAC_SHA256(const std::string &key, const std::string &data) {
  unsigned char hash[32];

#ifdef _WIN32
  HCRYPTPROV hProv = 0;
  HCRYPTHASH hHash = 0;
  HCRYPTKEY hKey = 0;

  // Key blob structure for HMAC
  struct {
    BLOBHEADER hdr;
    DWORD keySize;
    BYTE keyData[256];
  } keyBlob;

  keyBlob.hdr.bType = PLAINTEXTKEYBLOB;
  keyBlob.hdr.bVersion = CUR_BLOB_VERSION;
  keyBlob.hdr.reserved = 0;
  keyBlob.hdr.aiKeyAlg = CALG_RC2;
  keyBlob.keySize = static_cast<DWORD>(key.length());
  memcpy(keyBlob.keyData, key.data(), key.length());

  if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
    throw std::runtime_error("Failed to acquire crypto context for HMAC");
  }

  if (!CryptImportKey(hProv, (BYTE *)&keyBlob, sizeof(BLOBHEADER) + sizeof(DWORD) + keyBlob.keySize, 0, CRYPT_IPSEC_HMAC_KEY, &hKey)) {
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to import HMAC key");
  }

  if (!CryptCreateHash(hProv, CALG_HMAC, hKey, 0, &hHash)) {
    CryptDestroyKey(hKey);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to create HMAC hash");
  }

  HMAC_INFO hmacInfo;
  ZeroMemory(&hmacInfo, sizeof(hmacInfo));
  hmacInfo.HashAlgid = CALG_SHA_256;
  if (!CryptSetHashParam(hHash, HP_HMAC_INFO, (BYTE *)&hmacInfo, 0)) {
    CryptDestroyHash(hHash);
    CryptDestroyKey(hKey);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to set HMAC algorithm");
  }

  if (!CryptHashData(hHash, (const BYTE *)data.c_str(), static_cast<DWORD>(data.length()), 0)) {
    CryptDestroyHash(hHash);
    CryptDestroyKey(hKey);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to hash data with HMAC");
  }

  DWORD hashLen = 32;
  if (!CryptGetHashParam(hHash, HP_HASHVAL, hash, &hashLen, 0) || hashLen != 32) {
    CryptDestroyHash(hHash);
    CryptDestroyKey(hKey);
    CryptReleaseContext(hProv, 0);
    throw std::runtime_error("Failed to read HMAC value");
  }

  CryptDestroyHash(hHash);
  CryptDestroyKey(hKey);
  CryptReleaseContext(hProv, 0);

#elif __APPLE__
  CCHmac(kCCHmacAlgSHA256, key.data(), key.size(), data.data(), data.size(), hash);

#else
  // Linux OpenSSL HMAC
  unsigned int hashLen = 0;
  if (!HMAC(EVP_sha256(), key.data(), key.size(),
            reinterpret_cast<const unsigned char *>(data.data()), data.size(),
            hash, &hashLen) || hashLen != 32) {
    throw std::runtime_error("Failed to compute HMAC-SHA256");
  }
#endif

  return bytesToHex(hash, 32);
}

/**
 * Generate Bharat-ID DID (Global)
 * Updated: Salt is now passed from Node.js to ensure environment sync
 */
Napi::String GenerateDID(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 3) {
    Napi::TypeError::New(
        env, "Expected 3 arguments: publicKey, hardwareId, and salt")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  if (!info[0].IsString() || !info[1].IsString() || !info[2].IsString()) {
    Napi::TypeError::New(env, "All arguments must be strings")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  std::string publicKey = info[0].As<Napi::String>().Utf8Value();
  std::string hardwareId = info[1].As<Napi::String>().Utf8Value();
  std::string salt = info[2].As<Napi::String>().Utf8Value();

  std::string rawInput = publicKey + hardwareId + salt;

  std::string hashHex;
  try {
    hashHex = computeSHA256(rawInput);
  } catch (const std::exception &e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  return Napi::String::New(env, "did:bharat:" + hashHex);
}

/**
 * Generate Service-Specific Pairwise DID (Phase 2)
 * HMAC ensures each service gets a unique, irreversible ID
 * Formula: HMAC-SHA256(globalDID + serviceName, portalSecret)
 */
Napi::String GeneratePairwiseDID(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 3) {
    Napi::TypeError::New(
        env, "Expected 3 arguments: globalDID, serviceName, portalSecret")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  if (!info[0].IsString() || !info[1].IsString() || !info[2].IsString()) {
    Napi::TypeError::New(env, "All arguments must be strings")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  std::string globalDID = info[0].As<Napi::String>().Utf8Value();
  std::string serviceName = info[1].As<Napi::String>().Utf8Value();
  std::string portalSecret = info[2].As<Napi::String>().Utf8Value();

  // Combine global DID with service name as the message
  std::string message = globalDID + "|" + serviceName;

  std::string hmacHex;
  try {
    hmacHex = computeHMAC_SHA256(portalSecret, message);
  } catch (const std::exception &e) {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    return Napi::String::New(env, "");
  }

  // Return service-specific pairwise DID
  return Napi::String::New(env, "did:bharat:" + serviceName + ":" + hmacHex);
}

/**
 * Filter Claims for Selective Disclosure (Phase 2)
 * Only returns fields that user consented to share
 * Input: JSON string, Array of allowed field names
 * Output: Filtered JSON string
 */
Napi::String FilterClaims(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Expected 2 arguments: profileJSON, allowedFields")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "{}");
  }

  if (!info[0].IsString() || !info[1].IsArray()) {
    Napi::TypeError::New(env, "First arg must be string, second must be array")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "{}");
  }

  std::string profileJSON = info[0].As<Napi::String>().Utf8Value();
  Napi::Array allowedFieldsArray = info[1].As<Napi::Array>();

  // Convert JS array to C++ set for O(1) lookup
  std::set<std::string> allowedFields;
  for (uint32_t i = 0; i < allowedFieldsArray.Length(); i++) {
    Napi::Value val = allowedFieldsArray[i];
    if (val.IsString()) {
      allowedFields.insert(val.As<Napi::String>().Utf8Value());
    }
  }

  // Simple JSON parser (manual - production would use rapidjson or nlohmann/json)
  // For hackathon: Assume format {"field1":"value1","field2":"value2"}
  std::string filtered = "{";
  bool first = true;

  size_t pos = 0;
  while ((pos = profileJSON.find("\"", pos)) != std::string::npos) {
    size_t keyStart = pos + 1;
    size_t keyEnd = profileJSON.find("\"", keyStart);
    if (keyEnd == std::string::npos) break;

    std::string key = profileJSON.substr(keyStart, keyEnd - keyStart);

    // Find the value
    size_t valueStart = profileJSON.find(":", keyEnd) + 1;
    while (valueStart < profileJSON.length() && 
           (profileJSON[valueStart] == ' ' || profileJSON[valueStart] == '\t')) {
      valueStart++;
    }

    size_t valueEnd;
    if (profileJSON[valueStart] == '"') {
      // String value
      valueEnd = profileJSON.find("\"", valueStart + 1) + 1;
    } else {
      // Number or boolean
      valueEnd = profileJSON.find_first_of(",}", valueStart);
    }

    std::string value = profileJSON.substr(valueStart, valueEnd - valueStart);

    // Check if field is allowed
    if (allowedFields.count(key) > 0) {
      if (!first) filtered += ",";
      filtered += "\"" + key + "\":" + value;
      first = false;
    }

    pos = valueEnd;
  }

  filtered += "}";
  return Napi::String::New(env, filtered);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "generateDID"),
              Napi::Function::New(env, GenerateDID));
  exports.Set(Napi::String::New(env, "generatePairwiseDID"),
              Napi::Function::New(env, GeneratePairwiseDID));
  exports.Set(Napi::String::New(env, "filterClaims"),
              Napi::Function::New(env, FilterClaims));
  return exports;
}

NODE_API_MODULE(bharat_crypto, Init)

} // namespace BharatCrypto