/**
 * Feature flags for webapp data source control.
 *
 * Priority rule: realApi === true → useMsw = false (hard override)
 *
 * Environment variables:
 * - VITE_USE_MSW: 'true' to enable MSW (only in DEV)
 * - VITE_REAL_API: 'true' to force real API (disables MSW even if VITE_USE_MSW=true)
 */
export const FLAGS = {
  /**
   * Use MSW (Mock Service Worker) for API mocking.
   * Only works in DEV mode.
   * Automatically disabled if realApi === true.
   */
  useMsw: (() => {
    if (import.meta.env.VITE_REAL_API === 'true') {
      return false; // Hard override: real API disables MSW
    }
    return import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true';
  })(),

  /**
   * Force real API usage (disables MSW).
   * When true, fetcher will use VITE_API_BASE_URL or same-origin.
   */
  realApi: import.meta.env.VITE_REAL_API === 'true',
} as const;
