'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classesApi, type CreateClassPayload, type UpdateClassPayload } from './api';

export function useClasses(schoolId: string | null) {
  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => classesApi.list(schoolId as string),
    enabled: Boolean(schoolId),
  });
}

export function useCreateClass(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classesApi.create(schoolId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes', schoolId] }),
  });
}

export function useUpdateClass(schoolId: string | null, classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClassPayload) => classesApi.update(schoolId as string, classId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes', schoolId] }),
  });
}

export function useDeleteClass(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => classesApi.remove(schoolId as string, classId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes', schoolId] }),
  });
}