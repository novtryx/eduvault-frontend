'use client';

import { useQuery } from '@tanstack/react-query';
import { auditApi, type QueryAuditLogsParams } from './api';

export function useAuditLogs(schoolId: string | null, params: QueryAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', schoolId, params],
    queryFn: () => auditApi.list(schoolId as string, params),
    enabled: Boolean(schoolId),
    placeholderData: (prev) => prev,
  });
}