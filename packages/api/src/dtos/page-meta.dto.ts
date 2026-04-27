import { PageOptionsDto } from './page-option.dto';

export class PageMetaDto {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor(pageOptionsDto: PageOptionsDto, itemCount: number) {
    this.page = pageOptionsDto.page;
    this.limit = pageOptionsDto.limit;
    this.totalItems = +itemCount;
    this.totalPages = Math.ceil(this.totalItems / pageOptionsDto.limit);
    this.hasPreviousPage = pageOptionsDto.page > 1;
    this.hasNextPage = pageOptionsDto.page < this.totalPages;
  }
}
