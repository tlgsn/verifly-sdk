/**
 * Custom error class for Verifly SDK
 */
class VeriflyError extends Error {
  constructor(message, statusCode = null, response = null) {
    super(message);
    this.name = 'VeriflyError';
    this.statusCode = statusCode;
    this.response = response;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error (invalid API key)
 */
class AuthenticationError extends VeriflyError {
  constructor(message = 'Invalid API key') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation error (invalid parameters)
 */
class ValidationError extends VeriflyError {
  constructor(message = 'Invalid parameters', response = null) {
    super(message, 400, response);
    this.name = 'ValidationError';
  }
}

/**
 * Insufficient balance error
 */
class InsufficientBalanceError extends VeriflyError {
  constructor(message = 'Insufficient balance', data = null) {
    super(message, 402, data);
    this.name = 'InsufficientBalanceError';
    this.balanceData = data;
  }
}

/**
 * Resource not found error
 */
class NotFoundError extends VeriflyError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error
 */
class RateLimitError extends VeriflyError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Server error
 */
class ServerError extends VeriflyError {
  constructor(message = 'Server error') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

module.exports = {
  VeriflyError,
  AuthenticationError,
  ValidationError,
  InsufficientBalanceError,
  NotFoundError,
  RateLimitError,
  ServerError,
};
