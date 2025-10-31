/**
 * Verification resource for managing verification sessions
 */
class Verification {
  constructor(requestHandler) {
    this.request = requestHandler;
  }

  /**
   * Create a new verification session
   * 
   * @param {Object} params - Verification parameters
   * @param {string} [params.phone] - Phone number (cleaned automatically)
   * @param {string} [params.email] - Email address
   * @param {string[]} [params.methods] - Allowed methods (sms, whatsapp, call, email)
   * @param {string} [params.lang='en'] - Language (en, tr)
   * @param {string} [params.webhookUrl] - Webhook URL for completion callback
   * @param {string} [params.redirectUrl] - Redirect URL after verification
   * @param {number} [params.timeout=2] - Session timeout in minutes (1-15)
   * @param {string|Object} [params.data] - Custom data to attach to the session (max 100KB)
   * @returns {Promise<Object>} Verification session data
   * 
   * @example
   * const session = await verifly.verification.create({
   *   phone: '5551234567',
   *   methods: ['sms', 'whatsapp'],
   *   webhookUrl: 'https://mysite.com/webhook',
   *   lang: 'tr',
   *   data: { userId: '12345', orderId: 'ORD-789' }
   * });
   * console.log(session.iframeUrl); // Show in iframe
   */
  async create(params) {
    const response = await this.request.post('/api/verify/create', params);
    return response.data;
  }

  /**
   * Get verification session status
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session status
   * 
   * @example
   * const status = await verifly.verification.get('session-id');
   * console.log(status.status); // 'pending', 'waiting', 'verified', 'failed', 'expired'
   */
  async get(sessionId) {
    const response = await this.request.get(`/api/verify/${sessionId}`);
    return response.data;
  }

  /**
   * Select verification method (if multiple methods available)
   * 
   * @param {string} sessionId - Session ID
   * @param {Object} params - Method selection parameters
   * @param {string} params.method - Selected method (sms, whatsapp, call, email)
   * @param {string} [params.recipientContact] - Contact info (if not provided in create)
   * @returns {Promise<Object>} Updated session data
   * 
   * @example
   * await verifly.verification.selectMethod('session-id', {
   *   method: 'sms',
   *   recipientContact: '5551234567'
   * });
   */
  async selectMethod(sessionId, params) {
    const response = await this.request.post(`/api/verify/${sessionId}/select-method`, params);
    return response.data;
  }

  /**
   * Cancel verification session (temporary, user can retry)
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Cancellation result
   * 
   * @example
   * await verifly.verification.cancel('session-id');
   */
  async cancel(sessionId) {
    const response = await this.request.post(`/api/verify/${sessionId}/cancel`);
    return response.data;
  }

  /**
   * Abort verification session (permanent, cannot be retried)
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Abort result
   * 
   * @example
   * await verifly.verification.abort('session-id');
   */
  async abort(sessionId) {
    const response = await this.request.post(`/api/verify/${sessionId}/abort`);
    return response.data;
  }

  /**
   * Get account balance and recent transactions
   * 
   * @returns {Promise<Object>} Balance and transactions
   * 
   * @example
   * const balance = await verifly.verification.getBalance();
   * console.log('Balance:', balance.balance);
   * console.log('Recent:', balance.recentTransactions);
   */
  async getBalance() {
    const response = await this.request.get('/api/verify/balance');
    return response.data;
  }
}

module.exports = Verification;
