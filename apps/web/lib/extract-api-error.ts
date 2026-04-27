import { ERROR_MESSAGES } from '@repo/api/fe';

/**
 * Extracts a user-friendly error message from an axios/API error.
 * If the API returned a known error code (e.g. "CAT_001"), it is mapped
 * to its human-readable message via ERROR_MESSAGES from @repo/api/fe.
 */
export function extractApiError(err: unknown, fallback = 'Something went wrong'): string {
  const data = (err as { response?: { data?: unknown } }).response?.data as
    | { message?: unknown }
    | undefined;

  if (data?.message) {
    if (typeof data.message === 'string') {
      return ERROR_MESSAGES[data.message] ?? data.message;
    }
    if (Array.isArray(data.message)) {
      const messages = (data.message as unknown[])
        .filter((m): m is string => typeof m === 'string')
        .map((m) => ERROR_MESSAGES[m] ?? m);
      return messages.join('; ') || fallback;
    }
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
