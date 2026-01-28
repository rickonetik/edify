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
import { isApiClientError } from '../api/errors.js';
import { FLAGS } from '../config/flags.js';
import {
  mockMeResponse,
  mockLibraryResponse,
  mockLearnResponse,
  getMockCourseResponse,
  getMockLessonResponse,
  mockInviteResponse,
  getMockSubmissionResponse,
} from '../msw/data.js';

type ApiOkType<T> = ApiOk<T>;

/**
 * Check if we should fallback to mocks in DEV when MSW is expected but not active.
 * This happens when Service Worker doesn't work (Safari/WebView) and API returns HTML (SPA fallback).
 */
function shouldFallbackToMocks(err: unknown): boolean {
  // Only in DEV mode
  if (!import.meta.env.DEV) return false;

  // MSW must be expected (enabled)
  if (!FLAGS.useMsw) return false;

  // Real API mode should not use fallback
  if (FLAGS.realApi) return false;

  // Must be an ApiClientError
  if (!isApiClientError(err)) return false;

  // Check for HTML response (UNEXPECTED_RESPONSE code or status 200 with HTML message)
  if (err.code === 'UNEXPECTED_RESPONSE') return true;

  if (err.status === 200 && err.message.includes('HTML')) return true;

  return false;
}

async function fetchUnpacked<T>(path: string): Promise<T> {
  const res = await request<ApiOkType<T>>(path);
  if (!res?.data) throw new Error('Unexpected empty response');
  return res.data;
}

export async function fetchMe(): Promise<User> {
  try {
    return await fetchUnpacked<User>('/api/me');
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn('[API] MSW not active, using fallback mock for /api/me');
      return mockMeResponse.data;
    }
    throw err;
  }
}

export async function fetchLibrary(): Promise<{
  catalog: Course[];
  recommendations: Course[];
  pageInfo?: PageInfo;
}> {
  try {
    return await fetchUnpacked('/api/library');
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn('[API] MSW not active, using fallback mock for /api/library');
      return mockLibraryResponse.data;
    }
    throw err;
  }
}

export async function fetchLearnSummary(): Promise<LearnSummary> {
  try {
    return await fetchUnpacked<LearnSummary>('/api/learn');
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn('[API] MSW not active, using fallback mock for /api/learn');
      return mockLearnResponse.data;
    }
    throw err;
  }
}

export async function fetchCourse(
  courseId: string,
): Promise<{ course: Course; lessons: Lesson[] }> {
  try {
    return await fetchUnpacked<{ course: Course; lessons: Lesson[] }>(`/api/courses/${courseId}`);
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn(`[API] MSW not active, using fallback mock for /api/courses/${courseId}`);
      const mock = getMockCourseResponse(courseId);
      return mock.data;
    }
    throw err;
  }
}

export async function fetchLesson(lessonId: string): Promise<Lesson> {
  try {
    return await fetchUnpacked<Lesson>(`/api/lessons/${lessonId}`);
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn(`[API] MSW not active, using fallback mock for /api/lessons/${lessonId}`);
      const mock = getMockLessonResponse(lessonId);
      return mock.data;
    }
    throw err;
  }
}

export async function fetchInvite(): Promise<Invite> {
  try {
    return await fetchUnpacked<Invite>('/api/me/invite');
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn('[API] MSW not active, using fallback mock for /api/me/invite');
      return mockInviteResponse.data;
    }
    throw err;
  }
}

export async function fetchSubmission(lessonId: string): Promise<Submission> {
  try {
    return await fetchUnpacked<Submission>(`/api/lessons/${lessonId}/submission`);
  } catch (err) {
    if (shouldFallbackToMocks(err)) {
      console.warn(
        `[API] MSW not active, using fallback mock for /api/lessons/${lessonId}/submission`,
      );
      const mock = getMockSubmissionResponse(lessonId);
      return mock.data;
    }
    throw err;
  }
}
