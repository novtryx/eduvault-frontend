import { ApiError } from '@/lib/api-client';

// The backend returns HTTP 402 Payment Required specifically for the
// trial/plan student-limit check — see
// StudentsService.assertWithinStudentLimit() (single create and bulk
// import both go through it). No other endpoint in this app currently
// uses 402, so checking the status alone is enough to identify this
// case without string-matching the message.
export function isPlanLimitError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 402;
}