import { z } from 'zod';

export const academicSessionSchema = z.object({
  name: z.string().min(4, 'e.g. "2026/2027"').max(20),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
});
export type AcademicSessionFormValues = z.infer<typeof academicSessionSchema>;

export const termSchema = z.object({
  name: z.string().min(2, 'e.g. "First Term"').max(50),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
});
export type TermFormValues = z.infer<typeof termSchema>;

// Matches UpdateSchoolDto's name/logoUrl/address/phone/email/website —
// mirrors the backend's @MaxLength / @IsUrl constraints so invalid input
// is caught before the request round-trips.
export const schoolInfoSchema = z.object({
  name: z.string().min(2, 'School name is required').max(150),
  logoUrl: z.string().url('Enter a valid URL').max(2048).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').max(150).optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').max(2048).optional().or(z.literal('')),
});
export type SchoolInfoFormValues = z.infer<typeof schoolInfoSchema>;

// Matches UpdateSchoolDto's receiptPrefix/receiptFooter/receiptSignature.
export const receiptSettingsSchema = z.object({
  receiptPrefix: z.string().min(1, 'Prefix is required').max(20),
  receiptFooter: z.string().max(255).optional().or(z.literal('')),
  receiptSignature: z.string().max(150).optional().or(z.literal('')),
});
export type ReceiptSettingsFormValues = z.infer<typeof receiptSettingsSchema>;