# Kira Store Services

NestJS monorepo powering the Kira Store backend. Services communicate over **gRPC** for synchronous calls and **RabbitMQ** for domain events, behind a single HTTP **API gateway**.

## Architecture

```
                    ┌─────────────────┐
                    │   API Gateway   │  :3000  (HTTP + Swagger)
                    │   /docs         │
                    └────────┬────────┘
                             │ gRPC
        ┌──────────┬─────────┼─────────┬──────────┬──────────┐
        ▼          ▼         ▼         ▼          ▼          ▼
   Identity    Users     Orders   Payments   Products     Media
    :5005      :5001      :5002     :5003      :5004      :5006
        │          │         │         │          │          │
        └──────────┴─────────┴────┬────┴──────────┴──────────┘
                                  │
                         RabbitMQ (events)
                                  │
                    PostgreSQL · MinIO · Loki/Grafana
```

Each domain service follows a layered layout (presentation → application/CQRS → domain → infrastructure) and owns its own PostgreSQL database.

| Service            | HTTP | gRPC | Database        | Responsibility                     |
| ------------------ | ---: | ---: | --------------- | ---------------------------------- |
| `api-gateway`      | 3000 |    — | —               | Public REST API, auth, routing     |
| `users-service`    | 3001 | 5001 | `kira_users`    | Profiles & customer data           |
| `orders-service`   | 3002 | 5002 | `kira_orders`   | Cart, checkout, order lifecycle    |
| `payments-service` | 3003 | 5003 | `kira_payments` | Stripe / PayOS payments & webhooks |
| `products-service` | 3004 | 5004 | `kira_products` | Catalog & stock reservation        |
| `identity-service` | 3005 | 5005 | `kira_identity` | Auth, JWT, email verification      |
| `media-service`    | 3006 | 5006 | `kira_media`    | Uploads via S3-compatible storage  |

Shared code lives in `libs/shared` (proto contracts, events, config, logging, mail, DTOs).

## Tech stack

- **Runtime:** Node.js, TypeScript, NestJS 11 (CQRS)
- **Transport:** gRPC (`@grpc/grpc-js`), RabbitMQ
- **Data:** PostgreSQL 16, TypeORM
- **Storage:** MinIO (S3-compatible)
- **Payments:** Stripe, PayOS
- **Observability:** Pino → Loki, Grafana
- **Tooling:** pnpm, Jest, Oxlint, Prettier, Lefthook, Commitlint

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 11 (`packageManager` is pinned in `package.json`)
- Docker & Docker Compose

## Quick start (Docker)

Full stack (infra + all Nest apps with hot reload):

```bash
pnpm install
pnpm docker:dev
```

| Resource      | URL                                                 |
| ------------- | --------------------------------------------------- |
| API Gateway   | http://localhost:3000                               |
| Swagger       | http://localhost:3000/docs                          |
| RabbitMQ UI   | http://localhost:15672 (`guest` / `guest`)          |
| Grafana       | http://localhost:3200                               |
| MinIO Console | http://localhost:9001 (`minioadmin` / `minioadmin`) |
| Seeded admin  | `admin@kira.store` / `Admin123!` (dev only)         |

Useful commands:

```bash
pnpm docker:dev:logs    # follow logs
pnpm docker:dev:ps      # container status
pnpm docker:dev:down    # stop stack
pnpm docker:dev:reset   # stop + wipe volumes
```

Infra only (Postgres, RabbitMQ, Loki, Grafana, MinIO):

```bash
pnpm docker:up
```

## Local development (host)

1. Start infrastructure:

   ```bash
   pnpm docker:up
   ```

2. Copy env examples per service:

   ```bash
   cp .env.example .env
   cp apps/api-gateway/.env.example apps/api-gateway/.env
   cp apps/identity-service/.env.example apps/identity-service/.env
   cp apps/users-service/.env.example apps/users-service/.env
   cp apps/orders-service/.env.example apps/orders-service/.env
   cp apps/payments-service/.env.example apps/payments-service/.env
   cp apps/products-service/.env.example apps/products-service/.env
   cp apps/media-service/.env.example apps/media-service/.env
   ```

3. Install and run services (separate terminals):

   ```bash
   pnpm install
   pnpm exec nest start api-gateway --watch
   pnpm exec nest start identity-service --watch
   # …repeat for users, orders, payments, products, media
   ```

Payment providers need real credentials in `apps/payments-service/.env` (`STRIPE_*`, `PAYOS_*`) when exercising checkout flows.

## Project structure

```
apps/
  api-gateway/          # HTTP edge
  identity-service/
  users-service/
  orders-service/
  payments-service/
  products-service/
  media-service/
libs/
  shared/
    proto/              # .proto contracts
    generated/          # ts-proto output
    events/             # cross-service domain events
    config/ logging/ mail/ …
infra/
  postgres/ loki/ grafana/
docker-compose.yml      # infrastructure
docker-compose.dev.yml  # Nest apps overlay
```

## Scripts

| Script                | Description                                   |
| --------------------- | --------------------------------------------- |
| `pnpm build`          | Build Nest projects                           |
| `pnpm start:dev`      | Start default app (api-gateway) in watch mode |
| `pnpm lint`           | Oxlint (type-aware) + Prettier check          |
| `pnpm format`         | Prettier write                                |
| `pnpm test`           | Unit tests (Jest)                             |
| `pnpm test:cov`       | Coverage                                      |
| `pnpm generate:proto` | Regenerate TypeScript from `.proto` files     |
| `pnpm docker:dev`     | Infra + apps with hot reload                  |

After changing files under `libs/shared/proto/`, regenerate clients:

```bash
pnpm generate:proto
```

## Testing & quality

```bash
pnpm test
pnpm test:watch
pnpm lint
```

Git hooks (Lefthook) install on `pnpm install` via `prepare`. Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (Commitlint).

## Configuration

- Root `.env.example` — Docker Compose port/credential overrides
- `apps/*/.env.example` — per-service Nest configuration (gRPC URLs, DB, secrets)

Do not commit `.env` files or real payment/API secrets.

### Admin seed (identity-service)

On startup, identity-service creates an **ACTIVE `ADMIN`** account when both `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set (skipped if the email already exists). The `user.registered` event also creates a matching profile in users-service.

| Variable                | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `SEED_ADMIN_EMAIL`      | Admin login email (required to seed)          |
| `SEED_ADMIN_PASSWORD`   | Plain password (letter + number, 8–128 chars) |
| `SEED_ADMIN_FIRST_NAME` | Defaults to `Admin`                           |
| `SEED_ADMIN_LAST_NAME`  | Defaults to `User`                            |

Leave the email/password unset in production unless you intentionally want a bootstrap admin.

## License

UNLICENSED — private project.
