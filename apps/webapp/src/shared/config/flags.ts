/**
 * Feature flags and configuration
 */

/**
 * API configuration flags
 */
export const config = {
  /**
   * Use MSW for mocking (only in DEV, ignored in PROD)
   */
  USE_MSW: import.meta.env.VITE_USE_MSW === '1' || import.meta.env.VITE_USE_MSW === 'true',

  /**
   * Use real API (disables mocking)
   */
  REAL_API: import.meta.env.VITE_REAL_API === '1' || import.meta.env.VITE_REAL_API === 'true',

  /**
   * API base URL
   */
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',

  /**
   * API prefix (default '/api')
   */
  API_PREFIX: '/api',
} as const;
