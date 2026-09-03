'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { rolesApi } from '@/features/roles/api';
import { ApiError } from '@/lib/api-client';
import type { SchoolMembership, User } from '@/types/entities';

const SCHOOL_STORAGE_KEY = 'eduvault:activeSchoolId';

interface AuthContextValue {
  user: User | null;
  schools: SchoolMembership[];
  isLoading: boolean;
  isAuthenticated: boolean;
  currentSchoolId: string | null;
  currentMembership: SchoolMembership | null;
  setCurrentSchoolId: (schoolId: string) => void;
  isOwner: boolean;
  /** null = not yet known / couldn't be loaded (UI fails open — see lib/permissions.ts) */
  permissionKeys: string[] | null;
  refetchMe: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [currentSchoolId, setCurrentSchoolIdState] = React.useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });

  const user = meQuery.data?.user ?? null;
  const schools = React.useMemo(() => meQuery.data?.schools ?? [], [meQuery.data]);

  React.useEffect(() => {
    if (!schools.length) return;
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(SCHOOL_STORAGE_KEY) : null;
    const validStored = stored && schools.some((s) => s.schoolId === stored) ? stored : null;
    setCurrentSchoolIdState(validStored ?? schools[0]?.schoolId ?? null);
  }, [schools]);

  const setCurrentSchoolId = React.useCallback((schoolId: string) => {
    setCurrentSchoolIdState(schoolId);
    window.localStorage.setItem(SCHOOL_STORAGE_KEY, schoolId);
    // Every school-scoped query is keyed by schoolId, so switching schools
    // naturally refetches everything relevant without a manual reset.
    queryClient.invalidateQueries();
  }, [queryClient]);

  const currentMembership = React.useMemo(
    () => schools.find((s) => s.schoolId === currentSchoolId) ?? null,
    [schools, currentSchoolId],
  );

  const isOwner = currentMembership?.isSystem ?? false;

  const roleQuery = useQuery({
    queryKey: ['roles', currentSchoolId, currentMembership?.roleId],
    queryFn: () => rolesApi.get(currentSchoolId as string, currentMembership!.roleId),
    enabled: Boolean(currentSchoolId && currentMembership && !isOwner),
    retry: false,
    staleTime: 5 * 60_000,
  });

  const permissionKeys: string[] | null = isOwner
    ? null // Owners never need the list checked — hasPermission short-circuits on isOwner.
    : roleQuery.data
      ? roleQuery.data.rolePermissions.map((rp) => rp.permission.key)
      : null; // not loaded yet, or failed to load (e.g. RolesModule not registered) -> fail open, see lib/permissions.ts

  const value: AuthContextValue = {
    user,
    schools,
    isLoading: meQuery.isLoading,
    isAuthenticated: !meQuery.isError && Boolean(user),
    currentSchoolId,
    currentMembership,
    setCurrentSchoolId,
    isOwner,
    permissionKeys,
    refetchMe: () => meQuery.refetch(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}