import api from '@/lib/axios';
import type { ApiResponse, PageResult } from '@/types/api.types';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
  QueryCategoryDto,
  UpdateCategoryDto,
} from '@repo/api/fe';
import { API_PATHS } from '@/constants/api-paths';

export const categoriesService = {
  async getList(params?: QueryCategoryDto): Promise<PageResult<CategoryResponseDto>> {
    const { data } = await api.get<ApiResponse<CategoryResponseDto[]>>(API_PATHS.CATEGORIES.ROOT, {
      params,
    });
    return { data: data.data, meta: data.meta! };
  },

  async getOne(id: number): Promise<CategoryResponseDto> {
    const { data } = await api.get<ApiResponse<CategoryResponseDto>>(
      API_PATHS.CATEGORIES.BY_ID(id),
    );
    return data.data;
  },

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const { data } = await api.post<ApiResponse<CategoryResponseDto>>(
      API_PATHS.CATEGORIES.ROOT,
      dto,
    );
    return data.data;
  },

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const { data } = await api.patch<ApiResponse<CategoryResponseDto>>(
      API_PATHS.CATEGORIES.BY_ID(id),
      dto,
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(API_PATHS.CATEGORIES.BY_ID(id));
  },
};
