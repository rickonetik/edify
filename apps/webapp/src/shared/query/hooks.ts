import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys.js';
import { mapErrorToUiState } from './errors.js';
import * as api from './api.js';

function useQueryWithUiError<TData>(options: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
}) {
  const result = useQuery(options);
  const uiError = result.isError && result.error ? mapErrorToUiState(result.error) : undefined;
  return {
    data: result.data,
    isLoading: result.isPending,
    isError: result.isError,
    error: result.error,
    uiError,
    refetch: result.refetch,
  };
}

export function useMe() {
  return useQueryWithUiError({
    queryKey: queryKeys.me(),
    queryFn: api.fetchMe,
  });
}

export function useLibrary() {
  return useQueryWithUiError({
    queryKey: queryKeys.library(),
    queryFn: api.fetchLibrary,
  });
}

export function useLearnSummary() {
  return useQueryWithUiError({
    queryKey: queryKeys.learnSummary(),
    queryFn: api.fetchLearnSummary,
  });
}

export function useCourse(courseId: string) {
  return useQueryWithUiError({
    queryKey: queryKeys.course(courseId),
    queryFn: () => api.fetchCourse(courseId),
    enabled: !!courseId,
  });
}

export function useLesson(lessonId: string) {
  return useQueryWithUiError({
    queryKey: queryKeys.lesson(lessonId),
    queryFn: () => api.fetchLesson(lessonId),
    enabled: !!lessonId,
  });
}

export function useInvite() {
  return useQueryWithUiError({
    queryKey: queryKeys.invites(),
    queryFn: api.fetchInvite,
  });
}

export function useSubmission(lessonId: string) {
  return useQueryWithUiError({
    queryKey: queryKeys.submission(lessonId),
    queryFn: () => api.fetchSubmission(lessonId),
    enabled: !!lessonId,
  });
}
