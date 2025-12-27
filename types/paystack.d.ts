// types/paystack.d.ts
declare module '@paystack/inline-js' {
  class PaystackPop {
    newTransaction(options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      firstname?: string;
      lastname?: string;
      metadata?: Record<string, any>;
      onSuccess?: (transaction: { reference: string }) => void;
      onCancel?: () => void;
    }): void;
  }
  const PaystackPop: new () => PaystackPop;
  export default PaystackPop;
}