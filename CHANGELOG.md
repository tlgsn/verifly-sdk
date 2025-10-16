# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### 1.0.1
- ✅ Invalid `API Key` and `Invalid Signature` errors have been fixed.

### Added

- ✅ HMAC-SHA256 signature authentication for all API requests
- ✅ Verification session management (`create`, `get`, `selectMethod`)
- ✅ Session control (`cancel`, `abort`)
- ✅ Balance inquiry (`getBalance`)
- ✅ Webhook signature verification
- ✅ TypeScript support with full type definitions
- ✅ Custom error classes for better error handling
- ✅ Comprehensive documentation and examples

### Features

**Verification Methods:**
- `create(params)` - Create verification session
- `get(sessionId)` - Get session status
- `selectMethod(sessionId, params)` - Select verification method
- `cancel(sessionId)` - Cancel session (temporary)
- `abort(sessionId)` - Abort session (permanent)
- `getBalance()` - Get account balance and transactions

**Webhook Utilities:**
- `verify(payload, signature)` - Verify webhook signature
- `generateSignature(payload)` - Generate HMAC signature
- `constructEvent(payload, signature)` - Construct verified event object
- `response(res)` - Create response helper

**Security:**
- HMAC-SHA256 signature for every API request
- Timestamp-based replay attack prevention
- Fixed base URL: `https://www.verifly.net`

### Configuration

```javascript
const verifly = new Verifly('your-api-key', {
  secretKey: 'your-secret-key',  // REQUIRED for HMAC signature
  timeout: 30000,                 // Optional: Request timeout (ms)
  debug: false                    // Optional: Debug logging
});
```

---

## Links

- [README](./README.md)