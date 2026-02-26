// types/react-paystack.d.ts
declare module 'react-paystack' {
  import { ComponentType } from 'react';

  export interface PaystackProps {
    reference: string;
    email: string;
    amount: number;
    publicKey: string;
    metadata?: Record<string, any>;
    recurring?: boolean;
    interval?: 'monthly' | 'yearly';
    onSuccess?: (response: any) => void;
    onClose?: () => void;
    text?: string;
    className?: string;
    disabled?: boolean;
  }

  export const PaystackButton: ComponentType<PaystackProps>;
}