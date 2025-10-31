const Verifly = require('./Verifly');
const {
  VeriflyError,
  AuthenticationError,
  ValidationError,
  InsufficientBalanceError,
  NotFoundError,
  RateLimitError,
  ServerError,
} = require('./errors/VeriflyError');

// Export main class
module.exports = Verifly;

// Export errors for error handling
module.exports.errors = {
  VeriflyError,
  AuthenticationError,
  ValidationError,
  InsufficientBalanceError,
  NotFoundError,
  RateLimitError,
  ServerError,
};

// Default export for ES6 imports
module.exports.default = Verifly;
