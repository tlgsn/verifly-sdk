const express = require('express');
const Verifly = require('../src/index');

/**
 * Express webhook example
 * 
 * This example shows how to handle Verifly webhooks
 * in an Express.js application
 */

const app = express();

// Parse JSON body
app.use(express.json());

// Initialize Verifly client (secret key required)
const verifly = new Verifly('your-api-key-here', {
  secretKey: 'your-secret-key-here', // REQUIRED for both API and webhook
});

/**
 * Webhook endpoint
 */
app.post('/webhook/verifly', (req, res) => {
  console.log('📨 Webhook received');

  try {
    // Get signature from header
    const signature = req.headers['x-verifly-signature'];
    
    if (!signature) {
      console.error('❌ No signature in headers');
      return res.status(401).send('No signature provided');
    }

    // Verify signature
    const isValid = verifly.webhook.verify(req.body, signature);
    
    if (!isValid) {
      console.error('❌ Invalid signature');
      return res.status(401).send('Invalid signature');
    }

    console.log('✅ Signature verified');

    // Construct event object
    const event = verifly.webhook.constructEvent(req.body, signature);
    
    console.log('Event type:', event.type);
    console.log('Event data:', event.data);

    // Handle different event types
    switch (event.type) {
      case 'verification.success':
        handleVerificationSuccess(event.data);
        break;
      
      case 'verification.failed':
        handleVerificationFailed(event.data);
        break;
      
      case 'verification.expired':
        handleVerificationExpired(event.data);
        break;
      
      case 'verification.cancelled':
        handleVerificationCancelled(event.data);
        break;
      
      default:
        console.log('Unknown event type:', event.type);
    }

    // Always respond with 200 OK
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).send('Error processing webhook');
  }
});

/**
 * Handle successful verification
 */
function handleVerificationSuccess(data) {
  console.log('✅ Verification successful!');
  console.log('Session ID:', data.sessionId);
  console.log('Method:', data.method);
  console.log('Verified at:', data.verifiedAt);
  console.log('Recipient:', data.recipientContact);
  
  // Your business logic here
  // Example: Update user in database, send confirmation email, etc.
}

/**
 * Handle failed verification
 */
function handleVerificationFailed(data) {
  console.log('❌ Verification failed');
  console.log('Session ID:', data.sessionId);
  console.log('Reason:', data.failureReason);
  
  // Your business logic here
}

/**
 * Handle expired verification
 */
function handleVerificationExpired(data) {
  console.log('⏰ Verification expired');
  console.log('Session ID:', data.sessionId);
  
  // Your business logic here
}

/**
 * Handle cancelled verification
 */
function handleVerificationCancelled(data) {
  console.log('🚫 Verification cancelled');
  console.log('Session ID:', data.sessionId);
  
  // Your business logic here
}

/**
 * Alternative: Using webhook response helper
 */
app.post('/webhook/verifly-alt', (req, res) => {
  const webhook = verifly.webhook.response(res);
  
  try {
    const signature = req.headers['x-verifly-signature'];
    const event = verifly.webhook.constructEvent(req.body, signature);
    
    // Process event...
    console.log('Event received:', event.type);
    
    webhook.success(); // Responds with 200 OK
    
  } catch (error) {
    if (error.message.includes('signature')) {
      webhook.unauthorized('Invalid signature'); // 401
    } else {
      webhook.error('Processing error', 500); // 500
    }
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server listening on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook/verifly`);
});
