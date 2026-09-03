import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2, 'Role name is required').max(50),
  description: z.string().max(255).optional().or(z.literal('')),
  permissionKeys: z.array(z.string()).min(0),
});
export type RoleFormValues = z.infer<typeof roleSchema>;