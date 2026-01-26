import { z } from 'zod';
import type { Id, IsoDateTime, UrlString } from './common.js';

/**
 * Submission entity V1
 */
export interface SubmissionV1 {
  id: Id;
  lessonId: Id;
  courseId: Id;
  studentId: Id;
  createdAt: IsoDateTime;
  text?: string | null;
  link?: UrlString | null;
  fileKey?: string | null;
  status?: 'submitted' | 'rework' | 'accepted';
}

/**
 * Zod schema for SubmissionV1
 */
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
