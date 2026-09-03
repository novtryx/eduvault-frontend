'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi, type CreateRolePayload, type UpdateRolePayload } from './api';

export function useRoles(schoolId: string | null) {
  return useQuery({
    queryKey: ['roles', schoolId, 'list'],
    queryFn: () => rolesApi.list(schoolId as string),
    enabled: Boolean(schoolId),
  });
}

export function useRole(schoolId: string | null, roleId: string | null) {
  return useQuery({
    queryKey: ['roles', schoolId, 'detail', roleId],
    queryFn: () => rolesApi.get(schoolId as string, roleId as string),
    enabled: Boolean(schoolId && roleId),
  });
}

/**
 * There is no GET /permissions catalog endpoint on the backend — the
 * permission list only exists seeded directly into the database (see
 * database/seeds/seed-permissions-and-plans.ts) with no API to read it
 * back. Rather than hardcode a duplicate list on the frontend (which
 * would silently drift out of sync if the seed ever changes), we derive
 * the full catalog from the Owner role's permissions: the backend
 * guarantees every school's Owner role always holds every permission
 * (seeded that way at registration, and protected from ever losing
 * permissions — see roles.service.ts). This needs `roles:view`, which
 * every role that can reach this page already has by definition.
 */
export function usePermissionCatalog(schoolId: string | null) {
  const rolesQuery = useRoles(schoolId);
  const ownerRole = rolesQuery.data?.find((r) => r.isSystem);
  const catalog = ownerRole
    ? [...ownerRole.rolePermissions].sort((a, b) => a.permission.key.localeCompare(b.permission.key)).map((rp) => rp.permission)
    : [];

  return { ...rolesQuery, catalog };
}

export function useCreateRole(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesApi.create(schoolId as string, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', schoolId] }),
  });
}

export function useUpdateRole(schoolId: string | null, roleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => rolesApi.update(schoolId as string, roleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', schoolId] }),
  });
}

export function useDeleteRole(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesApi.remove(schoolId as string, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', schoolId] }),
  });
}