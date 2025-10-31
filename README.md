# Verifly SDK

Official Node.js SDK for [Verifly](https://www.verifly.net) - Inbound 2FA Verification System

[![npm version](https://img.shields.io/npm/v/verifly-sdk.svg)](https://www.npmjs.com/package/verifly-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **⚠️ Important:** This SDK uses **HMAC-SHA256 signature authentication**. Both API key and secret key are **required**. 

## Features

- 🔐 **Inbound 2FA Verification** - SMS, WhatsApp, Voice Call, Email
- 🚀 **Simple API** - Easy-to-use promise-based interface
- 🛡️ **Webhook Verification** - Secure webhook signature validation
- 💪 **TypeScript Support** - Full type definitions included
- ⚡ **Error Handling** - Custom error classes for better error management
- 📝 **Well Documented** - Comprehensive examples and documentation

## Installation

```bash
npm install verifly-sdk
```

## Quick Start

```javascript
const Verifly = require('verifly-sdk');

// Initialize client (BOTH keys required)
const verifly = new Verifly('your-api-key', {
  secretKey: 'your-secret-key'  // REQUIRED for API authentication
});

// Create verification session
const session = await verifly.verification.create({
  phone: '5551234567',
  methods: ['sms', 'whatsapp'],
  lang: 'tr',
  webhookUrl: 'https://mysite.com/webhook'
});

console.log('Iframe URL:', session.iframeUrl);
console.log('Session ID:', session.sessionId);
```

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Initialization](#initialization)
- [Verification](#verification)
  - [Create Session](#create-verification-session)
  - [Get Status](#get-verification-status)
  - [Select Method](#select-verification-method)
  - [Check Code](#check-verification-code)
  - [Cancel Session](#cancel-verification-session)
- [Webhooks](#webhooks)
  - [Verify Signature](#verify-webhook-signature)
  - [Handle Events](#handle-webhook-events)
- [Error Handling](#error-handling)
- [TypeScript](#typescript)
- [Examples](#examples)
- [API Reference](#api-reference)

## Initialization

### API Key & Secret Key

**IMPORTANT:** Both keys are **REQUIRED** for authentication:

| Key Type | Used For | Required? | Where to Find |
|----------|----------|-----------|---------------|
| **API Key** | Request identification | ✅ **REQUIRED** | Dashboard → Application → API Key |
| **Secret Key** | HMAC signature generation | ✅ **REQUIRED** | Dashboard → Application → Secret Key |

```javascript
const Verifly = require('verifly-sdk');

// ✅ Basic configuration (both keys required)
const verifly = new Verifly('your-api-key', {
  secretKey: 'your-secret-key'  // REQUIRED
});

// ✅ Full configuration
const verifly = new Verifly('your-api-key', {
  secretKey: 'your-secret-key',         // REQUIRED: For HMAC signature
  timeout: 30000,                        // Optional: Request timeout (ms)
  debug: false                           // Optional: Enable debug logging
});
```

### Options

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
| `secretKey` | string | - | ✅ **YES** | Application secret key (for HMAC signature generation) |
| `timeout` | number | `30000` | No | Request timeout in milliseconds |
| `debug` | boolean | `false` | No | Enable debug logging |

### Authentication Method

Verifly uses **HMAC-SHA256 signature** for API authentication:

```
X-API-Key: your-api-key
X-Signature: hmac-sha256(timestamp + payload, secretKey)
X-Timestamp: current-timestamp
```

The SDK automatically generates these headers for every request.

## Verification

### Create Verification Session

Create a new verification session with phone number and/or email.

```javascript
const session = await verifly.verification.create({
  phone: '5551234567',              // Optional
  email: 'user@example.com',        // Optional
  methods: ['sms', 'whatsapp'],     // Optional: sms, whatsapp, call, email
  lang: 'tr',                        // Optional: en, tr (default: en)
  webhookUrl: 'https://mysite.com/webhook', // Optional
  redirectUrl: 'https://mysite.com/success', // Optional
  timeout: 5,                        // Optional: 1-15 minutes (default: 2)
  data: { userId: '12345', orderId: 'ORD-789' } // Optional: Custom data (max 100KB)
});

// Use the iframe URL in your application
console.log(session.iframeUrl);
```

**Response:**
```javascript
{
  sessionId: 'abc123...',
  iframeUrl: 'https://www.verifly.net/verify/iframe/abc123...',
  expiresAt: '2025-01-14T20:00:00.000Z',
  allowedMethods: ['sms', 'whatsapp'],
  method: null,  // or 'sms' if only one method
  userInputRequired: false
}
```

### Get Verification Status

Check the current status of a verification session.

```javascript
const status = await verifly.verification.get('session-id');

console.log('Status:', status.status);
// Possible values: 'pending', 'waiting', 'verified', 'failed', 'expired'
```

**Response:**
```javascript
{
  sessionId: 'abc123...',
  status: 'verified',
  method: 'sms',
  verificationCode: '123456',
  recipientContact: '5551234567',
  verifiedAt: '2025-01-14T19:55:00.000Z',
  // ... other fields
}
```

### Select Verification Method

If multiple methods are available, select one.

```javascript
await verifly.verification.selectMethod('session-id', {
  method: 'sms',
  recipientContact: '5551234567'  // If not provided in create
});
```

### Cancel Verification Session

Cancel an active verification session (user can retry later).

```javascript
await verifly.verification.cancel('session-id');
```

### Abort Verification Session

Permanently abort a verification session (cannot be retried).

```javascript
await verifly.verification.abort('session-id');
```

**Difference:**
- `cancel()` - Temporary cancellation, user can restart
- `abort()` - Permanent abort, session is completely terminated

### Get Balance

Get account balance and recent transactions.

```javascript
const balance = await verifly.verification.getBalance();

console.log('Balance:', balance.balance, balance.currency);
console.log('Recent transactions:', balance.recentTransactions);
```

**Response:**
```javascript
{
  balance: 1500.00,
  currency: 'TRY',
  userId: '...',
  email: 'user@example.com',
  recentTransactions: [
    {
      type: 'credit',
      amount: 500,
      description: 'Balance added',
      createdAt: '2025-01-14T...'
    },
    // ... more transactions
  ]
}
```

## Webhooks

> **Note:** Secret key is already required for SDK initialization, so webhook features are automatically available.

### Verify Webhook Signature

Verify that a webhook request actually came from Verifly.

```javascript
const express = require('express');
const app = express();

// Initialize with secret key (REQUIRED for webhooks)
const verifly = new Verifly('your-api-key', {
  secretKey: 'your-secret-key'
});

app.use(express.json());

app.post('/webhook/verifly', (req, res) => {
  const signature = req.headers['x-verifly-signature'];
  
  // Verify signature (requires secretKey)
  const isValid = verifly.webhook.verify(req.body, signature);
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});
```

### Handle Webhook Events

Process different webhook event types.

```javascript
app.post('/webhook/verifly', (req, res) => {
  const signature = req.headers['x-verifly-signature'];
  
  try {
    // Construct and verify event
    const event = verifly.webhook.constructEvent(req.body, signature);
    
    // Handle event types
    switch (event.type) {
      case 'verification.success':
        console.log('✅ Verification successful:', event.data.sessionId);
        console.log('Custom data:', event.data.customData); // Your custom data from create()
        // Update user in database, send confirmation, etc.
        break;
      
      case 'verification.failed':
        console.log('❌ Verification failed:', event.data.sessionId);
        break;
      
      case 'verification.expired':
        console.log('⏰ Verification expired:', event.data.sessionId);
        break;
      
      case 'verification.cancelled':
        console.log('🚫 Verification cancelled:', event.data.sessionId);
        break;
    }
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send('Error');
  }
});
```

### Webhook Response Helper

Use the built-in response helper for cleaner code.

```javascript
app.post('/webhook/verifly', (req, res) => {
  const webhook = verifly.webhook.response(res);
  
  try {
    const signature = req.headers['x-verifly-signature'];
    const event = verifly.webhook.constructEvent(req.body, signature);
    
    // Process event...
    
    webhook.success(); // Responds with 200 OK
    
  } catch (error) {
    if (error.message.includes('signature')) {
      webhook.unauthorized('Invalid signature'); // 401
    } else {
      webhook.error('Processing error', 500); // 500
    }
  }
});
```

## Error Handling

The SDK provides custom error classes for better error management.

```javascript
const { errors } = require('verifly-sdk');

try {
  const session = await verifly.verification.create({
    phone: '123',  // Too short
    methods: ['sms']
  });
} catch (error) {
  if (error instanceof errors.ValidationError) {
    console.log('Validation error:', error.message);
    console.log('Response:', error.response);
  }
  
  if (error instanceof errors.InsufficientBalanceError) {
    console.log('Insufficient balance!');
    console.log('Current:', error.balanceData.currentBalance);
    console.log('Required:', error.balanceData.minimumRequired);
  }
  
  if (error instanceof errors.AuthenticationError) {
    console.log('Invalid API key');
  }
}
```

### Error Classes

| Error Class | Status Code | Description |
|-------------|-------------|-------------|
| `VeriflyError` | - | Base error class |
| `AuthenticationError` | 401 | Invalid API key |
| `ValidationError` | 400 | Invalid parameters |
| `InsufficientBalanceError` | 402 | Insufficient account balance |
| `NotFoundError` | 404 | Resource not found |
| `RateLimitError` | 429 | Rate limit exceeded |
| `ServerError` | 500 | Server error |

## TypeScript

The SDK includes full TypeScript type definitions.

```typescript
import Verifly, { 
  VeriflyOptions, 
  CreateVerificationParams,
  VerificationSession 
} from 'verifly-sdk';

const options: VeriflyOptions = {
  debug: true
};

const verifly = new Verifly('your-api-key', options);

const params: CreateVerificationParams = {
  phone: '5551234567',
  methods: ['sms', 'whatsapp'],
  lang: 'tr'
};

const session: VerificationSession = await verifly.verification.create(params);
```

## Examples

Check the `/examples` directory for complete examples:

- **[basic.js](examples/basic.js)** - Basic verification flow
- **[webhook-express.js](examples/webhook-express.js)** - Express.js webhook handling
- **[iframe-integration.js](examples/iframe-integration.js)** - Iframe integration with polling
- **[error-handling.js](examples/error-handling.js)** - Comprehensive error handling

### Running Examples

```bash
cd examples

# Edit the API key in the example file
nano basic.js

# Run the example
node basic.js
```

## Error Handling

The SDK uses exceptions for error handling (standard Node.js practice).

### Try-Catch Pattern

```javascript
const Verifly = require('verifly-sdk');
const { errors } = Verifly;

try {
  const session = await verifly.verification.create({
    phone: '5551234567',
    methods: ['sms']
  });
  
  console.log('✅ Success:', session);
  
} catch (error) {
  // Handle different error types
  if (error instanceof errors.AuthenticationError) {
    console.error('❌ Authentication failed:', error.message);
    // Check your API key and secret key
    
  } else if (error instanceof errors.InsufficientBalanceError) {
    console.error('❌ Insufficient balance:', error.message);
    console.log('Balance data:', error.balanceData);
    // User needs to add balance
    
  } else if (error instanceof errors.ValidationError) {
    console.error('❌ Validation error:', error.message);
    // Fix input parameters
    
  } else if (error instanceof errors.RateLimitError) {
    console.error('❌ Rate limit exceeded:', error.message);
    // Wait and retry
    
  } else {
    console.error('❌ Unknown error:', error.message);
  }
}
```

### Error Types

| Error Class | HTTP Status | Description |
|------------|-------------|-------------|
| `AuthenticationError` | 401 | Invalid API key or secret key |
| `ValidationError` | 400 | Invalid request parameters |
| `InsufficientBalanceError` | 402 | Not enough account balance |
| `NotFoundError` | 404 | Session or resource not found |
| `RateLimitError` | 429 | Too many requests |
| `ServerError` | 500 | Server error |

### Helper Function (Optional)

If you prefer `{ success, error }` format:

```javascript
async function safeVerify(phone) {
  try {
    const session = await verifly.verification.create({
      phone,
      methods: ['sms', 'whatsapp']
    });
    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      statusCode: error.statusCode
    };
  }
}

// Usage
const result = await safeVerify('5551234567');
if (result.success) {
  console.log('✅', result.data);
} else {
  console.log('❌', result.error);
}
```

## API Reference

### Verifly

#### Constructor

```javascript
new Verifly(apiKey, options?)
```

#### Methods

- `setSecretKey(secretKey)` - Set application secret key
- `setDebug(enabled)` - Enable/disable debug mode

### Verification

#### Methods

- `create(params)` - Create verification session
- `get(sessionId)` - Get session status
- `selectMethod(sessionId, params)` - Select verification method
- `cancel(sessionId)` - Cancel session (temporary)
- `abort(sessionId)` - Abort session (permanent)
- `getBalance()` - Get account balance and transactions

### Webhook

#### Methods

- `verify(payload, signature)` - Verify webhook signature
- `generateSignature(payload)` - Generate signature (for testing)
- `constructEvent(payload, signature)` - Construct event object
- `response(res)` - Create response helper

## Support

- 📧 Email: info@verifly.net
- 🌐 Website: https://www.verifly.net
- 📚 Documentation: https://www.verifly.net/docs
- 🐛 Issues: https://github.com/tlgsn/verifly-sdk/issues

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by the **SOCIFLY SOFTWARE LTD**