import { apiClient } from '@/lib/api-client';
import type { AuditLog } from '@/types/entities';
import type { PaginatedResult } from '@/types/api';

export interface QueryAuditLogsParams {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: string | number | boolean | undefined;
}

export const auditApi = {
  list: (schoolId: string, params: QueryAuditLogsParams) =>
    apiClient.get<PaginatedResult<AuditLog>>('/audit-logs', { schoolId, query: params }),
};