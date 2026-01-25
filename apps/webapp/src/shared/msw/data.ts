import type {
  User,
  Course,
  Lesson,
  LearnSummary,
  Invite,
  Submission,
  ApiOk,
} from '@tracked/shared';

function generateRequestId(): string {
  return crypto.randomUUID();
}

// Mock User
export const mockUser: User = {
  id: 'user-1',
  name: 'Алексей',
  handle: '@alex_dev',
  avatarUrl: undefined,
  plan: 'pro',
  locale: 'ru',
  createdAt: '2024-01-15T10:00:00Z',
};

export const mockMeResponse: ApiOk<User> = {
  data: mockUser,
  requestId: generateRequestId(),
};

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Crypto Compliance Basics',
    description: 'Основы соответствия требованиям в криптовалютах',
    coverUrl: undefined,
    totalLessons: 30,
    completedLessons: 12,
    progressPct: 40,
    durationMinutes: 180,
    badges: ['NEW', 'POPULAR'],
    updatedAt: '2024-12-01T12:00:00Z',
  },
  {
    id: 'course-2',
    title: 'Web 3.0 Fundamentals',
    description: 'Фундаментальные концепции Web 3.0',
    coverUrl: undefined,
    totalLessons: 20,
    completedLessons: 0,
    progressPct: 0,
    durationMinutes: 120,
    badges: ['NEW'],
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'course-3',
    title: 'Blockchain Security',
    description: 'Безопасность блокчейн-систем',
    coverUrl: undefined,
    totalLessons: 25,
    completedLessons: 4,
    progressPct: 17,
    durationMinutes: 150,
    badges: ['POPULAR'],
    updatedAt: '2024-10-20T14:00:00Z',
  },
];

// Mock Lessons
export const mockLessons: Lesson[] = [
  {
    id: 'lesson-1',
    courseId: 'course-1',
    title: '08 — Risk Signals',
    order: 8,
    durationMinutes: 8,
    progressPct: 0,
    isCompleted: false,
  },
  {
    id: 'lesson-2',
    courseId: 'course-1',
    title: '07 — Cryptocurrency Risk Analysis',
    order: 7,
    durationMinutes: 12,
    progressPct: 95,
    isCompleted: false,
  },
  {
    id: 'lesson-3',
    courseId: 'course-1',
    title: '06 — AML Basics',
    order: 6,
    durationMinutes: 12,
    progressPct: 0,
    isCompleted: false,
  },
];

// Mock Library Response
export const mockLibraryResponse: ApiOk<{
  catalog: Course[];
  recommendations: Course[];
  pageInfo?: { nextCursor?: string | null };
}> = {
  data: {
    catalog: mockCourses,
    recommendations: mockCourses.slice(0, 2),
    pageInfo: { nextCursor: null },
  },
  requestId: generateRequestId(),
};

// Mock Learn Summary
export const mockLearnSummary: LearnSummary = {
  greetingName: 'Алексей',
  currentCourse: mockCourses[0],
  nextLesson: mockLessons[0],
  continueLessons: mockLessons,
  myCourses: mockCourses,
  news: [
    {
      id: 'news-1',
      title: 'Новые требования к KYC в 2026',
      description: 'Обновлены правила идентификации клиентов для криптовалютных платформ',
      badge: 'NEW',
    },
    {
      id: 'news-2',
      title: 'Изменения в регулировании DeFi',
      description: 'Европейский регулятор опубликовал новые рекомендации',
    },
  ],
};

export const mockLearnResponse: ApiOk<LearnSummary> = {
  data: mockLearnSummary,
  requestId: generateRequestId(),
};

// Mock Course Response
export function getMockCourseResponse(
  courseId: string,
): ApiOk<{ course: Course; lessons: Lesson[] }> {
  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];
  const lessons = mockLessons.filter((l) => l.courseId === courseId);
  return {
    data: { course, lessons },
    requestId: generateRequestId(),
  };
}

// Mock Lesson Response
export function getMockLessonResponse(lessonId: string): ApiOk<Lesson> {
  const lesson = mockLessons.find((l) => l.id === lessonId) || mockLessons[0];
  return {
    data: lesson,
    requestId: generateRequestId(),
  };
}

// Mock Invite
export const mockInvite: Invite = {
  code: 'REF-ABC123',
  url: 'https://edify.app/?ref=REF-ABC123',
  createdAt: '2024-01-15T10:00:00Z',
};

export const mockInviteResponse: ApiOk<Invite> = {
  data: mockInvite,
  requestId: generateRequestId(),
};

// Mock Submission
export function getMockSubmission(lessonId: string): Submission {
  return {
    id: `submission-${lessonId}`,
    lessonId,
    userId: 'user-1',
    status: 'SUBMITTED',
    text: 'Мой ответ на задание',
    attachments: [{ name: 'homework.pdf', url: 'https://example.com/homework.pdf' }],
    createdAt: '2024-12-20T15:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z',
  };
}

export function getMockSubmissionResponse(lessonId: string): ApiOk<Submission> {
  return {
    data: getMockSubmission(lessonId),
    requestId: generateRequestId(),
  };
}
