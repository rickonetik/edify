import { ErrorCode } from './codes.js';

export interface ApiErrorResponse {
  statusCode: number;
  code: ErrorCode;
  message: string;
  traceId: string;
  details?: unknown;
}
