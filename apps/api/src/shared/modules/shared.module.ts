import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurationModule } from '../../configs/config.module';
import { DatabaseModule } from '../../configs/database.module';
import { BullQueueModule } from './bullmq/bull-queue.module';
import { RedisModule } from './redis/redis.module';
import { GatewayModule } from '../gateways/gateway.module';

@Global()
@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    RedisModule,
    BullQueueModule,
    GatewayModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          // @nestjs/jwt v11 expects StringValue (branded ms type) — cast required
          expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', '15m') as unknown as number,
        },
      }),
    }),
  ],
  exports: [GatewayModule, JwtModule],
})
export class SharedModule {}
