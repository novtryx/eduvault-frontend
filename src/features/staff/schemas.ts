import { z } from 'zod';

export const inviteStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  roleId: z.string().uuid('Select a role'),
});
export type InviteStaffFormValues = z.infer<typeof inviteStaffSchema>;