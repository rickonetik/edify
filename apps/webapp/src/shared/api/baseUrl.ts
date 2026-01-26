import { FLAGS } from '../config/flags.js';

export function getApiBaseUrl(): string {
  // If realApi is enabled, use VITE_API_BASE_URL or same-origin
  if (FLAGS.realApi) {
    return import.meta.env.VITE_API_BASE_URL ?? '';
  }

  // If MSW is enabled, use same-origin (MSW will intercept fetch)
  if (FLAGS.useMsw) {
    return '';
  }

  // Default: use VITE_API_BASE_URL or same-origin
  return import.meta.env.VITE_API_BASE_URL ?? '';
}
