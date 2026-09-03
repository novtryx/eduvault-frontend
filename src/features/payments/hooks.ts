'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, receiptsApi, type CreatePaymentPayload, type QueryPaymentsParams, type ReversePaymentPayload } from './api';

export function usePayments(schoolId: string | null, params: QueryPaymentsParams) {
  return useQuery({
    queryKey: ['payments', schoolId, params],
    queryFn: () => paymentsApi.list(schoolId as string, params),
    enabled: Boolean(schoolId),
    placeholderData: (prev) => prev,
  });
}

export function usePayment(schoolId: string | null, paymentId: string | null) {
  return useQuery({
    queryKey: ['payments', schoolId, 'detail', paymentId],
    queryFn: () => paymentsApi.get(schoolId as string, paymentId as string),
    enabled: Boolean(schoolId && paymentId),
  });
}

export function useReceiptForPayment(schoolId: string | null, paymentId: string | null) {
  return useQuery({
    queryKey: ['receipts', schoolId, 'by-payment', paymentId],
    queryFn: () => receiptsApi.getForPayment(schoolId as string, paymentId as string),
    enabled: Boolean(schoolId && paymentId),
    retry: false,
  });
}

function invalidateFinancials(queryClient: ReturnType<typeof useQueryClient>, schoolId: string | null) {
  queryClient.invalidateQueries({ queryKey: ['payments', schoolId] });
  queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary', schoolId] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'collection-overview', schoolId] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'outstanding', schoolId] });
  queryClient.invalidateQueries({ queryKey: ['reports', schoolId] });
}

export function useCreatePayment(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.create(schoolId as string, payload),
    onSuccess: () => invalidateFinancials(queryClient, schoolId),
  });
}

export function useReversePayment(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: string; payload: ReversePaymentPayload }) =>
      paymentsApi.reverse(schoolId as string, paymentId, payload),
    onSuccess: () => invalidateFinancials(queryClient, schoolId),
  });
}