import { z } from 'zod';

export const studentSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  admissionNumber: z.string().min(1, 'Admission number is required').max(50),
  classId: z.string().uuid().optional().or(z.literal('')),
  parentName: z.string().max(150).optional().or(z.literal('')),
  parentPhone: z.string().max(30).optional().or(z.literal('')),
  parentEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  dateOfAdmission: z.string().optional().or(z.literal('')),
});
export type StudentFormValues = z.infer<typeof studentSchema>;