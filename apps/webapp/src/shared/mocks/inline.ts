import { ContractsV1 } from '@tracked/shared';
import {
  mockUser,
  mockCourses,
  getMockCourse,
  getMockLessons,
  getMockLesson,
  paginate,
} from './fixtures.js';

/**
 * Mock request handler (inline, without Service Worker)
 * Used as fallback when Service Worker is unavailable
 */

export interface MockRequest {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: unknown;
}

export interface MockResponse {
  status: number;
  json: unknown;
  headers?: Record<string, string>;
}

/**
 * Try to handle mock request inline
 * Returns response if handled, null if should fall through to real API
 */
export function tryHandleMockRequest(req: MockRequest): MockResponse | null {
  const { method, path, query = {} } = req;

  // Only handle GET requests for now
  if (method !== 'GET') {
    return null;
  }

  // Parse path
  const pathParts = path.split('?')[0].split('/').filter(Boolean);
  const apiPrefix = '/api';
  if (!path.startsWith(apiPrefix)) {
    return null;
  }

  const route = path.substring(apiPrefix.length);

  // GET /me
  if (route === '/me') {
    // Error scenario: unauthorized
    if (query.error === 'unauthorized') {
      const errorResponse: ContractsV1.ApiErrorResponseV1 = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          requestId: `req-${Date.now()}`,
        },
      };
      return {
        status: 401,
        json: errorResponse,
        headers: { 'content-type': 'application/json' },
      };
    }

    // Normal response
    const response: ContractsV1.GetMeResponseV1 = {
      user: mockUser,
    };
    return {
      status: 200,
      json: response,
      headers: { 'content-type': 'application/json' },
    };
  }

  // GET /library
  if (route === '/library') {
    // Error scenario: server error
    if (query.error === 'server') {
      const errorResponse: ContractsV1.ApiErrorResponseV1 = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          requestId: `req-${Date.now()}`,
          details: {
            timestamp: new Date().toISOString(),
          },
        },
      };
      return {
        status: 500,
        json: errorResponse,
        headers: { 'content-type': 'application/json' },
      };
    }

    // Normal response
    const limitParam = query.limit;
    const offsetParam = query.offset;

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    // Filter published courses
    const publishedCourses = mockCourses.filter((c) => c.status === 'published');

    // Apply pagination
    const { items: courses } = paginate(publishedCourses, limit, offset);

    // Recommended courses (first 2 published)
    const recommended = publishedCourses.slice(0, 2);

    const response: ContractsV1.GetLibraryResponseV1 = {
      courses,
      recommended,
    };

    return {
      status: 200,
      json: response,
      headers: { 'content-type': 'application/json' },
    };
  }

  // GET /learn/summary
  if (route === '/learn/summary') {
    const activeCourse = mockCourses.find((c) => c.status === 'published');
    const activeCourseId = activeCourse?.id;

    const nextLesson = activeCourseId ? getMockLessons(activeCourseId)[0] : undefined;

    const response: ContractsV1.GetLearnSummaryResponseV1 = {
      activeCourse: activeCourse || null,
      nextLesson: nextLesson || null,
    };

    return {
      status: 200,
      json: response,
      headers: { 'content-type': 'application/json' },
    };
  }

  // GET /courses/:id
  const courseMatch = route.match(/^\/courses\/(.+)$/);
  if (courseMatch) {
    const courseId = courseMatch[1];

    // Error scenario: forbidden
    if (query.error === 'forbidden') {
      const errorResponse: ContractsV1.ApiErrorResponseV1 = {
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this course',
          requestId: `req-${Date.now()}`,
        },
      };
      return {
        status: 403,
        json: errorResponse,
        headers: { 'content-type': 'application/json' },
      };
    }

    const course = getMockCourse(courseId);

    if (!course) {
      const errorResponse: ContractsV1.ApiErrorResponseV1 = {
        error: {
          code: 'NOT_FOUND',
          message: `Course with id "${courseId}" not found`,
          requestId: `req-${Date.now()}`,
        },
      };
      return {
        status: 404,
        json: errorResponse,
        headers: { 'content-type': 'application/json' },
      };
    }

    const lessons = getMockLessons(course.id);

    const response: ContractsV1.GetCourseResponseV1 = {
      course,
      lessons,
    };

    return {
      status: 200,
      json: response,
      headers: { 'content-type': 'application/json' },
    };
  }

  // GET /lessons/:id
  const lessonMatch = route.match(/^\/lessons\/(.+)$/);
  if (lessonMatch) {
    const lessonId = lessonMatch[1];
    const lesson = getMockLesson(lessonId);

    if (!lesson) {
      const errorResponse: ContractsV1.ApiErrorResponseV1 = {
        error: {
          code: 'NOT_FOUND',
          message: `Lesson with id "${lessonId}" not found`,
          requestId: `req-${Date.now()}`,
        },
      };
      return {
        status: 404,
        json: errorResponse,
        headers: { 'content-type': 'application/json' },
      };
    }

    const response: ContractsV1.GetLessonResponseV1 = {
      lesson,
    };

    return {
      status: 200,
      json: response,
      headers: { 'content-type': 'application/json' },
    };
  }

  // Unknown route - return null to fall through to real API
  return null;
}
