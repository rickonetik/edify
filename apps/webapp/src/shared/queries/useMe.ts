import { useQuery } from '@tanstack/react-query';
import { ContractsV1 } from '@tracked/shared';
import { fetchJson, ApiClientError } from '../api/index.js';
import { me } from './queryKeys.js';

/**
 * Hook to fetch current user
 * GET /me
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
      // Default retry behavior for other errors
      return failureCount < 3;
    },
    staleTime: 30_000, // 30 seconds
  });
}
