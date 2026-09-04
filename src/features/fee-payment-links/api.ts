import { apiClient } from '@/lib/api-client';
import type { SendPaymentLinkResult } from '@/types/entities';

export interface SendPaymentLinkPayload {
  academicSessionId: string;
  termId: string;
}

// Mirrors FeePaymentsController exactly — POST
// /schools/:schoolId/students/:studentId/payment-link, gated by
// payments:create (not a dedicated permission; emailing a parent a
// "pay online" link is conceptually the same privilege as recording a
// payment yourself). Fire-and-forget: the response is just a
// confirmation of who it was sent to, never the raw link/token itself
// — the backend only stores a hash of the token, so staff genuinely
// cannot retrieve or resend the exact link after the fact.
export const feePaymentLinksApi = {
  send: (schoolId: string, studentId: string, payload: SendPaymentLinkPayload) =>
    apiClient.post<SendPaymentLinkResult>(`/students/${studentId}/payment-link`, payload, { schoolId }),
};