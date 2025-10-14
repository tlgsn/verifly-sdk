const axios = require('axios');
const crypto = require('crypto');
const {
  VeriflyError,
  AuthenticationError,
  ValidationError,
  InsufficientBalanceError,
  NotFoundError,
  RateLimitError,
  ServerError,
} = require('../errors/VeriflyError');

/**
 * HTTP client for Verifly API
 */
class RequestHandler {
  constructor(apiKey, secretKey, options = {}) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://www.verifly.net'; // Fixed, cannot be changed
    this.debug = options.debug || false;
    this.timeout = options.timeout || 30000;
    
    if (!this.secretKey) {
      throw new Error('Secret key is required. Initialize with: new Verifly(apiKey, { secretKey: "your-secret-key" })');
    }
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'verifly-sdk/1.0.0',
      },
    });

    // Request interceptor (add authentication headers)
    this.client.interceptors.request.use(
      (config) => {
        // Generate timestamp
        const timestamp = Date.now().toString();
        
        // Generate signature (HMAC-SHA256 of timestamp + payload)
        const payload = config.data ? JSON.stringify(config.data) : '';
        const data = `${timestamp}${payload}`;
        const signature = crypto
          .createHmac('sha256', this.secretKey)
          .update(data)
          .digest('hex');
        
        // Add authentication headers
        config.headers['X-API-Key'] = this.apiKey;
        config.headers['X-Signature'] = signature;
        config.headers['X-Timestamp'] = timestamp;
        
        if (this.debug) {
          console.log('[Verifly SDK] Request:', {
            method: config.method.toUpperCase(),
            url: config.url,
            data: config.data,
            headers: {
              'X-API-Key': this.apiKey,
              'X-Timestamp': timestamp,
              'X-Signature': signature.substring(0, 16) + '...',
            },
          });
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor (for error handling)
    this.client.interceptors.response.use(
      (response) => {
        if (this.debug) {
          console.log('[Verifly SDK] Response:', {
            status: response.status,
            data: response.data,
          });
        }
        return response.data;
      },
      (error) => {
        return Promise.reject(this._handleError(error));
      }
    );
  }

  /**
   * Handle HTTP errors and convert to custom errors
   */
  _handleError(error) {
    if (!error.response) {
      // Network error or timeout
      return new VeriflyError(
        error.message || 'Network error',
        null,
        null
      );
    }

    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Unknown error';

    switch (status) {
      case 400:
        return new ValidationError(message, data);
      case 401:
        return new AuthenticationError(message);
      case 402:
        return new InsufficientBalanceError(message, data?.data);
      case 404:
        return new NotFoundError(message);
      case 429:
        return new RateLimitError(message);
      case 500:
      case 502:
      case 503:
        return new ServerError(message);
      default:
        return new VeriflyError(message, status, data);
    }
  }

  /**
   * Make GET request
   */
  async get(path, params = {}) {
    return this.client.get(path, { params });
  }

  /**
   * Make POST request
   */
  async post(path, data = {}) {
    return this.client.post(path, data);
  }

  /**
   * Make PUT request
   */
  async put(path, data = {}) {
    return this.client.put(path, data);
  }

  /**
   * Make DELETE request
   */
  async delete(path) {
    return this.client.delete(path);
  }
}

module.exports = RequestHandler;
