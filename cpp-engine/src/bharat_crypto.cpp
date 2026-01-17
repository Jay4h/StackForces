#include <iomanip>
#include <memory> // Required for std::unique_ptr
#include <napi.h>
#include <sstream>
#include <stdexcept>
#include <string>


// Platform-specific crypto includes
#ifdef _WIN32
#include <wincrypt.h>
#include <windows.h>
#pragma comment(lib, "advapi32.lib")
#elif __APPLE__
#include <CommonCrypto/CommonDigest.h>
#else
#include <openssl/evp.h>
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
 * Generate Bharat-ID DID
 * Updated: Salt is now passed from Node.js to ensure environment sync
 */
Napi::String GenerateDID(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  // Validate arguments: We now expect 3 (PublicKey, HardwareId, Salt)
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

  // Concatenate inputs
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

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "generateDID"),
              Napi::Function::New(env, GenerateDID));
  return exports;
}

NODE_API_MODULE(bharat_crypto, Init)

} // namespace BharatCrypto