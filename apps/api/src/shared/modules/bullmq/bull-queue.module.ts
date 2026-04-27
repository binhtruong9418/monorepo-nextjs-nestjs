import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', '') || undefined,
          db: configService.get<number>('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class BullQueueModule {}
