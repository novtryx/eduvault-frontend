import { z } from 'zod';

export const feeStructureSchema = z.object({
  classId: z.string().uuid('Select a class'),
  amountNaira: z.coerce.number().positive('Enter an amount greater than zero'),
});
export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;