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

export type { ID, ISODateTime, ISODate, Locale, Platform, Pagination, PageInfo } from './common.js';
export type { ErrorCode, FieldError, ErrorPayload, ErrorResponse } from './errors.js';
export type { ApiErrorV1, ApiErrorResponseV1 } from './errors.js';
export type { UserV1, User, MeResponse } from './user.js';
export type {
  CourseV1,
  Course,
  CourseV1Status,
  CourseV1Visibility,
  LibraryResponse,
} from './course.js';
export type {
  LessonV1,
  Lesson,
  LessonVideoV1,
  LearnSummary,
  LearnResponse,
  CourseResponse,
} from './lesson.js';
export type { InviteV1, Invite, InviteResponse } from './invite.js';
export type {
  SubmissionV1,
  Submission,
  SubmissionStatus,
  SubmissionResponse,
} from './submission.js';
export type { AuthTelegramRequestV1, AuthTelegramResponseV1 } from './auth.js';
export type {
  GetMeResponseV1,
  GetLibraryResponseV1,
  GetLearnSummaryResponseV1,
  GetCourseResponseV1,
  GetLessonResponseV1,
} from './endpoints.js';
