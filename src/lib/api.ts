const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalizedPath}`;
}
