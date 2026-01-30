import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ContractsV1 } from '@tracked/shared';
import { fetchJson, ApiClientError } from '../api/index.js';
import { me } from './queryKeys.js';

/**
 * Hook to fetch current user
 * GET /me
 * Data is cached and not refetched on every mount so Profile stays instant when navigating back.
 */
export function useMe() {
  return useQuery<ContractsV1.GetMeResponseV1, Error>({
    queryKey: me(),
    queryFn: async ({ signal }) => {
      return fetchJson<ContractsV1.GetMeResponseV1>({
        path: '/me',
        signal,
      });
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error instanceof ApiClientError && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 10 * 60 * 1000, // 10 min — не помечаем как устаревшие при переходах
    gcTime: 30 * 60 * 1000, // 30 min — держим в кэше полчаса
    refetchOnMount: false, // не перезапрашивать при возврате на страницу
    placeholderData: keepPreviousData, // при refetch показывать старые данные
  });
}
