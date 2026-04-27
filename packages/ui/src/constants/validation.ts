/** Field length limits — must mirror the column definitions in migrations */
export const LENGTH = {
  NAME_MAX: 200,
  SLUG_MAX: 220,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72,       // bcrypt hard limit
  DESCRIPTION_MAX: 2000,
  CATEGORY_NAME_MAX: 100,
  CATEGORY_SLUG_MAX: 120,
} as const;

/** Numeric bounds for product/order fields */
export const NUMERIC = {
  PRICE_MIN: 0.01,
  PRICE_MAX: 999_999_999.99,
  PRICE_DECIMALS: 2,
  STOCK_MIN: 0,
  STOCK_MAX: 999_999,
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 9_999,
} as const;

/** Zod-compatible error messages for form validation */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required.',
  EMAIL_INVALID: 'Enter a valid email address.',
  PASSWORD_MIN: `Password must be at least ${LENGTH.PASSWORD_MIN} characters.`,
  PASSWORD_MAX: `Password must not exceed ${LENGTH.PASSWORD_MAX} characters.`,
  PRICE_MIN: `Price must be at least $${NUMERIC.PRICE_MIN}.`,
  PRICE_MAX: `Price must not exceed $${NUMERIC.PRICE_MAX.toLocaleString()}.`,
  STOCK_MIN: 'Stock cannot be negative.',
  QUANTITY_MIN: 'Quantity must be at least 1.',
  SLUG_PATTERN: 'Slug may only contain lowercase letters, numbers, and hyphens.',
} as const;

/** Regex patterns */
export const PATTERNS = {
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
