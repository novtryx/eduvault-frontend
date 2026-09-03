'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingApi, subscriptionApi } from './api';

export function useSubscription(schoolId: string | null) {
  return useQuery({
    queryKey: ['subscription', schoolId],
    queryFn: () => subscriptionApi.getCurrent(schoolId as string),
    enabled: Boolean(schoolId),
  });
}

export function useInitializeSubscription(schoolId: string | null) {
  return useMutation({
    mutationFn: (planId: string) => subscriptionApi.initialize(schoolId as string, planId),
  });
}

export function useVerifyBillingCallback(reference: string | null, schoolId: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['billing-callback', reference],
    queryFn: async () => {
      const subscription = await billingApi.verifyCallback(reference as string);
      queryClient.setQueryData(['subscription', schoolId], subscription);
      return subscription;
    },
    enabled: Boolean(reference),
    retry: false,
  });
}