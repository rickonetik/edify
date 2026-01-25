/**
 * Typed, stable query keys for React Query.
 * Use as dependency arrays for invalidation / prefetch.
 */

export const queryKeys = {
  me: () => ['me'] as const,

  library: (params?: { cursor?: string; limit?: number }) =>
    (params ? ['library', params] : ['library']) as const,

  learnSummary: () => ['learnSummary'] as const,

  course: (courseId: string) => ['course', courseId] as const,

  lesson: (lessonId: string) => ['lesson', lessonId] as const,

  invites: () => ['invites'] as const,

  submission: (lessonId: string) => ['submission', lessonId] as const,
} as const;
