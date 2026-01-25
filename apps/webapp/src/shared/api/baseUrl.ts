export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  return base;
}
