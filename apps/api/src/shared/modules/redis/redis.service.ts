import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly pendingPromises: Partial<Record<string, Promise<unknown>>> = {};

  constructor(
    @Inject('REDIS')
    private readonly redisClient: RedisClientType,
  ) {}

  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
    const data = await this.redisClient.get(key);
    if (data == null) return defaultValue;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number | string): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const parsedTTL = this.parseTTL(ttl);
    if (parsedTTL) {
      await this.redisClient.setEx(key, parsedTTL, serialized);
    } else {
      await this.redisClient.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.redisClient.del(keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) > 0;
  }

  async getMany<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];
    const values = await this.redisClient.mGet(keys);
    return values.map((val) => {
      if (!val) return null;
      try {
        return JSON.parse(val) as T;
      } catch {
        return val as T;
      }
    });
  }

  /** Get from cache or execute factory and cache result. Deduplicates concurrent requests. */
  remember<T>(key: string, valueFactory: () => T | Promise<T>, ttl?: number | string): Promise<T> {
    const existing = this.pendingPromises[key] as Promise<T> | undefined;
    if (existing) return existing;

    return (this.pendingPromises[key] = (async () => {
      let value = await this.get<T>(key);
      if (value == null) {
        value = await valueFactory();
        if (value != undefined) {
          await this.set(key, value, ttl);
        } else {
          await this.del(key);
        }
      }
      return value as T;
    })()).finally(() => {
      delete this.pendingPromises[key];
    });
  }

  async increment(key: string, amount = 1): Promise<number> {
    return this.redisClient.incrBy(key, amount);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async expire(key: string, ttl: number | string): Promise<boolean> {
    const parsed = this.parseTTL(ttl);
    if (!parsed) return false;
    return Boolean(await this.redisClient.expire(key, parsed));
  }

  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  async clearByPattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) return 0;
    await this.delMany(keys);
    return keys.length;
  }

  get native(): RedisClientType {
    return this.redisClient;
  }

  private parseTTL(ttl: string | number | undefined): number | undefined {
    if (typeof ttl === 'undefined') return undefined;
    if (typeof ttl === 'number') return ttl;

    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid TTL format: ${ttl}. Use "5s", "10m", "1h", "7d"`);

    let value = parseInt(match[1]!, 10);
    switch (match[2]) {
      case 'm': value *= 60; break;
      case 'h': value *= 3600; break;
      case 'd': value *= 86400; break;
    }
    return value;
  }
}
