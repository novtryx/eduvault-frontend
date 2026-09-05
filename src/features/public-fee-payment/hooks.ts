'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { publicFeePaymentApi } from './api';

export function usePublicFeeInvoice(token: string) {
  return useQuery({
    queryKey: ['public-fee-invoice', token],
    queryFn: () => publicFeePaymentApi.getInvoice(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useInitializeFeePayment(token: string) {
  return useMutation({
    mutationFn: () => publicFeePaymentApi.initialize(token),
  });
}

export function useVerifyFeePaymentCallback(reference: string | null) {
  return useQuery({
    queryKey: ['public-fee-payment-callback', reference],
    queryFn: () => publicFeePaymentApi.verifyCallback(reference as string),
    enabled: Boolean(reference),
    retry: false,
  });
}