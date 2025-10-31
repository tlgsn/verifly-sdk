const Verifly = require('../src/index');

/**
 * Basic verification example
 * 
 * This example shows how to create a verification session
 * and check its status
 */

async function main() {
  // Initialize client (both keys required)
  const verifly = new Verifly('your-api-key-here', {
    secretKey: 'your-secret-key-here',  // REQUIRED
    debug: true, // Enable debug logging
  });

  try {
    // Create verification session
    console.log('Creating verification session...');
    const session = await verifly.verification.create({
      phone: '5551234567',
      methods: ['sms', 'whatsapp'],
      lang: 'tr',
      timeout: 5, // 5 minutes
    });

    console.log('✅ Session created!');
    console.log('Session ID:', session.sessionId);
    console.log('Iframe URL:', session.iframeUrl);
    console.log('Expires at:', session.expiresAt);
    console.log('Allowed methods:', session.allowedMethods);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check session status
    console.log('\nChecking session status...');
    const status = await verifly.verification.get(session.sessionId);
    
    console.log('Status:', status.status);
    console.log('Method:', status.method);
    console.log('Verification code:', status.verificationCode);
    console.log('QR code data:', status.qrCodeData);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.name === 'InsufficientBalanceError') {
      console.error('Balance data:', error.balanceData);
    }
    
    if (error.name === 'AuthenticationError') {
      console.error('Check your API key and secret key');
    }
  }
}

// Run example
if (require.main === module) {
  main();
}

module.exports = main;
