import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import {
  CategoryEntity,
  CategoryResponseDto,
  CreateCategoryDto,
  PageDto,
  PageMetaDto,
  QueryCategoryDto,
  UpdateCategoryDto,
  toCategoryDto,
} from '@repo/api';
import { ErrorCodes } from '@repo/api';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async findAll(query: QueryCategoryDto): Promise<PageDto<CategoryResponseDto>> {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where['status'] = query.status;
    }
    if (query.search) {
      where['name'] = ILike(`%${query.search}%`);
    }

    const [items, total] = await this.categoryRepo.findAndCount({
      where,
      skip: query.skip,
      take: query.limit,
      order: { [query.orderBy]: query.direction },
    });

    const meta = new PageMetaDto(query, total);
    return new PageDto(items.map(toCategoryDto), meta);
  }

  async findOne(id: number): Promise<CategoryResponseDto> {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(ErrorCodes.CATEGORY_NOT_FOUND);
    }
    return toCategoryDto(entity);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(ErrorCodes.CATEGORY_SLUG_EXISTS);
    }
    const entity = this.categoryRepo.create(dto);
    const saved = await this.categoryRepo.save(entity);
    return toCategoryDto(saved);
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(ErrorCodes.CATEGORY_NOT_FOUND);
    }

    if (dto.slug && dto.slug !== entity.slug) {
      const slugTaken = await this.categoryRepo.findOne({ where: { slug: dto.slug, id: Not(id) } });
      if (slugTaken) {
        throw new ConflictException(ErrorCodes.CATEGORY_SLUG_EXISTS);
      }
    }

    Object.assign(entity, dto);
    const saved = await this.categoryRepo.save(entity);
    return toCategoryDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(ErrorCodes.CATEGORY_NOT_FOUND);
    }
    await this.categoryRepo.softDelete(id);
  }
}
