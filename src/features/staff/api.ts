import { apiClient } from '@/lib/api-client';
import type { StaffMember } from '@/types/entities';

export interface InviteStaffPayload {
  email: string;
  fullName: string;
  roleId: string;
}

export interface UpdateStaffRolePayload {
  roleId: string;
}

export const staffApi = {
  list: (schoolId: string) => apiClient.get<StaffMember[]>('/staff', { schoolId }),

  invite: (schoolId: string, payload: InviteStaffPayload) =>
    apiClient.post<{ inviteId: string }>('/staff/invite', payload, { schoolId }),

  updateRole: (schoolId: string, userId: string, payload: UpdateStaffRolePayload) =>
    apiClient.patch<StaffMember>(`/staff/${userId}/role`, payload, { schoolId }),

  remove: (schoolId: string, userId: string) =>
    apiClient.delete<null>(`/staff/${userId}`, { schoolId }),
};