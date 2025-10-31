const Verifly = require('../src/index');
const { errors } = require('../src/index');

/**
 * Error handling examples
 * 
 * This example shows how to handle different types of errors
 */

async function main() {
  const verifly = new Verifly('your-api-key-here', {
    secretKey: 'your-secret-key-here',  // REQUIRED
    debug: false,
  });

  // Example 1: Handling authentication errors
  await handleAuthenticationError();

  // Example 2: Handling validation errors
  await handleValidationError(verifly);

  // Example 3: Handling insufficient balance
  await handleInsufficientBalance(verifly);

  // Example 4: Handling not found errors
  await handleNotFound(verifly);

  // Example 5: Generic error handling
  await handleGenericErrors(verifly);
}

/**
 * Authentication error (invalid API key)
 */
async function handleAuthenticationError() {
  console.log('\n=== Authentication Error Example ===');
  
  try {
    const invalidClient = new Verifly('invalid-api-key', {
      secretKey: 'invalid-secret-key'
    });

    await invalidClient.verification.create({
      phone: '5551234567',
      methods: ['sms'],
    });
  } catch (error) {
    if (error instanceof errors.AuthenticationError) {
      console.log('\u274c Authentication failed');
      console.log('Message:', error.message);
      console.log('Status:', error.statusCode); // 401
      
      // Handle: Prompt user to check API key and secret key
    }
  }
}

/**
 * Validation error (invalid parameters)
 */
async function handleValidationError(verifly) {
  console.log('\n=== Validation Error Example ===');

  try {
    await verifly.verification.create({
      phone: '123', // Too short
      methods: ['sms'],
    });
  } catch (error) {
    if (error instanceof errors.ValidationError) {
      console.log('❌ Validation error');
      console.log('Message:', error.message);
      console.log('Response:', error.response);
      
      // Handle: Show validation errors to user
      if (error.response?.data?.errors) {
        console.log('Field errors:', error.response.data.errors);
      }
    }
  }
}

/**
 * Insufficient balance error
 */
async function handleInsufficientBalance(verifly) {
  console.log('\n=== Insufficient Balance Example ===');

  try {
    await verifly.verification.create({
      phone: '5551234567',
      methods: ['sms', 'whatsapp'],
    });
  } catch (error) {
    if (error instanceof errors.InsufficientBalanceError) {
      console.log('❌ Insufficient balance');
      console.log('Message:', error.message);
      
      // Access balance data
      const balanceData = error.balanceData;
      if (balanceData) {
        console.log('Current balance:', balanceData.currentBalance);
        console.log('Minimum required:', balanceData.minimumRequired);
        console.log('Deficit:', balanceData.deficit);
        
        // Handle: Redirect to add balance page
        // window.location.href = '/add-balance';
      }
    }
  }
}

/**
 * Not found error
 */
async function handleNotFound(verifly) {
  console.log('\n=== Not Found Example ===');

  try {
    await verifly.verification.get('non-existent-session-id');
  } catch (error) {
    if (error instanceof errors.NotFoundError) {
      console.log('❌ Session not found');
      console.log('Message:', error.message);
      
      // Handle: Show "session expired" message
    }
  }
}

/**
 * Generic error handling with error types
 */
async function handleGenericErrors(verifly) {
  console.log('\n=== Generic Error Handling ===');

  try {
    // Some API call
    await verifly.verification.create({
      phone: '5551234567',
      methods: ['sms'],
    });
  } catch (error) {
    // Check error type
    switch (error.name) {
      case 'AuthenticationError':
        console.log('🔒 Please check your API key');
        break;

      case 'ValidationError':
        console.log('📝 Invalid input:', error.message);
        break;

      case 'InsufficientBalanceError':
        console.log('💰 Please add balance to your account');
        console.log('Deficit:', error.balanceData?.deficit);
        break;

      case 'NotFoundError':
        console.log('🔍 Resource not found');
        break;

      case 'RateLimitError':
        console.log('⏱️ Too many requests, please wait');
        break;

      case 'ServerError':
        console.log('🔧 Server error, please try again later');
        break;

      default:
        console.log('❌ Unknown error:', error.message);
    }

    // Always log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
  }
}

/**
 * Async/await with try-catch pattern
 */
async function bestPracticeExample() {
  const verifly = new Verifly(process.env.VERIFLY_API_KEY, {
    secretKey: process.env.VERIFLY_SECRET_KEY
  });

  try {
    // Create session
    const session = await verifly.verification.create({
      phone: '5551234567',
      methods: ['sms', 'whatsapp'],
      webhookUrl: process.env.WEBHOOK_URL,
      lang: 'tr',
    });

    console.log('✅ Session created:', session.sessionId);
    return session;

  } catch (error) {
    // Log error
    console.error('Verification creation failed:', error.message);

    // Handle specific errors
    if (error instanceof errors.InsufficientBalanceError) {
      // Notify admin
      await notifyAdmin('Low balance alert', error.balanceData);
      
      // Show user-friendly message
      throw new Error('Service temporarily unavailable');
    }

    if (error instanceof errors.ValidationError) {
      // Return validation errors to user
      return {
        success: false,
        errors: error.response?.data?.errors || [error.message],
      };
    }

    // Rethrow for other errors
    throw error;
  }
}

/**
 * Helper: Notify admin
 */
async function notifyAdmin(subject, data) {
  console.log(`📧 Admin notification: ${subject}`, data);
  // Send email, Slack message, etc.
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  handleAuthenticationError,
  handleValidationError,
  handleInsufficientBalance,
  handleNotFound,
  handleGenericErrors,
  bestPracticeExample,
};
