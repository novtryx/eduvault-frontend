'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, type QueryOutstandingReportParams, type QueryPaymentHistoryReportParams } from './api';

export function useCollectionSummary(schoolId: string | null, termId?: string) {
  return useQuery({
    queryKey: ['reports', schoolId, 'collection-summary', termId],
    queryFn: () => reportsApi.collectionSummary(schoolId as string, termId),
    enabled: Boolean(schoolId),
  });
}

export function useOutstandingReport(schoolId: string | null, params: QueryOutstandingReportParams) {
  return useQuery({
    queryKey: ['reports', schoolId, 'outstanding', params],
    queryFn: () => reportsApi.outstanding(schoolId as string, params),
    enabled: Boolean(schoolId && params.termId),
  });
}

export function usePaymentHistoryReport(schoolId: string | null, params: QueryPaymentHistoryReportParams) {
  return useQuery({
    queryKey: ['reports', schoolId, 'payment-history', params],
    queryFn: () => reportsApi.paymentHistory(schoolId as string, params),
    enabled: Boolean(schoolId),
  });
}