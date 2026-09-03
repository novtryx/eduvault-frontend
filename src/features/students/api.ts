import { apiClient, downloadBlob } from '@/lib/api-client';
import type { PaginatedResult } from '@/types/api';
import type { BulkImportResult, Student, StudentBalance, StudentStatus } from '@/types/entities';

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

  // Downloads the backend's own CSV template (correct headers/example
  // row) rather than the frontend generating one, so it can never drift
  // from what StudentFileParser actually accepts.
  downloadImportTemplate: async (schoolId: string) => {
    const { blob, filename } = await apiClient.blob('/students/bulk-import/template', { schoolId });
    downloadBlob(blob, filename || 'student-import-template.csv');
  },

  // Multipart upload — classId + file. Every imported row is assigned
  // to this one class (see BulkImportStudentsDto); a file with students
  // for different classes needs one upload per class.
  bulkImport: (schoolId: string, classId: string, file: File) => {
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('file', file);
    return apiClient.post<BulkImportResult>('/students/bulk-import', formData, { schoolId });
  },
};