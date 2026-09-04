import { z } from 'zod';

// Matches SaveBankAccountDto exactly — accountNumber must be a 10-digit
// NUBAN. Paystack's own resolve-account-number call is the real source
// of truth on validity (see backend comment on SaveBankAccountDto), this
// just catches an obviously wrong value before that round-trip.
export const bankAccountSchema = z.object({
  bankCode: z.string().min(1, 'Select a bank'),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit account number'),
});
export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;