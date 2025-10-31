const RequestHandler = require('./utils/request');
const Verification = require('./resources/Verification');
const Webhook = require('./resources/Webhook');

/**
 * Main Verifly SDK client
 * 
 * @example
 * const Verifly = require('verifly-sdk');
 * const verifly = new Verifly('your-api-key');
 * 
 * // Create verification session
 * const session = await verifly.verification.create({
 *   phone: '5551234567',
 *   methods: ['sms', 'whatsapp']
 * });
 */
class Verifly {
  /**
   * Initialize Verifly client
   * 
   * @param {string} apiKey - Your Verifly API key
   * @param {Object} options - Configuration options
   * @param {string} options.secretKey - Application secret key (REQUIRED for API authentication)
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @param {boolean} [options.debug=false] - Enable debug logging
   * 
   * @example
   * // Required: Both API key and secret key
   * const verifly = new Verifly('your-api-key', {
   *   secretKey: 'your-secret-key'  // REQUIRED
   * });
   * 
   * // With additional options
   * const verifly = new Verifly('your-api-key', {
   *   secretKey: 'your-secret-key',  // REQUIRED
   *   debug: true
   * });
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    if (!options.secretKey) {
      throw new Error('Secret key is required. Get it from Dashboard → Application → Secret Key');
    }

    this.apiKey = apiKey;
    this.options = {
      secretKey: options.secretKey,
      timeout: options.timeout || 30000,
      debug: options.debug || false,
    };

    // Initialize request handler (secret key required for signature generation)
    this.requestHandler = new RequestHandler(
      this.apiKey,
      this.options.secretKey,
      {
        timeout: this.options.timeout,
        debug: this.options.debug,
      }
    );

    // Initialize resources
    this.verification = new Verification(this.requestHandler);
    this.webhook = new Webhook(this.options.secretKey);
  }

  /**
   * Set secret key (for webhook verification)
   * 
   * @param {string} secretKey - Application secret key
   * 
   * @example
   * verifly.setSecretKey('your-secret-key');
   */
  setSecretKey(secretKey) {
    this.options.secretKey = secretKey;
    this.webhook = new Webhook(secretKey);
  }

  /**
   * Enable or disable debug mode
   * 
   * @param {boolean} enabled - Enable debug mode
   * 
   * @example
   * verifly.setDebug(true);
   */
  setDebug(enabled) {
    this.options.debug = enabled;
    this.requestHandler = new RequestHandler(
      this.apiKey,
      this.options.secretKey,
      {
        timeout: this.options.timeout,
        debug: enabled,
      }
    );
    this.verification = new Verification(this.requestHandler);
  }
}

module.exports = Verifly;
