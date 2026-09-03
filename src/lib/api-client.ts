import type { ApiEnvelope, ApiErrorShape } from '@/types/api';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000/api/v1';

/**
 * Thrown for every non-2xx response. `status` lets callers branch on
 * 401/403/404 without string-matching messages; `message` is always a
 * calm, human-readable string — never a raw stack trace or ORM error.
 */
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function friendlyMessageFor(status: number, raw?: string): string {
  if (raw && !/internal server error/i.test(raw)) return raw;
  switch (status) {
    case 400:
      return 'That request could not be processed. Please check the details and try again.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return 'The requested item could not be found.';
    case 409:
      return 'This conflicts with existing data. Please review and try again.';
    case 429:
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Something went wrong on our end. Please try again in a moment.';
  }
}

function extractMessage(body: unknown): string | undefined {
  const shape = body as Partial<ApiErrorShape> | undefined;
  if (!shape?.message) return undefined;
  return Array.isArray(shape.message) ? shape.message.join(' ') : shape.message;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  schoolId?: string;
  signal?: AbortSignal;
  /** Skip the automatic 401 -> refresh -> retry cycle (used by the refresh call itself). */
  skipAuthRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, schoolId, signal, skipAuthRetry } = options;
  const fullPath = schoolId ? `/schools/${schoolId}${path}` : path;
  const url = buildUrl(fullPath, query);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (networkError) {
    // fetch() throws (not a 4xx/5xx response) when the request never
    // reached the server at all — the API is unreachable, or the
    // backend's CORS origin doesn't match this frontend's origin. Log
    // the raw error for debugging and surface something actionable
    // instead of letting a bare TypeError bubble up to the caller.
    if (signal?.aborted) throw networkError;
    console.error(`[api-client] request to ${url} failed before a response was received:`, networkError);
    throw new ApiError(
      0,
      "Couldn't reach the server. Check that the API is running and that its FRONTEND_URL setting matches this app's URL.",
    );
  }

  if (res.status === 401 && !skipAuthRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, skipAuthRetry: true });
    }
  }

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => undefined) : undefined;
    const rawMessage = extractMessage(body);
    throw new ApiError(res.status, friendlyMessageFor(res.status, rawMessage));
  }

  if (!isJson) {
    // Binary responses (Excel export) are handled by requestBlob, not here.
    return undefined as T;
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

/** For endpoints that stream a file (Excel export) instead of JSON. */
async function requestBlob(path: string, options: RequestOptions = {}): Promise<{ blob: Blob; filename: string }> {
  const { query, schoolId, signal } = options;
  const fullPath = schoolId ? `/schools/${schoolId}${path}` : path;
  const url = buildUrl(fullPath, query);

  const res = await fetch(url, { method: 'GET', credentials: 'include', signal });

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    const rawMessage = extractMessage(body);
    throw new ApiError(res.status, friendlyMessageFor(res.status, rawMessage));
  }

  const disposition = res.headers.get('content-disposition') ?? '';
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match?.[1] ?? 'export.xlsx';
  const blob = await res.blob();
  return { blob, filename };
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  blob: requestBlob,
};

/** Triggers a browser download for a blob returned by apiClient.blob(). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}