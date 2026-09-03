import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50),
  order: z.coerce.number().int().optional(),
});
export type ClassFormValues = z.infer<typeof classSchema>;