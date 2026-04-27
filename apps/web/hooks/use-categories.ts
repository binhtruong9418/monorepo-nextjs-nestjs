'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateCategoryDto, QueryCategoryDto, UpdateCategoryDto } from '@repo/api/fe';
import { categoriesService } from '@/services/categories.service';
import { extractApiError } from '@/lib/extract-api-error';

export const CATEGORY_KEYS = {
  list: (params?: QueryCategoryDto) => ['categories', params] as const,
  detail: (id: number) => ['categories', id] as const,
};

export function useCategories(params?: QueryCategoryDto) {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () => categoriesService.getList(params),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: () => categoriesService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCategoryDto }) =>
      categoriesService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(id) });
      toast.success('Category updated');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}
