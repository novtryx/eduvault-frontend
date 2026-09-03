'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolApi, type CreateAcademicSessionPayload, type CreateTermPayload, type UpdateSchoolPayload } from './api';

export function useSchool(schoolId: string | null) {
  return useQuery({
    queryKey: ['school', schoolId],
    queryFn: () => schoolApi.get(schoolId as string),
    enabled: Boolean(schoolId),
  });
}

export function useUpdateSchool(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSchoolPayload) => schoolApi.update(schoolId as string, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['school', schoolId], updated);
      // The sidebar/top-bar school switcher reads schoolName off the
      // ['auth', 'me'] membership list, not this query — refetch it too
      // so a rename shows up there immediately.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useAcademicSessions(schoolId: string | null) {
  return useQuery({
    queryKey: ['academic-sessions', schoolId],
    queryFn: () => schoolApi.listAcademicSessions(schoolId as string),
    enabled: Boolean(schoolId),
    staleTime: 5 * 60_000,
  });
}

/** Flattens sessions -> terms and finds the one flagged isCurrent, since
 * the dashboard/payment forms need a sensible default term to preselect. */
export function useCurrentTerm(schoolId: string | null) {
  const sessionsQuery = useAcademicSessions(schoolId);
  const sessions = sessionsQuery.data ?? [];
  const currentSession = sessions.find((s) => s.isCurrent) ?? sessions[0];
  const currentTerm = currentSession?.terms?.find((t) => t.isCurrent) ?? currentSession?.terms?.[0];

  return {
    ...sessionsQuery,
    sessions,
    currentSession,
    currentTerm,
  };
}

function invalidateSessions(queryClient: ReturnType<typeof useQueryClient>, schoolId: string | null) {
  queryClient.invalidateQueries({ queryKey: ['academic-sessions', schoolId] });
  // The current term/session also drives the dashboard/fee-structure defaults.
  queryClient.invalidateQueries({ queryKey: ['dashboard', schoolId] });
}

export function useCreateAcademicSession(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAcademicSessionPayload) => schoolApi.createAcademicSession(schoolId as string, payload),
    onSuccess: () => invalidateSessions(queryClient, schoolId),
  });
}

export function useCreateTerm(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: CreateTermPayload }) =>
      schoolApi.createTerm(schoolId as string, sessionId, payload),
    onSuccess: () => invalidateSessions(queryClient, schoolId),
  });
}

export function useSetCurrentSession(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => schoolApi.setCurrentSession(schoolId as string, sessionId),
    onSuccess: () => invalidateSessions(queryClient, schoolId),
  });
}

export function useSetCurrentTerm(schoolId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (termId: string) => schoolApi.setCurrentTerm(schoolId as string, termId),
    onSuccess: () => invalidateSessions(queryClient, schoolId),
  });
}