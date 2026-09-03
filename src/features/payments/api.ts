import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/api';
import type { Payment, PaymentMethod, PaymentStatus } from '@/types/entities';

export interface QueryPaymentsParams {
  page?: number;
  limit?: number;
  studentId?: string;
  classId?: string;
  termId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  // Lets this be passed straight into apiClient's `query` option, which
  // is typed with a string index signature (arbitrary future filters
  // pass through without every params interface needing its own cast).
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePaymentPayload {
  studentId: string;
  academicSessionId: string;
  termId: string;
  amountKobo: number;
  method: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface ReversePaymentPayload {
  reason: string;
}

export const paymentsApi = {
  list: (schoolId: string, params: QueryPaymentsParams) =>
    apiClient.get<PaginatedResult<Payment>>('/payments', { schoolId, query: params }),

  get: (schoolId: string, paymentId: string) =>
    apiClient.get<Payment>(`/payments/${paymentId}`, { schoolId }),

  create: (schoolId: string, payload: CreatePaymentPayload) =>
    apiClient.post<Payment>('/payments', payload, { schoolId }),

  reverse: (schoolId: string, paymentId: string, payload: ReversePaymentPayload) =>
    apiClient.patch<Payment>(`/payments/${paymentId}/reverse`, payload, { schoolId }),
};

export const receiptsApi = {
  // ReceiptsController — see receipts.controller.ts. There is currently no
  // PDF file to download (pdfUrl is always null on the backend), so the
  // frontend renders a print-friendly receipt view client-side instead of
  // fetching a generated file. getForPayment fetches the receipt record
  // (receiptNumber etc.) to display alongside the payment.
  getForPayment: (schoolId: string, paymentId: string) =>
    apiClient.get<import('@/types/entities').Receipt>(`/receipts/by-payment/${paymentId}`, { schoolId }),
};