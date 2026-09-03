'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feesApi, type CreateFeeStructurePayload, type UpdateFeeStructurePayload } from './api';

export function useFeeStructures(schoolId: string | null, termId: string | undefined) {
  return useQuery({
    queryKey: ['fee-structures', schoolId, termId],
    queryFn: () => feesApi.listForTerm(schoolId as string, termId as string),
    enabled: Boolean(schoolId && termId),
  });
}

export function useCreateFeeStructure(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFeeStructurePayload) => feesApi.create(schoolId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] }); // balances depend on fee structures
      queryClient.invalidateQueries({ queryKey: ['dashboard', schoolId] });
    },
  });
}

export function useUpdateFeeStructure(schoolId: string | null, feeStructureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFeeStructurePayload) =>
      feesApi.update(schoolId as string, feeStructureId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', schoolId] });
    },
  });
}

export function useDeleteFeeStructure(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feeStructureId: string) => feesApi.remove(schoolId as string, feeStructureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', schoolId] });
    },
  });
}