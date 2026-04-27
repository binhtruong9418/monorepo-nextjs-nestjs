import type { PageMetaDto } from '@repo/api/fe';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMetaDto;
}

export interface PageResult<T> {
  data: T[];
  meta: PageMetaDto;
}
