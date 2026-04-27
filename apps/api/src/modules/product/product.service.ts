import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import {
  CreateProductDto,
  PageDto,
  PageMetaDto,
  ProductEntity,
  ProductResponseDto,
  QueryProductDto,
  UpdateProductDto,
  toProductDto,
} from '@repo/api';
import { ErrorCodes } from '@repo/api';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async findAll(query: QueryProductDto): Promise<PageDto<ProductResponseDto>> {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where['status'] = query.status;
    }
    if (query.categoryId) {
      where['categoryId'] = query.categoryId;
    }
    if (query.search) {
      where['name'] = ILike(`%${query.search}%`);
    }

    const [items, total] = await this.productRepo.findAndCount({
      where,
      skip: query.skip,
      take: query.limit,
      order: { [query.orderBy]: query.direction },
    });

    const meta = new PageMetaDto(query, total);
    return new PageDto(items.map(toProductDto), meta);
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const entity = await this.productRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(ErrorCodes.PRODUCT_NOT_FOUND);
    }
    return toProductDto(entity);
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.productRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(ErrorCodes.PRODUCT_SLUG_EXISTS);
    }
    const entity = this.productRepo.create(dto);
    const saved = await this.productRepo.save(entity);
    return toProductDto(saved);
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const entity = await this.productRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(ErrorCodes.PRODUCT_NOT_FOUND);
    }

    if (dto.slug && dto.slug !== entity.slug) {
      const slugTaken = await this.productRepo.findOne({ where: { slug: dto.slug, id: Not(id) } });
      if (slugTaken) {
        throw new ConflictException(ErrorCodes.PRODUCT_SLUG_EXISTS);
      }
    }

    Object.assign(entity, dto);
    const saved = await this.productRepo.save(entity);
    return toProductDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.productRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(ErrorCodes.PRODUCT_NOT_FOUND);
    }
    await this.productRepo.softDelete(id);
  }
}
