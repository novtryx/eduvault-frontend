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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
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
  // Always resolves with the same generic message regardless of whether
  // the email exists — see AuthController.forgotPassword's comment on
  // why that must never vary (anti-enumeration). The frontend must not
  // branch on success vs "not found" because there IS no such
  // distinction in this response.
  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', payload),
  // Does NOT log the user in (no cookies set) — same pattern as
  // acceptInvite. On success, send them to Login.
  resetPassword: (payload: ResetPasswordPayload) => apiClient.post<null>('/auth/reset-password', payload),
};