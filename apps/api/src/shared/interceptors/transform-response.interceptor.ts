import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageMetaDto } from '@repo/api';

export interface IResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMetaDto;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        const result = {
          success: true,
          message: 'success',
        } as IResponse<T>;

        if (response && typeof response === 'object' && response?.data) {
          result.data = response.data;
          if (response?.meta) result.meta = response.meta;
        } else {
          result.data = response;
        }

        return result;
      }),
    );
  }
}
