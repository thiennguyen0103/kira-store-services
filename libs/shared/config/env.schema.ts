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

export const apiGatewayEnvSchema = Joi.object({
  ...baseEnvSchema,
  PORT: Joi.number().port().default(3000),
  USERS_GRPC_URL: grpcHostPort.required(),
  ORDERS_GRPC_URL: grpcHostPort.required(),
  PAYMENTS_GRPC_URL: grpcHostPort.required(),
  PRODUCTS_GRPC_URL: grpcHostPort.required(),
});

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
