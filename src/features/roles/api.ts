import { apiClient } from '@/lib/api-client';
import type { Permission, Role } from '@/types/entities';

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionKeys: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionKeys?: string[];
}

// NOTE: as shipped, the backend's RolesModule is not yet registered in
// app.module.ts, so these calls will 404 until that's wired up. The
// frontend is written against the documented route/DTO shape regardless
// — see roles.controller.ts / roles/dto on the backend.
export const rolesApi = {
  list: (schoolId: string) => apiClient.get<Role[]>('/roles', { schoolId }),
  get: (schoolId: string, roleId: string) => apiClient.get<Role>(`/roles/${roleId}`, { schoolId }),
  create: (schoolId: string, payload: CreateRolePayload) =>
    apiClient.post<Role>('/roles', payload, { schoolId }),
  update: (schoolId: string, roleId: string, payload: UpdateRolePayload) =>
    apiClient.patch<Role>(`/roles/${roleId}`, payload, { schoolId }),
  remove: (schoolId: string, roleId: string) =>
    apiClient.delete<null>(`/roles/${roleId}`, { schoolId }),
};

export interface PermissionCatalogEntry extends Permission {}
