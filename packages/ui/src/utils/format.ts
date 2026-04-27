/**
 * Format a number as currency (USD by default).
 * e.g. 1299.99 → "$1,299.99"
 */
export function formatPrice(value: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number with thousands separators and optional decimal places.
 * e.g. 1500000 → "1,500,000"
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number with K/M/B compact suffix.
 * e.g. 1500000 → "1.5M"
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format an ISO date string or Date object.
 * e.g. new Date() → "27/04/2026"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB').format(new Date(date));
}

/**
 * Format an ISO date string or Date object with time.
 * e.g. new Date() → "27/04/2026, 15:30"
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Truncate a long string with an ellipsis in the middle.
 * e.g. truncateMiddle("abcdefghij", 3, 3) → "abc...hij"
 */
export function truncateMiddle(str: string, start = 6, end = 4): string {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}
