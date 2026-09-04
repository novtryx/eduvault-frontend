import { apiClient } from '@/lib/api-client';
import type { FeeStructure } from '@/types/entities';

export interface FeeComponentInput {
  label: string;
  amountKobo: number;
}

// Exactly one of amountKobo / components — never both, never neither.
// See FeesService.resolveAmountKobo on the backend; enforced client-side
// too via feeStructureSchema's mode-based superRefine, but the backend
// is the actual source of truth for this rule.
export interface CreateFeeStructurePayload {
  academicSessionId: string;
  termId: string;
  classId: string;
  amountKobo?: number;
  components?: FeeComponentInput[];
}

export interface UpdateFeeStructurePayload {
  amountKobo?: number;
  // Replaces the whole breakdown, not a partial patch of individual
  // line items — see UpdateFeeStructureDto's comment on why.
  components?: FeeComponentInput[];
}

export const feesApi = {
  // termId is required by the backend — see fees.controller.ts.
  listForTerm: (schoolId: string, termId: string) =>
    apiClient.get<FeeStructure[]>('/fee-structures', { schoolId, query: { termId } }),

  get: (schoolId: string, feeStructureId: string) =>
    apiClient.get<FeeStructure>(`/fee-structures/${feeStructureId}`, { schoolId }),

  create: (schoolId: string, payload: CreateFeeStructurePayload) =>
    apiClient.post<FeeStructure>('/fee-structures', payload, { schoolId }),

  // The session/term/class a fee applies to can't change on an existing
  // record — see UpdateFeeStructureDto's comment; to reassign, delete
  // and create a new one instead.
  update: (schoolId: string, feeStructureId: string, payload: UpdateFeeStructurePayload) =>
    apiClient.patch<FeeStructure>(`/fee-structures/${feeStructureId}`, payload, { schoolId }),

  remove: (schoolId: string, feeStructureId: string) =>
    apiClient.delete<null>(`/fee-structures/${feeStructureId}`, { schoolId }),
};