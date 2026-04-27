export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: 'AUTH_001',
  TOKEN_EXPIRED: 'AUTH_002',
  UNAUTHORIZED: 'AUTH_003',
  FORBIDDEN: 'AUTH_004',
  REFRESH_TOKEN_INVALID: 'AUTH_005',

  // User
  USER_NOT_FOUND: 'USER_001',
  USER_ALREADY_EXISTS: 'USER_002',
  USER_INACTIVE: 'USER_003',
  USER_EMAIL_TAKEN: 'USER_004',

  // Category
  CATEGORY_NOT_FOUND: 'CAT_001',
  CATEGORY_SLUG_EXISTS: 'CAT_002',

  // Product
  PRODUCT_NOT_FOUND: 'PRD_001',
  PRODUCT_OUT_OF_STOCK: 'PRD_002',
  PRODUCT_INACTIVE: 'PRD_003',
  INSUFFICIENT_STOCK: 'PRD_004',
  PRODUCT_SLUG_EXISTS: 'PRD_005',

  // Order
  ORDER_NOT_FOUND: 'ORD_001',
  ORDER_ALREADY_CANCELLED: 'ORD_002',
  ORDER_CANNOT_CANCEL: 'ORD_003',
  ORDER_ALREADY_PAID: 'ORD_004',

  // Payment
  PAYMENT_FAILED: 'PAY_001',
  PAYMENT_NOT_FOUND: 'PAY_002',
  PAYMENT_ALREADY_REFUNDED: 'PAY_003',

  // General
  VALIDATION_ERROR: 'GEN_001',
  NOT_FOUND: 'GEN_002',
  INTERNAL_ERROR: 'GEN_003',
  DUPLICATE_ENTRY: 'GEN_004',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/** Human-readable messages keyed by error code. Used by the FE to display user-friendly errors. */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  AUTH_001: 'Invalid email or password.',
  AUTH_002: 'Your session has expired. Please sign in again.',
  AUTH_003: 'Authentication required. Please sign in.',
  AUTH_004: 'You do not have permission to perform this action.',
  AUTH_005: 'Invalid session. Please sign in again.',

  // User
  USER_001: 'User not found.',
  USER_002: 'An account with this email already exists.',
  USER_003: 'Your account is inactive. Please contact support.',
  USER_004: 'Email address is already taken.',

  // Category
  CAT_001: 'Category not found.',
  CAT_002: 'A category with this slug already exists.',

  // Product
  PRD_001: 'Product not found.',
  PRD_002: 'This product is out of stock.',
  PRD_003: 'This product is currently unavailable.',
  PRD_004: 'Insufficient stock for the requested quantity.',
  PRD_005: 'A product with this slug already exists.',

  // Order
  ORD_001: 'Order not found.',
  ORD_002: 'This order has already been cancelled.',
  ORD_003: 'This order cannot be cancelled.',
  ORD_004: 'This order has already been paid.',

  // Payment
  PAY_001: 'Payment failed. Please try again.',
  PAY_002: 'Payment record not found.',
  PAY_003: 'This payment has already been refunded.',

  // General
  GEN_001: 'Invalid input. Please check your data and try again.',
  GEN_002: 'The requested resource was not found.',
  GEN_003: 'An unexpected error occurred. Please try again.',
  GEN_004: 'This entry already exists.',
};
