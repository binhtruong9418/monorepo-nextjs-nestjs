/** Milliseconds */
export const TIME_MS = {
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  TOAST_DURATION: 5_000,
  QUERY_STALE: 60_000,
  QUERY_STALE_LONG: 5 * 60_000,   // 5 min — for mostly-static data (categories, config)
  POLLING_INTERVAL: 2_000,
  REQUEST_TIMEOUT: 30_000,
} as const;

/** Seconds */
export const TIME_S = {
  TOKEN_EXPIRY: 15 * 60,                   // 15 min — matches JWT_ACCESS_EXPIRES_IN default
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60,  // 7 days
  REVALIDATE_STATIC: 60 * 60,              // 1 hr — Next.js ISR revalidation for public pages
} as const;
