import type { ErrorResponse } from '@tracked/shared';
import { getApiBaseUrl } from './baseUrl.js';
import { ApiClientError } from './errors.js';

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback simple UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function buildQueryString(query?: Record<string, string | number | boolean | undefined>): string {
  if (!query) return '';

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const baseUrl = getApiBaseUrl();
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // base '' + /api/... => same-origin; no trailing / on base => no //
  const queryString = buildQueryString(query);
  return `${base}${cleanPath}${queryString}`;
}

export async function request<T>(
  path: string,
  opts?: {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  },
): Promise<T> {
  const requestId = generateRequestId();
  const url = buildUrl(path, opts?.query);

  const headers: Record<string, string> = {
    accept: 'application/json',
    'x-request-id': requestId,
    'x-platform': 'webapp',
    ...opts?.headers,
  };

  if (opts?.body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: opts?.method || 'GET',
      headers,
      credentials: 'include',
      body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts?.signal,
    });
  } catch {
    // Network error
    throw new ApiClientError('Network error', 0, { requestId });
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Read response text — only parse non-empty; empty => null (never JSON.parse(''))
  const text = await response.text();

  // Detect HTML response (SPA fallback) in DEV when MSW expected
  if (response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Check if we got HTML instead of JSON (SPA fallback scenario)
    if (!isJson && text) {
      const trimmed = text.trim();
      if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) {
        // This is HTML, not JSON - likely SPA fallback when MSW not active
        const responseRequestId = response.headers.get('x-request-id') || requestId;
        throw new ApiClientError('Expected JSON, got HTML', response.status, {
          code: 'UNEXPECTED_RESPONSE' as any, // Local code, not in shared contracts
          requestId: responseRequestId,
          payload: {
            code: 'UNEXPECTED_RESPONSE' as any,
            message: 'Expected JSON, got HTML',
          },
        });
      }
    }
  }

  let parsed: unknown;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  } else {
    parsed = null;
  }

  // Handle successful response
  if (response.ok) {
    return parsed as T;
  }

  // Handle error response — requestId always set: API x-request-id else generated
  const responseRequestId = response.headers.get('x-request-id') || requestId;

  // Try to parse as ErrorResponse (from shared v1 contract)
  if (
    parsed &&
    typeof parsed === 'object' &&
    'error' in parsed &&
    parsed.error &&
    typeof parsed.error === 'object' &&
    'code' in parsed.error &&
    'message' in parsed.error &&
    typeof parsed.error.code === 'string' &&
    typeof parsed.error.message === 'string'
  ) {
    const errorResponse = parsed as ErrorResponse;
    throw new ApiClientError(errorResponse.error.message, response.status, {
      code: errorResponse.error.code,
      payload: errorResponse.error,
      requestId: errorResponse.requestId || responseRequestId,
    });
  }

  // Unexpected error format
  throw new ApiClientError('Unexpected error response', response.status, {
    requestId: responseRequestId,
    payload: {
      code: 'UNKNOWN',
      message: typeof parsed === 'string' ? parsed : 'Unexpected error response',
      details: parsed && typeof parsed === 'object' ? parsed : undefined,
    },
  });
}
