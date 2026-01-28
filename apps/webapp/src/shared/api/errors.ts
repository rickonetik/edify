import type { ErrorCode, ErrorPayload } from '@tracked/shared';

// Local error code for webapp (not in shared contracts)
export type LocalErrorCode = 'UNEXPECTED_RESPONSE';

export class ApiClientError extends Error {
  name = 'ApiClientError' as const;
  status: number;
  code?: ErrorCode | LocalErrorCode;
  payload?: ErrorPayload;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: ErrorCode | LocalErrorCode;
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
