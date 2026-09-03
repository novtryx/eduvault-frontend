import { apiClient } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/api';
import type { Student, StudentBalance, StudentStatus } from '@/types/entities';

export interface QueryStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  status?: StudentStatus;
  [key: string]: string | number | boolean | undefined;
}

export interface CreateStudentPayload {
  fullName: string;
  admissionNumber: string;
  classId?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  dateOfAdmission?: string;
  status?: StudentStatus;
}

export interface UpdateStudentPayload {
  fullName?: string;
  admissionNumber?: string;
  classId?: string | null;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  dateOfAdmission?: string;
  status?: StudentStatus;
}

export const studentsApi = {
  list: (schoolId: string, params: QueryStudentsParams) =>
    apiClient.get<PaginatedResult<Student>>('/students', { schoolId, query: params }),

  get: (schoolId: string, studentId: string) =>
    apiClient.get<Student>(`/students/${studentId}`, { schoolId }),

  create: (schoolId: string, payload: CreateStudentPayload) =>
    apiClient.post<Student>('/students', payload, { schoolId }),

  update: (schoolId: string, studentId: string, payload: UpdateStudentPayload) =>
    apiClient.patch<Student>(`/students/${studentId}`, payload, { schoolId }),

  archive: (schoolId: string, studentId: string) =>
    apiClient.patch<Student>(`/students/${studentId}/archive`, {}, { schoolId }),

  balance: (schoolId: string, studentId: string, termId: string) =>
    apiClient.get<StudentBalance>(`/payments/students/${studentId}/balance`, {
      schoolId,
      query: { termId },
    }),
};