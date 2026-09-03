'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi, type InviteStaffPayload, type UpdateStaffRolePayload } from './api';

export function useStaff(schoolId: string | null) {
  return useQuery({
    queryKey: ['staff', schoolId],
    queryFn: () => staffApi.list(schoolId as string),
    enabled: Boolean(schoolId),
  });
}

export function useInviteStaff(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteStaffPayload) => staffApi.invite(schoolId as string, payload),
    // Invites don't appear in listStaff until accepted, so there's
    // nothing to invalidate/refetch here — the success toast is the
    // only feedback until the invitee accepts.
  });
}

export function useUpdateStaffRole(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateStaffRolePayload }) =>
      staffApi.updateRole(schoolId as string, userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff', schoolId] }),
  });
}

export function useRemoveStaff(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => staffApi.remove(schoolId as string, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff', schoolId] }),
  });
}