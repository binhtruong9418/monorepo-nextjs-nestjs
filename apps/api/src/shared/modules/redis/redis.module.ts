import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: async (configService: ConfigService): Promise<RedisClientType> => {
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get('REDIS_PASSWORD', '');
        const db = configService.get<number>('REDIS_DB', 0);

        const client = createClient({
          socket: { host, port },
          password: password || undefined,
          database: db,
        }) as RedisClientType;

        client.on('error', (err) => console.error('Redis connection error:', err.message));
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS', RedisService],
})
export class RedisModule {}
