import { apiClient } from '@/lib/api-client';
import type { SchoolMembership, User } from '@/types/entities';

export interface MeResponse {
  user: User;
  schools: SchoolMembership[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  schoolName: string;
}

export interface AcceptInvitePayload {
  token: string;
  password: string;
}

export const authApi = {
  me: () => apiClient.get<MeResponse>('/auth/me'),
  login: (payload: LoginPayload) => apiClient.post<MeResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<{ user: User }>('/auth/register', payload),
  logout: () => apiClient.post<null>('/auth/logout'),
  // Public — not school-scoped (the invitee has no account/membership
  // yet; the token itself resolves to a school on the backend).
  acceptInvite: (payload: AcceptInvitePayload) =>
    apiClient.post<{ userId: string; schoolId: string }>('/staff-invites/accept', payload),
};