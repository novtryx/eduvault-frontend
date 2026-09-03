import { apiClient } from '@/lib/api-client';
import type { AcademicSession, School } from '@/types/entities';

export interface UpdateSchoolPayload {
  name?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  receiptPrefix?: string;
  receiptFooter?: string;
  receiptSignature?: string;
}

export interface CreateAcademicSessionPayload {
  name: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateTermPayload {
  name: string;
  startDate?: string;
  endDate?: string;
}

// SchoolsController is @Controller('schools') with routes like
// GET/PATCH ':schoolId' and ':schoolId/academic-sessions' — i.e. the
// schoolId itself is the first path segment after /schools, not a
// separate prefix. apiClient's `schoolId` option always prepends
// `/schools/${schoolId}` to whatever path is passed, so for this module
// specifically we pass the *sub-path* (possibly empty) and let that do
// the work, matching every other feature module's convention.
export const schoolApi = {
  get: (schoolId: string) => apiClient.get<School>('', { schoolId }),

  update: (schoolId: string, payload: UpdateSchoolPayload) =>
    apiClient.patch<School>('', payload, { schoolId }),

  listAcademicSessions: (schoolId: string) =>
    apiClient.get<AcademicSession[]>('/academic-sessions', { schoolId }),

  createAcademicSession: (schoolId: string, payload: CreateAcademicSessionPayload) =>
    apiClient.post<AcademicSession>('/academic-sessions', payload, { schoolId }),

  createTerm: (schoolId: string, sessionId: string, payload: CreateTermPayload) =>
    apiClient.post<AcademicSession>(`/academic-sessions/${sessionId}/terms`, payload, { schoolId }),

  setCurrentSession: (schoolId: string, sessionId: string) =>
    apiClient.patch<AcademicSession>(`/academic-sessions/${sessionId}/set-current`, {}, { schoolId }),

  setCurrentTerm: (schoolId: string, termId: string) =>
    apiClient.patch<School>(`/terms/${termId}/set-current`, {}, { schoolId }),
};
