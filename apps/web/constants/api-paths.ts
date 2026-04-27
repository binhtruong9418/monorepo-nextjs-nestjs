/** API path constants — base is /api/v1, proxied by Next.js rewrites to the backend. */
export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
  },
  PRODUCTS: {
    ROOT: '/api/v1/products',
    BY_ID: (id: number) => `/api/v1/products/${id}`,
  },
  CATEGORIES: {
    ROOT: '/api/v1/categories',
    BY_ID: (id: number) => `/api/v1/categories/${id}`,
  },
} as const;
