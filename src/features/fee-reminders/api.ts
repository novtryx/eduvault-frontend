import { apiClient } from '@/lib/api-client';
import type { BulkFeeActionResult } from '@/types/entities';

export interface SendBulkFeeRemindersPayload {
  academicSessionId: string;
  termId: string;
  classId?: string;
}

// Mirrors FeeRemindersController exactly — school-wide, not
// student-scoped (separate from the individual "Send Payment Link" on
// a student's profile). Requires a connected bank account (same
// prerequisite as an individual payment link) — see
// FeePaymentsService.sendBulkReminders's upfront check. Synchronous:
// the backend loops and emails inline with no job queue, so this can
// take a while for a school with many owing students.
export const feeRemindersApi = {
  send: (schoolId: string, payload: SendBulkFeeRemindersPayload) =>
    apiClient.post<BulkFeeActionResult>('/fee-reminders/send', payload, { schoolId }),
};