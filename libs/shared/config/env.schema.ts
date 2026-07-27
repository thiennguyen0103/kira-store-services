import Joi from 'joi';

const grpcHostPort = Joi.string()
  .pattern(/^.+:\d+$/)
  .messages({
    'string.pattern.base':
      '{{#label}} must be a host:port value (e.g. localhost:5001)',
  });

const baseEnvSchema = {
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
  LOKI_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional(),
  RABBITMQ_URL: Joi.string()
    .uri({ scheme: ['amqp', 'amqps'] })
    .required(),
};

const postgresEnvSchema = {
  DB_HOST: Joi.string().hostname().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
};

/** Spread into any service schema that imports `MailModule`. */
export const emailEnvSchema = {
  /** When set, mail is sent via Resend; otherwise logged to the console. */
  RESEND_API_KEY: Joi.string().allow('').optional(),
  EMAIL_FROM: Joi.string().default('Kira Store <onboarding@resend.dev>'),
};

export const apiGatewayEnvSchema = Joi.object({
  ...baseEnvSchema,
  PORT: Joi.number().port().default(3000),
  USERS_GRPC_URL: grpcHostPort.required(),
  ORDERS_GRPC_URL: grpcHostPort.required(),
  PAYMENTS_GRPC_URL: grpcHostPort.required(),
  PRODUCTS_GRPC_URL: grpcHostPort.required(),
  IDENTITY_GRPC_URL: grpcHostPort.required(),
  MEDIA_GRPC_URL: grpcHostPort.required(),
});

const s3EnvSchema = {
  S3_ENDPOINT: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  /** Host clients use for PUT (defaults to S3_ENDPOINT when omitted). */
  S3_PRESIGN_ENDPOINT: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional(),
  S3_REGION: Joi.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: Joi.string().required(),
  S3_SECRET_ACCESS_KEY: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  S3_FORCE_PATH_STYLE: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),
  S3_PUBLIC_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  S3_PRESIGN_TTL_SECONDS: Joi.number().integer().min(60).max(3600).default(300),
};

export const usersServiceEnvSchema = Joi.object({
  ...baseEnvSchema,
  ...postgresEnvSchema,
  PORT: Joi.number().port().default(3001),
  USERS_GRPC_URL: grpcHostPort.required(),
});

export const ordersServiceEnvSchema = Joi.object({
  ...baseEnvSchema,
  ...postgresEnvSchema,
  PORT: Joi.number().port().default(3002),
  ORDERS_GRPC_URL: grpcHostPort.required(),
});

export const paymentsServiceEnvSchema = Joi.object({
  ...baseEnvSchema,
  ...postgresEnvSchema,
  PORT: Joi.number().port().default(3003),
  PAYMENTS_GRPC_URL: grpcHostPort.required(),
});

export const productsServiceEnvSchema = Joi.object({
  ...baseEnvSchema,
  ...postgresEnvSchema,
  PORT: Joi.number().port().default(3004),
  PRODUCTS_GRPC_URL: grpcHostPort.required(),
});

export const identityServiceEnvSchema = Joi.object({
  ...baseEnvSchema,
  ...postgresEnvSchema,
  ...emailEnvSchema,
  PORT: Joi.number().port().default(3005),
  IDENTITY_GRPC_URL: grpcHostPort.required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  APP_PUBLIC_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:3000'),
});

export const mediaServiceEnvSchema = Joi.object({
  ...baseEnvSchema,
  ...postgresEnvSchema,
  ...s3EnvSchema,
  PORT: Joi.number().port().default(3006),
  MEDIA_GRPC_URL: grpcHostPort.required(),
});
