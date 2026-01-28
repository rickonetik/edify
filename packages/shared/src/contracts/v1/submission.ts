import { z } from 'zod';
import type { ApiOk } from './errors.js';
import type { ID, ISODateTime } from './common.js';

export type SubmissionV1Status = 'submitted' | 'rework' | 'accepted';

export type SubmissionV1 = {
  id: ID;
  lessonId: ID;
  courseId: ID;
  studentId: ID;
  createdAt: ISODateTime;
  text?: string | null;
  link?: string | null;
  fileKey?: string | null;
  status?: SubmissionV1Status;
};

export const SubmissionV1Schema = z.object({
  id: z.string(),
  lessonId: z.string(),
  courseId: z.string(),
  studentId: z.string(),
  createdAt: z.string(),
  text: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  fileKey: z.string().nullable().optional(),
  status: z.enum(['submitted', 'rework', 'accepted']).optional(),
});

export type SubmissionStatus = SubmissionV1Status;
export type Submission = SubmissionV1;
export type SubmissionResponse = ApiOk<SubmissionV1>;
