import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  schoolName: z.string().min(2, 'School name is required').max(150),
  fullName: z.string().min(2, 'Your full name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer')
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Mirrors AcceptInviteDto exactly — same password rule as registration,
// kept identical intentionally (see the backend DTO's own comment on
// why "sign up" vs "accept invite" shouldn't have different policies).
export const acceptInviteSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer')
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
export type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;