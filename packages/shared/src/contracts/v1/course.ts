import { z } from 'zod';
import type { ApiOk } from './errors.js';
import type { ID, ISODateTime, PageInfo } from './common.js';

export type CourseV1Status = 'draft' | 'published' | 'archived';
export type CourseV1Visibility = 'private' | 'public';

export type CourseV1 = {
  id: ID;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  authorName?: string | null;
  lessonsCount?: number;
  updatedAt: ISODateTime;
  status?: CourseV1Status;
  visibility?: CourseV1Visibility;
};

export const CourseV1Schema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  authorName: z.string().nullable().optional(),
  lessonsCount: z.number().optional(),
  updatedAt: z.string(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
});

export type Course = CourseV1;

export type LibraryResponse = ApiOk<{
  catalog: CourseV1[];
  recommendations: CourseV1[];
  pageInfo?: PageInfo;
}>;
