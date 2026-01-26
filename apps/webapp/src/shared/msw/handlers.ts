import { http, HttpResponse } from 'msw';
import type { ErrorResponse } from '@tracked/shared';
import {
  mockMeResponse,
  mockLibraryResponse,
  mockLearnResponse,
  getMockCourseResponse,
  getMockLessonResponse,
  mockInviteResponse,
  getMockSubmissionResponse,
  emptyLibraryResponse,
  emptyLearnResponse,
} from './data.js';

function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || crypto.randomUUID();
}

function createErrorResponse(
  status: number,
  code: string,
  message: string,
  requestId: string,
): ErrorResponse {
  return {
    error: {
      code: code as ErrorResponse['error']['code'],
      message,
    },
    requestId,
  };
}

function getMswParam(request: Request): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('__msw');
}

export const handlers = [
  // GET /api/me
  http.get('/api/me', async ({ request }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '401') {
      return HttpResponse.json(
        createErrorResponse(401, 'UNAUTHORIZED', 'Требуется авторизация', requestId),
        { status: 401 },
      );
    }

    return HttpResponse.json(mockMeResponse, {
      headers: { 'x-request-id': requestId },
    });
  }),

  // GET /api/library
  http.get('/api/library', async ({ request }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '404') {
      return HttpResponse.json(
        createErrorResponse(404, 'NOT_FOUND', 'Библиотека не найдена', requestId),
        { status: 404 },
      );
    }

    if (msw === 'empty') {
      return HttpResponse.json(emptyLibraryResponse, {
        headers: { 'x-request-id': requestId },
      });
    }

    return HttpResponse.json(mockLibraryResponse, {
      headers: { 'x-request-id': requestId },
    });
  }),

  // GET /api/learn
  http.get('/api/learn', async ({ request }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '500') {
      return HttpResponse.json(
        createErrorResponse(500, 'INTERNAL', 'Внутренняя ошибка сервера', requestId),
        { status: 500 },
      );
    }

    if (msw === 'empty') {
      return HttpResponse.json(emptyLearnResponse, {
        headers: { 'x-request-id': requestId },
      });
    }

    return HttpResponse.json(mockLearnResponse, {
      headers: { 'x-request-id': requestId },
    });
  }),

  // GET /api/courses/:courseId
  http.get('/api/courses/:courseId', async ({ request, params }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);
    const courseId = params.courseId as string;

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '404') {
      return HttpResponse.json(
        createErrorResponse(404, 'NOT_FOUND', `Курс ${courseId} не найден`, requestId),
        { status: 404 },
      );
    }

    const response = getMockCourseResponse(courseId);
    return HttpResponse.json(response, {
      headers: { 'x-request-id': requestId },
    });
  }),

  // GET /api/lessons/:lessonId
  http.get('/api/lessons/:lessonId', async ({ request, params }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);
    const lessonId = params.lessonId as string;

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '404') {
      return HttpResponse.json(
        createErrorResponse(404, 'NOT_FOUND', `Урок ${lessonId} не найден`, requestId),
        { status: 404 },
      );
    }

    const response = getMockLessonResponse(lessonId);
    return HttpResponse.json(response, {
      headers: { 'x-request-id': requestId },
    });
  }),

  // GET /api/me/invite
  http.get('/api/me/invite', async ({ request }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '403') {
      return HttpResponse.json(
        createErrorResponse(403, 'FORBIDDEN', 'Доступ к реферальной программе запрещён', requestId),
        { status: 403 },
      );
    }

    return HttpResponse.json(mockInviteResponse, {
      headers: { 'x-request-id': requestId },
    });
  }),

  // GET /api/lessons/:lessonId/submission
  http.get('/api/lessons/:lessonId/submission', async ({ request, params }) => {
    const msw = getMswParam(request);
    const requestId = getRequestId(request);
    const lessonId = params.lessonId as string;

    if (msw === 'network') {
      return HttpResponse.error();
    }

    if (msw === '404') {
      return HttpResponse.json(
        createErrorResponse(
          404,
          'NOT_FOUND',
          `Отправка для урока ${lessonId} не найдена`,
          requestId,
        ),
        { status: 404 },
      );
    }

    if (msw === '422') {
      return HttpResponse.json(
        createErrorResponse(422, 'VALIDATION_ERROR', 'Ошибка валидации данных', requestId),
        { status: 422 },
      );
    }

    const response = getMockSubmissionResponse(lessonId);
    return HttpResponse.json(response, {
      headers: { 'x-request-id': requestId },
    });
  }),
];
