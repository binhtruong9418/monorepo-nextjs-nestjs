'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateProductDto, QueryProductDto, UpdateProductDto } from '@repo/api/fe';
import { productsService } from '@/services/products.service';
import { extractApiError } from '@/lib/extract-api-error';

export const PRODUCT_KEYS = {
  list: (params?: QueryProductDto) => ['products', params] as const,
  detail: (id: number) => ['products', id] as const,
};

export function useProducts(params?: QueryProductDto) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productsService.getList(params),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productsService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProductDto }) =>
      productsService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) });
      toast.success('Product updated');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: (err) => {
      toast.error(extractApiError(err));
    },
  });
}
