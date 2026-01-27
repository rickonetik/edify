/**
 * Contracts V1 - Public API
 *
 * All exports from this module are available via:
 * import { ContractsV1 } from '@tracked/shared';
 */

// Common types
export type { Id, IsoDateTime, UrlString } from './common.js';

// Entity types
export type { UserV1 } from './user.js';
export type { CourseV1 } from './course.js';
export type { LessonV1, LessonVideoV1 } from './lesson.js';
export type { InviteV1 } from './invite.js';
export type { SubmissionV1 } from './submission.js';

// Error types
export type { ApiErrorV1, ApiErrorResponseV1 } from './errors.js';

// Endpoint DTO types
export type {
  GetMeResponseV1,
  GetLibraryResponseV1,
  GetLearnSummaryResponseV1,
  GetCourseResponseV1,
  GetLessonResponseV1,
} from './endpoints.js';

// Auth types
export type { AuthTelegramRequestV1, AuthTelegramResponseV1 } from './auth.js';

// Zod schemas (for runtime validation)
export {
  UserV1Schema,
  CourseV1Schema,
  LessonV1Schema,
  InviteV1Schema,
  SubmissionV1Schema,
  ApiErrorV1Schema,
  ApiErrorResponseV1Schema,
  GetMeResponseV1Schema,
  GetLibraryResponseV1Schema,
  GetLearnSummaryResponseV1Schema,
  GetCourseResponseV1Schema,
  GetLessonResponseV1Schema,
  AuthTelegramRequestV1Schema,
  AuthTelegramResponseV1Schema,
} from './schemas.js';
