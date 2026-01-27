/**
 * Sanity check: Import all shared v1 contracts to verify they're properly exported.
 * This file should typecheck without errors if all contracts are accessible from @tracked/shared.
 * If any import fails, it indicates an export issue in packages/shared.
 */

// Common types
import type {
  ID,
  ISODateTime,
  ISODate,
  Locale,
  Platform,
  Pagination,
  PageInfo,
} from '@tracked/shared';

// Error contracts
import type { ErrorCode, ErrorPayload, ErrorResponse, ApiOk } from '@tracked/shared';

// User contract
import type { User, MeResponse } from '@tracked/shared';

// Course contract
import type { Course, CourseBadge, LibraryResponse } from '@tracked/shared';

// Lesson contract
import type { Lesson, LearnSummary, LearnResponse, CourseResponse } from '@tracked/shared';

// Invite contract
import type { Invite, InviteResponse } from '@tracked/shared';

// Submission contract
import type { Submission, SubmissionStatus, SubmissionResponse } from '@tracked/shared';

// Type assertions to ensure types are usable (compile-time only, no runtime code)
type _SanityCheck =
  | ID
  | ISODateTime
  | ISODate
  | Locale
  | Platform
  | Pagination
  | PageInfo
  | ErrorCode
  | ErrorPayload
  | ErrorResponse
  | ApiOk<unknown>
  | User
  | MeResponse
  | Course
  | CourseBadge
  | LibraryResponse
  | Lesson
  | LearnSummary
  | LearnResponse
  | CourseResponse
  | Invite
  | InviteResponse
  | Submission
  | SubmissionStatus
  | SubmissionResponse;

// This file should compile without errors if all exports are correct
export type { _SanityCheck };
