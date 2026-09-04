import { apiClient } from '@/lib/api-client';
import type { PaymentSettings, PaystackBank } from '@/types/entities';

export interface SaveBankAccountPayload {
  bankCode: string;
  accountNumber: string;
}

// Mirrors SchoolsController's "Payment settings (Paystack subaccount
// for parent fee payments)" section exactly — see schools.controller.ts.
export const paymentSettingsApi = {
  get: (schoolId: string) => apiClient.get<PaymentSettings>('/payment-settings', { schoolId }),

  listBanks: (schoolId: string) => apiClient.get<PaystackBank[]>('/payment-settings/banks', { schoolId }),

  // Resolves the account number with Paystack (confirming it's real,
  // returning the account holder's name) and creates a Paystack
  // Subaccount server-side — this single call both verifies AND
  // completes setup, there's no separate "preview" step.
  saveBankAccount: (schoolId: string, payload: SaveBankAccountPayload) =>
    apiClient.post<PaymentSettings>('/payment-settings/bank-account', payload, { schoolId }),
};