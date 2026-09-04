'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentSettingsApi, type SaveBankAccountPayload } from './api';

export function usePaymentSettings(schoolId: string | null) {
  return useQuery({
    queryKey: ['payment-settings', schoolId],
    queryFn: () => paymentSettingsApi.get(schoolId as string),
    enabled: Boolean(schoolId),
  });
}

export function useBanks(schoolId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['payment-settings-banks', schoolId],
    queryFn: () => paymentSettingsApi.listBanks(schoolId as string),
    enabled: Boolean(schoolId) && enabled,
    // Bank list is effectively static within a session.
    staleTime: 10 * 60 * 1000,
  });
}

export function useSaveBankAccount(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveBankAccountPayload) => paymentSettingsApi.saveBankAccount(schoolId as string, payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(['payment-settings', schoolId], settings);
    },
  });
}