// Matches src/common/pagination.ts on the backend exactly.
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Every EduVault controller returns { success: true, data } on success.
// Nest's global exception filter (default) returns { statusCode, message,
// error } on failure — apiClient normalizes both shapes, see api-client.ts.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
  error?: string;
}
