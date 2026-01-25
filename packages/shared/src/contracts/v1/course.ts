import type { ApiOk } from './errors.js';
import type { ID, ISODateTime, PageInfo } from './common.js';

export type CourseBadge = 'NEW' | 'POPULAR' | 'UPDATED';

export type Course = {
  id: ID;
  title: string;
  description?: string;
  coverUrl?: string;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  durationMinutes?: number;
  badges?: CourseBadge[];
  updatedAt?: ISODateTime;
};

export type LibraryResponse = ApiOk<{
  catalog: Course[];
  recommendations: Course[];
  pageInfo?: PageInfo;
}>;
