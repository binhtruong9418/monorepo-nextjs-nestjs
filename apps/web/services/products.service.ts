import api from '@/lib/axios';
import type { ApiResponse, PageResult } from '@/types/api.types';
import type {
  CreateProductDto,
  ProductResponseDto,
  QueryProductDto,
  UpdateProductDto,
} from '@repo/api/fe';
import { API_PATHS } from '@/constants/api-paths';

export const productsService = {
  async getList(params?: QueryProductDto): Promise<PageResult<ProductResponseDto>> {
    const { data } = await api.get<ApiResponse<ProductResponseDto[]>>(API_PATHS.PRODUCTS.ROOT, {
      params,
    });
    return { data: data.data, meta: data.meta! };
  },

  async getOne(id: number): Promise<ProductResponseDto> {
    const { data } = await api.get<ApiResponse<ProductResponseDto>>(API_PATHS.PRODUCTS.BY_ID(id));
    return data.data;
  },

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const { data } = await api.post<ApiResponse<ProductResponseDto>>(API_PATHS.PRODUCTS.ROOT, dto);
    return data.data;
  },

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const { data } = await api.patch<ApiResponse<ProductResponseDto>>(
      API_PATHS.PRODUCTS.BY_ID(id),
      dto,
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(API_PATHS.PRODUCTS.BY_ID(id));
  },
};
