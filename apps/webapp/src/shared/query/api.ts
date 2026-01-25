import type {
  User,
  Course,
  Lesson,
  LearnSummary,
  Invite,
  Submission,
  ApiOk,
  PageInfo,
} from '@tracked/shared';
import { request } from '../api/index.js';

type ApiOkType<T> = ApiOk<T>;

async function fetchUnpacked<T>(path: string): Promise<T> {
  const res = await request<ApiOkType<T>>(path);
  if (!res?.data) throw new Error('Unexpected empty response');
  return res.data;
}

export function fetchMe(): Promise<User> {
  return fetchUnpacked<User>('/api/me');
}

export function fetchLibrary(): Promise<{
  catalog: Course[];
  recommendations: Course[];
  pageInfo?: PageInfo;
}> {
  return fetchUnpacked('/api/library');
}

export function fetchLearnSummary(): Promise<LearnSummary> {
  return fetchUnpacked<LearnSummary>('/api/learn');
}

export function fetchCourse(courseId: string): Promise<{ course: Course; lessons: Lesson[] }> {
  return fetchUnpacked<{ course: Course; lessons: Lesson[] }>(`/api/courses/${courseId}`);
}

export function fetchLesson(lessonId: string): Promise<Lesson> {
  return fetchUnpacked<Lesson>(`/api/lessons/${lessonId}`);
}

export function fetchInvite(): Promise<Invite> {
  return fetchUnpacked<Invite>('/api/me/invite');
}

export function fetchSubmission(lessonId: string): Promise<Submission> {
  return fetchUnpacked<Submission>(`/api/lessons/${lessonId}/submission`);
}
