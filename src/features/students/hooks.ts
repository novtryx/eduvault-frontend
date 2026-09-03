'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi, type CreateStudentPayload, type QueryStudentsParams, type UpdateStudentPayload } from './api';

export function useStudents(schoolId: string | null, params: QueryStudentsParams) {
  return useQuery({
    queryKey: ['students', schoolId, params],
    queryFn: () => studentsApi.list(schoolId as string, params),
    enabled: Boolean(schoolId),
    placeholderData: (prev) => prev,
  });
}

export function useStudent(schoolId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: ['students', schoolId, 'detail', studentId],
    queryFn: () => studentsApi.get(schoolId as string, studentId as string),
    enabled: Boolean(schoolId && studentId),
  });
}

export function useStudentBalance(schoolId: string | null, studentId: string | null, termId?: string) {
  return useQuery({
    queryKey: ['students', schoolId, 'balance', studentId, termId],
    queryFn: () => studentsApi.balance(schoolId as string, studentId as string, termId as string),
    enabled: Boolean(schoolId && studentId && termId),
  });
}

export function useCreateStudent(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => studentsApi.create(schoolId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['classes', schoolId] });
    },
  });
}

export function useUpdateStudent(schoolId: string | null, studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStudentPayload) => studentsApi.update(schoolId as string, studentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['classes', schoolId] });
    },
  });
}

export function useArchiveStudent(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => studentsApi.archive(schoolId as string, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['classes', schoolId] });
    },
  });
}
export function useDownloadImportTemplate(schoolId: string | null) {
  return useMutation({
    mutationFn: () => studentsApi.downloadImportTemplate(schoolId as string),
  });
}

export function useBulkImportStudents(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, file }: { classId: string; file: File }) =>
      studentsApi.bulkImport(schoolId as string, classId, file),
    onSuccess: () => {
      // Even partial success means new students/balances now exist.
      queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
      queryClient.invalidateQueries({ queryKey: ['classes', schoolId] });
    },
  });
}