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
      // Transform request to add signature AFTER JSON.stringify (for POST/PUT only)
      transformRequest: [(data, headers) => {
        // Skip if no data (GET/DELETE will be handled by interceptor)
        if (!data) {
          return data;
        }
        
        // Convert data to JSON string
        const jsonString = JSON.stringify(data);
        
        // Generate timestamp
        const timestamp = Date.now().toString();
        
        // Generate signature (HMAC-SHA256 of timestamp + payload)
        const message = `${timestamp}${jsonString}`;
        const signature = crypto
          .createHmac('sha256', this.secretKey)
          .update(message)
          .digest('hex');
        
        // Add authentication headers
        headers['X-API-Key'] = this.apiKey;
        headers['X-Signature'] = signature;
        headers['X-Timestamp'] = timestamp;
        
        if (this.debug) {
          console.log('[Verifly SDK] Request (POST/PUT):', {
            payload: jsonString,
            timestamp: timestamp,
            message: message,
            signature: signature
          });
        }
        
        return jsonString;
      }],
    });

    // Request interceptor (for GET requests without body)
    this.client.interceptors.request.use(
      (config) => {
        // If no body (GET, DELETE), add signature for empty object payload
        if (!config.data && (config.method === 'get' || config.method === 'delete')) {
          const timestamp = Date.now().toString();
          const payload = '{}';  // Backend uses JSON.stringify(req.body) which is {}
          const message = `${timestamp}${payload}`;
          const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(message)
            .digest('hex');
          
          config.headers['X-API-Key'] = this.apiKey;
          config.headers['X-Signature'] = signature;
          config.headers['X-Timestamp'] = timestamp;
          
          if (this.debug) {
            console.log('[Verifly SDK] Request (GET/DELETE):', {
              method: config.method.toUpperCase(),
              url: config.url,
              timestamp: timestamp,
              message: message,
              signature: signature
            });
          }
        }
        
        if (this.debug) {
          console.log('[Verifly SDK] Final Request:', {
            method: config.method.toUpperCase(),
            url: config.url,
            headers: config.headers,
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
