'use client';

import { useMutation } from '@tanstack/react-query';
import { feeRemindersApi, type SendBulkFeeRemindersPayload } from './api';

export function useSendBulkFeeReminders(schoolId: string | null) {
  return useMutation({
    mutationFn: (payload: SendBulkFeeRemindersPayload) => feeRemindersApi.send(schoolId as string, payload),
  });
}