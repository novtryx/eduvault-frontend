import { apiClient, downloadBlob } from '@/lib/api-client';
import type { CollectionSummaryReport, OutstandingRow, Payment } from '@/types/entities';

export interface QueryOutstandingReportParams {
  termId: string;
  classId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface QueryPaymentHistoryReportParams {
  studentId?: string;
  classId?: string;
  termId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: string | number | boolean | undefined;
}

export const reportsApi = {
  collectionSummary: (schoolId: string, termId?: string) =>
    apiClient.get<CollectionSummaryReport>('/reports/collection-summary', { schoolId, query: { termId } }),

  // These two are NOT paginated on the backend — reports.service.ts
  // returns a plain array capped at MAX_REPORT_ROWS, throwing a 400 if
  // the unfiltered result would exceed it (the interactive list pages
  // for the same data — Outstanding, Payments — ARE paginated; this is
  // specifically the "give me everything, e.g. to review or export"
  // report endpoint).
  outstanding: (schoolId: string, params: QueryOutstandingReportParams) =>
    apiClient.get<OutstandingRow[]>('/reports/outstanding', { schoolId, query: params }),

  paymentHistory: (schoolId: string, params: QueryPaymentHistoryReportParams) =>
    apiClient.get<Payment[]>('/reports/payment-history', { schoolId, query: params }),
};

async function exportReport(
  schoolId: string,
  path: string,
  params: Record<string, string | number | boolean | undefined>,
  fallbackFilename: string,
) {
  const { blob, filename } = await apiClient.blob(path, { schoolId, query: params });
  downloadBlob(blob, filename || fallbackFilename);
}

export const reportsExportApi = {
  collectionSummary: (schoolId: string, termId: string) =>
    exportReport(schoolId, '/reports/collection-summary/export', { termId }, 'collection-summary.xlsx'),

  outstanding: (schoolId: string, params: QueryOutstandingReportParams) =>
    exportReport(schoolId, '/reports/outstanding/export', params, 'outstanding-fees.xlsx'),

  paymentHistory: (schoolId: string, params: QueryPaymentHistoryReportParams) =>
    exportReport(schoolId, '/reports/payment-history/export', params, 'payment-history.xlsx'),
};