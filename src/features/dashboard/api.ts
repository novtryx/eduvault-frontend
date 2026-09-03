import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/api';
import type { CollectionOverview, DashboardSummary, OutstandingRow, Payment } from '@/types/entities';

export const dashboardApi = {
  summary: (schoolId: string, termId?: string) =>
    apiClient.get<DashboardSummary>('/dashboard/summary', { schoolId, query: { termId } }),

  collectionOverview: (schoolId: string, termId?: string) =>
    apiClient.get<CollectionOverview>('/dashboard/collection-overview', { schoolId, query: { termId } }),

  recentPayments: (schoolId: string, limit = 5) =>
    apiClient.get<Payment[]>('/dashboard/recent-payments', { schoolId, query: { limit } }),

  outstandingFees: (
    schoolId: string,
    params: { termId: string; page?: number; limit?: number; classId?: string; minBalanceKobo?: number },
  ) => apiClient.get<PaginatedResult<OutstandingRow>>('/dashboard/outstanding-fees', { schoolId, query: params }),
};
