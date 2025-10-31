const Verifly = require('../src/index');

/**
 * Iframe integration example
 * 
 * This example shows how to integrate Verifly verification
 * into your application using iframe
 */

async function createVerificationIframe() {
  // Initialize client (both keys required)
  const verifly = new Verifly('your-api-key-here', {
    secretKey: 'your-secret-key-here',  // REQUIRED
  });

  try {
    // Create verification session
    const session = await verifly.verification.create({
      phone: '5551234567',
      email: 'user@example.com',
      methods: ['sms', 'whatsapp', 'email'],
      webhookUrl: 'https://mysite.com/webhook/verifly',
      redirectUrl: 'https://mysite.com/verification-complete',
      lang: 'tr',
      timeout: 10,
    });

    console.log('✅ Verification session created');
    console.log('Session ID:', session.sessionId);

    // Return HTML with iframe
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifly Doğrulama</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    .iframe-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      min-height: 500px;
    }
    iframe {
      width: 100%;
      height: 600px;
      border: 0;
    }
    .info {
      margin-top: 20px;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 8px;
      font-size: 14px;
    }
    .info strong {
      display: block;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 Kimlik Doğrulama</h1>
    
    <div class="iframe-container">
      <iframe 
        src="${session.iframeUrl}"
        allow="camera; microphone"
        sandbox="allow-scripts allow-same-origin allow-forms"
      ></iframe>
    </div>

    <div class="info">
      <strong>Session ID:</strong> ${session.sessionId}
      <strong>Expires:</strong> ${new Date(session.expiresAt).toLocaleString('tr-TR')}
      <strong>Methods:</strong> ${session.allowedMethods.join(', ')}
    </div>
  </div>

  <script>
    // Listen for verification completion
    window.addEventListener('message', (event) => {
      // Check origin (IMPORTANT for security)
      if (event.origin !== 'https://www.verifly.net') {
        return;
      }

      const data = event.data;

      if (data.type === 'verification-complete') {
        console.log('✅ Verification completed!');
        console.log('Session ID:', data.sessionId);
        console.log('Status:', data.status);

        // Redirect or update UI
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          alert('Doğrulama başarılı!');
          // Update your UI...
        }
      }
    });
  </script>
</body>
</html>
    `;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

/**
 * Express route example
 */
async function expressRoute(req, res) {
  try {
    const html = await createVerificationIframe();
    res.send(html);
  } catch (error) {
    res.status(500).send('Error creating verification session');
  }
}

/**
 * Polling example (alternative to webhook)
 */
async function pollVerificationStatus(sessionId) {
  const verifly = new Verifly('your-api-key-here', {
    secretKey: 'your-secret-key-here'  // REQUIRED
  });
  
  console.log('🔄 Polling verification status...');

  const maxAttempts = 30; // 5 minutes (10 second intervals)
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;
      
      const status = await verifly.verification.get(sessionId);
      
      console.log(`Attempt ${attempts}/${maxAttempts} - Status:`, status.status);

      if (status.status === 'verified') {
        console.log('✅ Verification successful!');
        return status;
      }

      if (status.status === 'failed' || status.status === 'expired') {
        console.log('❌ Verification failed or expired');
        return status;
      }

      if (attempts >= maxAttempts) {
        console.log('⏰ Polling timeout');
        return null;
      }

      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000));
      return poll();

    } catch (error) {
      console.error('Polling error:', error.message);
      return null;
    }
  };

  return poll();
}

// Export functions
module.exports = {
  createVerificationIframe,
  expressRoute,
  pollVerificationStatus,
};

// Run example
if (require.main === module) {
  createVerificationIframe().then(html => {
    console.log('\n=== HTML OUTPUT ===\n');
    console.log(html);
  });
}
