'use client';

import { useMutation } from '@tanstack/react-query';
import { feePaymentLinksApi, type SendPaymentLinkPayload } from './api';

export function useSendPaymentLink(schoolId: string | null, studentId: string) {
  return useMutation({
    mutationFn: (payload: SendPaymentLinkPayload) => feePaymentLinksApi.send(schoolId as string, studentId, payload),
  });
}