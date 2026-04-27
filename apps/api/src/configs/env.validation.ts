import { plainToClass, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum EEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

class EnvironmentVariables {
  @IsEnum(EEnvironment)
  declare NODE_ENV: EEnvironment;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  declare PORT: number;

  @IsString()
  declare DB_HOST: string;

  @IsNumber()
  @Type(() => Number)
  declare DB_PORT: number;

  @IsString()
  declare DB_USERNAME: string;

  @IsString()
  declare DB_PASSWORD: string;

  @IsString()
  declare DB_DATABASE: string;

  @IsString()
  declare JWT_SECRET: string;

  @IsString()
  @IsOptional()
  declare JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  declare JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  declare REDIS_HOST: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  declare REDIS_PORT: number;

  @IsString()
  @IsOptional()
  declare REDIS_PASSWORD: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  REDIS_DB = 0;

  @IsString()
  @IsOptional()
  declare CORS_ORIGINS: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
