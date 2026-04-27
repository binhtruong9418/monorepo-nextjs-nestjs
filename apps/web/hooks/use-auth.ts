'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/lib/auth-store';
import { extractApiError } from '@/lib/extract-api-error';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      router.push('/dashboard');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      router.push('/login');
    },
  });
}
