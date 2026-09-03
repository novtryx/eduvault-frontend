import { apiClient } from '@/lib/api-client';
import type { FeeStructure } from '@/types/entities';

export interface CreateFeeStructurePayload {
  academicSessionId: string;
  termId: string;
  classId: string;
  amountKobo: number;
}

export interface UpdateFeeStructurePayload {
  amountKobo: number;
}

export const feesApi = {
  // termId is required by the backend — see fees.controller.ts.
  listForTerm: (schoolId: string, termId: string) =>
    apiClient.get<FeeStructure[]>('/fee-structures', { schoolId, query: { termId } }),

  get: (schoolId: string, feeStructureId: string) =>
    apiClient.get<FeeStructure>(`/fee-structures/${feeStructureId}`, { schoolId }),

  create: (schoolId: string, payload: CreateFeeStructurePayload) =>
    apiClient.post<FeeStructure>('/fee-structures', payload, { schoolId }),

  // Only amountKobo is editable — see update-fee-structure.dto.ts. The
  // session/term/class a fee applies to can't change on an existing
  // record; to reassign, delete and create a new one instead.
  update: (schoolId: string, feeStructureId: string, payload: UpdateFeeStructurePayload) =>
    apiClient.patch<FeeStructure>(`/fee-structures/${feeStructureId}`, payload, { schoolId }),

  remove: (schoolId: string, feeStructureId: string) =>
    apiClient.delete<null>(`/fee-structures/${feeStructureId}`, { schoolId }),
};