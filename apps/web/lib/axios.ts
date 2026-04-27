import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';

// Client: empty baseURL — Next.js rewrites proxy /api/* to the real API server.
// Server (SSR): bypass rewrites and call the API directly.
const baseURL =
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000')
    : '';

const instance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      Cookies.remove(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export { TOKEN_KEY };
export default instance;
