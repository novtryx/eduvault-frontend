import { z } from 'zod';

export const paymentMethods = ['CASH', 'BANK_TRANSFER', 'POS'] as const;

export const recordPaymentSchema = z.object({
  studentId: z.string().uuid('Select a student'),
  termId: z.string().uuid('Select a term'),
  amountNaira: z.coerce.number().positive('Enter an amount greater than zero'),
  method: z.enum(paymentMethods, { required_error: 'Select a payment method' }),
  paymentDate: z.string().min(1, 'Select a payment date'),
  reference: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});
export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;