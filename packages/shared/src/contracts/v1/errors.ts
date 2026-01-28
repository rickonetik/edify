import { z } from 'zod';

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

export type ApiErrorV1 = {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
};

export type ApiErrorResponseV1 = {
  error: ApiErrorV1;
};

export const ApiErrorV1Schema = z.object({
  code: z.string(),
  message: z.string(),
  requestId: z.string(),
  details: z.unknown().optional(),
});

export const ApiErrorResponseV1Schema = z.object({
  error: ApiErrorV1Schema,
});

export type ApiOk<T> = { data: T; requestId: string };
