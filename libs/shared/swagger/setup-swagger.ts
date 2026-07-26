import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  options: { title: string; description?: string; version?: string },
): void {
  if (process.env.NODE_ENV === 'production') return;

  const config = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description ?? '')
    .setVersion(options.version ?? '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from login / refresh / verify-email',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
  });
}
