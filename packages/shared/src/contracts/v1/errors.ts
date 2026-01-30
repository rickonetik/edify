export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'INTERNAL'
  | 'BAD_GATEWAY'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type FieldError = { field: string; message: string };

export type ErrorPayload = {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  fieldErrors?: FieldError[];
};

export type ErrorResponse = {
  error: ErrorPayload;
  requestId: string;
};

export type ApiOk<T> = { data: T; requestId: string };
