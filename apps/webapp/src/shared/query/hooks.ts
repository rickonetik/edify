import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys.js';
import { mapErrorToUiState } from './errors.js';
import { FLAGS } from '../config/flags.js';
import * as api from './api.js';

// Hook to track MSW state reactively
function useMswState() {
  const [mswReady, setMswReady] = useState(() => (window as any).__MSW_READY__?.() ?? false);
  const [mswFailed, setMswFailed] = useState(() => (window as any).__MSW_FAILED__?.() ?? false);

  useEffect(() => {
    const subscribe = (window as any).__MSW_SUBSCRIBE__;
    if (!subscribe) return;

    const unsubscribe = subscribe((ready: boolean, failed: boolean) => {
      setMswReady(ready);
      setMswFailed(failed);
    });

    return unsubscribe;
  }, []);

  return { mswReady, mswFailed };
}

function useQueryWithUiError<TData>(options: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
}) {
  // Always call hook (React rules) - must be at top level
  const { mswReady, mswFailed } = useMswState();

  // Determine if queries should be enabled
  let shouldFetch = false;
  if (FLAGS.realApi) {
    shouldFetch = true; // Real API always works
  } else if (FLAGS.useMsw) {
    shouldFetch = mswReady && !mswFailed; // MSW must be enabled AND ready (not failed)
  }
  // Otherwise: no data source available, shouldFetch = false

  const enabled = shouldFetch && options.enabled !== false;

  const result = useQuery({
    ...options,
    enabled,
  });

  // Auto-refetch when MSW becomes ready (if it wasn't ready initially)
  const wasEnabledRef = useRef(enabled);
  useEffect(() => {
    if (!wasEnabledRef.current && enabled && !result.isFetching) {
      // MSW just became ready, trigger a refetch
      result.refetch();
    }
    wasEnabledRef.current = enabled;
  }, [enabled, result.isFetching, result.refetch, result]);

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
