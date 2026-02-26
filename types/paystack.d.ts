// types/paystack.d.ts
/**
 * Type declaration for @paystack/inline-js
 * Provides typings for the PaystackPop class used for inline payments.
 */

declare module '@paystack/inline-js' {
  /**
   * PaystackPop instance for initiating transactions
   */
  class PaystackPop {
    /**
     * Starts a new Paystack transaction popup
     * @param options - Configuration for the transaction
     */
    newTransaction(options: PaystackTransactionOptions): void;
  }

  /**
   * Options for starting a Paystack transaction
   */
  interface PaystackTransactionOptions {
    /** Your Paystack public key (pk_test_ or pk_live_) */
    key: string;

    /** Customer's email address */
    email: string;

    /** Amount in smallest currency unit (kobo for NGN) */
    amount: number;

    /** Currency code (default: NGN) */
    currency?: string;

    /** Customer's first name (optional) */
    firstname?: string;

    /** Customer's last name (optional) */
    lastname?: string;

    /** Reference for the transaction (optional - auto-generated if omitted) */
    ref?: string;

    /** Metadata to attach to the transaction */
    metadata?: Record<string, any>;

    /** Channels to allow (optional: card, bank, ussd, qr, mobile_money, bank_transfer) */
    channels?: string[];

    /** Split payment configuration (optional) */
    split?: {
      type: 'percentage' | 'flat';
      key: string;
    };

    /** Called when payment is successful */
    onSuccess?: (response: { reference: string; trans: string; status: string }) => void;

    /** Called when user cancels or closes popup */
    onCancel?: () => void;

    /** Called when transaction fails */
    onError?: (error: any) => void;
  }

  // Default export is the PaystackPop class constructor
  const PaystackPop: new () => PaystackPop;

  export = PaystackPop;
}