import { apiClient } from '@/lib/api-client';
import type { SchoolClass } from '@/types/entities';

export interface CreateClassPayload {
  name: string;
  order?: number;
}

export interface UpdateClassPayload {
  name?: string;
  order?: number;
}

export const classesApi = {
  list: (schoolId: string) => apiClient.get<SchoolClass[]>('/classes', { schoolId }),
  get: (schoolId: string, classId: string) => apiClient.get<SchoolClass>(`/classes/${classId}`, { schoolId }),
  create: (schoolId: string, payload: CreateClassPayload) =>
    apiClient.post<SchoolClass>('/classes', payload, { schoolId }),
  update: (schoolId: string, classId: string, payload: UpdateClassPayload) =>
    apiClient.patch<SchoolClass>(`/classes/${classId}`, payload, { schoolId }),
  remove: (schoolId: string, classId: string) =>
    apiClient.delete<null>(`/classes/${classId}`, { schoolId }),
};