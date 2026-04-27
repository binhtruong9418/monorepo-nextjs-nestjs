import { Repository } from 'typeorm';

export class BaseRepository<T extends { id: number }> extends Repository<T> {
  async findBatch(fromId: number, count: number): Promise<T[]> {
    return this.createQueryBuilder('entity')
      .where('entity.id > :fromId', { fromId })
      .orderBy('entity.id', 'ASC')
      .take(count)
      .getMany();
  }

  async findOneByIdOrFail(id: number): Promise<T> {
    return this.createQueryBuilder('entity').where('entity.id = :id', { id }).getOneOrFail();
  }
}
