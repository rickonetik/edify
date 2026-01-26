import { useQuery } from '@tanstack/react-query';
import { ContractsV1 } from '@tracked/shared';
import { fetchJson } from '../api/index.js';
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
  });
}
