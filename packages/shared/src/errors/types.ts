import { ApiErrorCode } from './codes.js';

export interface ApiErrorResponse {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  requestId: string;
  details?: unknown;
}
