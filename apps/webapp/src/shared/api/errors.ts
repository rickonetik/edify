import type { ErrorCode, ErrorPayload } from '@tracked/shared';

export class ApiClientError extends Error {
  name = 'ApiClientError' as const;
  status: number;
  code?: ErrorCode;
  payload?: ErrorPayload;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: ErrorCode;
      payload?: ErrorPayload;
      requestId?: string;
    },
  ) {
    super(message);
    this.status = status;
    this.code = options?.code;
    this.payload = options?.payload;
    this.requestId = options?.requestId;
  }
}

export function isApiClientError(e: unknown): e is ApiClientError {
  return e instanceof ApiClientError;
}
