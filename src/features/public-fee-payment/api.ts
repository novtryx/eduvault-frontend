import { apiClient } from '@/lib/api-client';
import type { PublicFeeInvoice, Payment } from '@/types/entities';

// Mirrors PublicFeePaymentsController exactly — everything here is
// @Public() on the backend: no schoolId, no cookies required. The
// raw token from the parent's email link IS the authorization (see
// FeePaymentLink.tokenHash's comment on why only its hash is stored).
export const publicFeePaymentApi = {
  getInvoice: (token: string) => apiClient.get<PublicFeeInvoice>(`/public/fee-payments/${token}`),

  initialize: (token: string) =>
    apiClient.post<{ authorizationUrl: string }>(`/public/fee-payments/${token}/initialize`),

  // Called from the /pay/[token]/callback page after Paystack redirects
  // back — reference alone resolves to the right FeePaymentLink via the
  // transaction's metadata, so this isn't itself token-scoped in the path
  // (mirrors BillingCallbackController's shape).
  verifyCallback: (reference: string) =>
    apiClient.get<Payment>('/public/fee-payments/callback', { query: { reference } }),
};