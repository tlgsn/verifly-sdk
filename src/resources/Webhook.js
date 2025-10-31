const crypto = require('crypto');

/**
 * Webhook utilities for verifying and handling webhook events
 */
class Webhook {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  /**
   * Verify webhook signature
   * 
   * @param {Object} payload - Webhook payload (req.body)
   * @param {string} signature - Signature from header (x-verifly-signature)
   * @returns {boolean} Whether signature is valid
   * 
   * @example
   * // Initialize with secret key (REQUIRED)
   * const verifly = new Verifly('api-key', {
   *   secretKey: 'your-secret-key'
   * });
   * 
   * app.post('/webhook', (req, res) => {
   *   const signature = req.headers['x-verifly-signature'];
   *   const isValid = verifly.webhook.verify(req.body, signature);
   *   
   *   if (!isValid) {
   *     return res.status(401).send('Invalid signature');
   *   }
   *   
   *   // Process webhook...
   *   res.status(200).send('OK');
   * });
   */
  verify(payload, signature) {
    if (!this.secretKey) {
      console.warn('⚠️  Verifly SDK: secretKey is required for webhook verification. Initialize with: new Verifly(apiKey, { secretKey: "your-secret-key" })');
      return false;
    }
    
    if (!signature) {
      return false;
    }

    try {
      // Create HMAC signature
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payloadString)
        .digest('hex');

      // Timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate webhook signature (for testing)
   * 
   * @param {Object} payload - Webhook payload
   * @returns {string} HMAC signature
   * 
   * @example
   * const signature = verifly.webhook.generateSignature({ event: 'test' });
   */
  generateSignature(payload) {
    if (!this.secretKey) {
      throw new Error('Secret key is required to generate signature');
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payloadString)
      .digest('hex');
  }

  /**
   * Construct webhook event object from raw request
   * 
   * @param {Object} payload - Raw webhook payload
   * @param {string} signature - Signature from header
   * @returns {Object} Webhook event object
   * @throws {Error} If signature is invalid or secretKey is missing
   * 
   * @example
   * // Initialize with secret key (REQUIRED)
   * const verifly = new Verifly('api-key', {
   *   secretKey: 'your-secret-key'
   * });
   * 
   * app.post('/webhook', (req, res) => {
   *   const event = verifly.webhook.constructEvent(
   *     req.body,
   *     req.headers['x-verifly-signature']
   *   );
   *   
   *   switch (event.type) {
   *     case 'verification.success':
   *       console.log('Verification successful:', event.data.sessionId);
   *       break;
   *     case 'verification.failed':
   *       console.log('Verification failed:', event.data.sessionId);
   *       break;
   *   }
   *   
   *   res.status(200).send('OK');
   * });
   */
  constructEvent(payload, signature) {
    if (!this.secretKey) {
      throw new Error('Secret key is required for webhook verification. Initialize with: new Verifly(apiKey, { secretKey: "your-secret-key" })');
    }
    
    if (!this.verify(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    return {
      id: payload.id || payload.sessionId,
      type: payload.event || this._inferEventType(payload),
      data: payload,
      timestamp: payload.timestamp || payload.verifiedAt || new Date().toISOString(),
    };
  }

  /**
   * Infer event type from payload (if not explicitly provided)
   * @private
   */
  _inferEventType(payload) {
    if (payload.event) return payload.event;
    if (payload.status === 'verified') return 'verification.success';
    if (payload.status === 'failed') return 'verification.failed';
    if (payload.status === 'expired') return 'verification.expired';
    if (payload.status === 'cancelled') return 'verification.cancelled';
    return 'verification.unknown';
  }

  /**
   * Create a webhook response helper
   * 
   * @param {Object} res - Express response object
   * @returns {Object} Helper methods
   * 
   * @example
   * app.post('/webhook', (req, res) => {
   *   const webhook = verifly.webhook.response(res);
   *   
   *   try {
   *     const event = verifly.webhook.constructEvent(req.body, req.headers['x-verifly-signature']);
   *     // Process event...
   *     webhook.success();
   *   } catch (error) {
   *     webhook.error('Invalid signature');
   *   }
   * });
   */
  response(res) {
    return {
      success: (message = 'OK') => res.status(200).send(message),
      error: (message = 'Error', status = 400) => res.status(status).send(message),
      unauthorized: (message = 'Unauthorized') => res.status(401).send(message),
    };
  }
}

module.exports = Webhook;
