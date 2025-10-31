// Type definitions for verifly-sdk
// Project: https://www.verifly.net
// Definitions by: Verifly Team

declare module 'verifly-sdk' {
  /**
   * Main Verifly SDK client
   */
  export default class Verifly {
    constructor(apiKey: string, options: VeriflyOptions);
    
    /** Verification resource */
    verification: Verification;
    
    /** Webhook utilities */
    webhook: Webhook;
    
    /** Set application secret key */
    setSecretKey(secretKey: string): void;
    
    /** Enable/disable debug mode */
    setDebug(enabled: boolean): void;
  }

  /**
   * Verifly client options
   */
  export interface VeriflyOptions {
    /** 
     * Application secret key (REQUIRED for API authentication)
     * Used to generate HMAC-SHA256 signature for every API request
     */
    secretKey: string;
    
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    
    /** Enable debug logging (default: false) */
    debug?: boolean;
  }

  /**
   * Verification resource
   */
  export class Verification {
    /** Create verification session */
    create(params: CreateVerificationParams): Promise<VerificationSession>;
    
    /** Get verification session status */
    get(sessionId: string): Promise<VerificationStatus>;
    
    /** Select verification method */
    selectMethod(sessionId: string, params: SelectMethodParams): Promise<VerificationSession>;
    
    /** Cancel verification session (temporary) */
    cancel(sessionId: string): Promise<{ success: boolean }>;
    
    /** Abort verification session (permanent) */
    abort(sessionId: string): Promise<{ success: boolean }>;
    
    /** Get account balance and recent transactions */
    getBalance(): Promise<BalanceInfo>;
  }

  /**
   * Create verification parameters
   */
  export interface CreateVerificationParams {
    /** Phone number (will be cleaned automatically) */
    phone?: string;
    
    /** Email address */
    email?: string;
    
    /** Allowed verification methods */
    methods?: VerificationMethod[];
    
    /** Language (en, tr) */
    lang?: 'en' | 'tr';
    
    /** Webhook URL for completion callback */
    webhookUrl?: string;
    
    /** Redirect URL after verification */
    redirectUrl?: string;
    
    /** Session timeout in minutes (1-15) */
    timeout?: number;
    
    /** Custom data to attach to the session (max 100KB) */
    data?: string | object;
  }

  /**
   * Verification session response
   */
  export interface VerificationSession {
    /** Session ID */
    sessionId: string;
    
    /** Iframe URL */
    iframeUrl: string;
    
    /** Expiration date */
    expiresAt: string;
    
    /** Allowed methods */
    allowedMethods: VerificationMethod[];
    
    /** Selected method (if single method) */
    method?: VerificationMethod;
    
    /** Whether user input is required */
    userInputRequired: boolean;
  }

  /**
   * Verification status
   */
  export interface VerificationStatus {
    /** Session ID */
    sessionId: string;
    
    /** Current status */
    status: 'pending' | 'waiting' | 'method_selected' | 'verified' | 'failed' | 'expired';
    
    /** Selected method */
    method?: VerificationMethod;
    
    /** Allowed methods */
    allowedMethods: VerificationMethod[];
    
    /** Whether user input is required */
    userInputRequired: boolean;
    
    /** Recipient contact */
    recipientContact?: string;
    
    /** Recipient phone */
    recipientPhone?: string;
    
    /** Recipient email */
    recipientEmail?: string;
    
    /** Selected service contact */
    selectedServiceContact?: string;
    
    /** Verification code */
    verificationCode?: string;
    
    /** QR code data */
    qrCodeData?: string;
    
    /** Expiration date */
    expiresAt: string;
    
    /** Verification date (if verified) */
    verifiedAt?: string;
    
    /** Language */
    lang: string;
    
    /** Redirect URL */
    redirectUrl?: string;
    
    /** Webhook URL */
    webhookUrl?: string;
  }

  /**
   * Select method parameters
   */
  export interface SelectMethodParams {
    /** Selected method */
    method: VerificationMethod;
    
    /** Recipient contact (if not provided in create) */
    recipientContact?: string;
  }

  /**
   * Verification method
   */
  export type VerificationMethod = 'sms' | 'whatsapp' | 'call' | 'email';

  /**
   * Webhook utilities
   * 
   * ⚠️ IMPORTANT: All webhook methods require secretKey to be set during initialization:
   * ```typescript
   * const verifly = new Verifly('api-key', {
   *   secretKey: 'your-secret-key'  // Required for webhook features
   * });
   * ```
   */
  export class Webhook {
    /** 
     * Verify webhook signature
     * @requires secretKey must be set in Verifly constructor
     */
    verify(payload: any, signature: string): boolean;
    
    /** 
     * Generate webhook signature (for testing)
     * @requires secretKey must be set in Verifly constructor
     */
    generateSignature(payload: any): string;
    
    /** 
     * Construct webhook event
     * @requires secretKey must be set in Verifly constructor
     * @throws Error if secretKey is not set or signature is invalid
     */
    constructEvent(payload: any, signature: string): WebhookEvent;
    
    /** Create response helper */
    response(res: any): WebhookResponse;
  }

  /**
   * Webhook event
   */
  export interface WebhookEvent {
    /** Event ID */
    id: string;
    
    /** Event type */
    type: WebhookEventType;
    
    /** Event data */
    data: any;
    
    /** Timestamp */
    timestamp: string;
  }

  /**
   * Webhook event type
   */
  export type WebhookEventType = 
    | 'verification.success'
    | 'verification.failed'
    | 'verification.expired'
    | 'verification.cancelled'
    | 'verification.unknown';

  /**
   * Webhook response helper
   */
  export interface WebhookResponse {
    /** Send success response */
    success(message?: string): void;
    
    /** Send error response */
    error(message?: string, status?: number): void;
    
    /** Send unauthorized response */
    unauthorized(message?: string): void;
  }

  /**
   * Balance information
   */
  export interface BalanceInfo {
    /** Current balance */
    balance: number;
    
    /** Currency code */
    currency: string;
    
    /** User ID */
    userId: string;
    
    /** User email */
    email: string;
    
    /** Recent transactions */
    recentTransactions: Transaction[];
  }

  /**
   * Transaction
   */
  export interface Transaction {
    /** Transaction type */
    type: string;
    
    /** Amount */
    amount: number;
    
    /** Description */
    description: string;
    
    /** Created at */
    createdAt: string;
  }

  /**
   * Custom errors
   */
  export namespace errors {
    export class VeriflyError extends Error {
      statusCode: number | null;
      response: any;
    }

    export class AuthenticationError extends VeriflyError {}
    export class ValidationError extends VeriflyError {}
    export class InsufficientBalanceError extends VeriflyError {
      balanceData: any;
    }
    export class NotFoundError extends VeriflyError {}
    export class RateLimitError extends VeriflyError {}
    export class ServerError extends VeriflyError {}
  }
}
