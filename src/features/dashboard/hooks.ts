'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';

export function useDashboardSummary(schoolId: string | null, termId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'summary', schoolId, termId],
    queryFn: () => dashboardApi.summary(schoolId as string, termId),
    enabled: Boolean(schoolId),
  });
}

export function useCollectionOverview(schoolId: string | null, termId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'collection-overview', schoolId, termId],
    queryFn: () => dashboardApi.collectionOverview(schoolId as string, termId),
    enabled: Boolean(schoolId),
  });
}

export function useRecentPayments(schoolId: string | null, limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-payments', schoolId, limit],
    queryFn: () => dashboardApi.recentPayments(schoolId as string, limit),
    enabled: Boolean(schoolId),
  });
}

export function useDashboardOutstanding(
  schoolId: string | null,
  termId: string | undefined,
  opts?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['dashboard', 'outstanding', schoolId, termId, opts?.page, opts?.limit],
    queryFn: () =>
      dashboardApi.outstandingFees(schoolId as string, {
        termId: termId as string,
        page: opts?.page ?? 1,
        limit: opts?.limit ?? 5,
      }),
    enabled: Boolean(schoolId && termId),
  });
}
