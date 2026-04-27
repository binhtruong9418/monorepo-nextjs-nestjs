export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
