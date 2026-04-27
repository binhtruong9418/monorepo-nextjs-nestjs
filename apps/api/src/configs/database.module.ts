import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory() {
        return dataSourceOptions;
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return new DataSource(options);
      },
    }),
  ],
})
export class DatabaseModule {}
