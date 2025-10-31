# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-10-31

### Added
- ✅ **Custom data support**: Added `data` parameter to `create()` method
  - Attach custom data (string or object) to verification sessions (max 100KB)
  - Data is returned in webhook callbacks as `customData` field
  - Useful for tracking user IDs, order IDs, or any custom metadata

### Changed
- 📝 Updated README with `data` parameter examples
- 📝 Updated TypeScript definitions to include `data?: string | object`
- 📝 Added webhook payload examples showing `customData` field

### Example
```javascript
const session = await verifly.verification.create({
  phone: '5551234567',
  data: { userId: '12345', orderId: 'ORD-789' }
});

// Webhook payload will include:
// { sessionId: '...', customData: { userId: '12345', orderId: 'ORD-789' }, ... }
```

---

## [1.0.1] - 2025-10-15
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