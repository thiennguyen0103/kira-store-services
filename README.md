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

## Quick start (recommended)

**Hybrid:** Docker for infra only, Nest apps on the host. Fastest on Windows (avoids slow bind mounts into containers).

```bash
pnpm install
# copy env examples once (see below)
pnpm dev                 # docker:up + all Nest apps with --watch
```

Or step by step:

```bash
pnpm docker:up           # Postgres, RabbitMQ, MinIO, Loki, Grafana
pnpm dev:apps            # all 7 Nest services on the host
```

| Resource      | URL                                                 |
| ------------- | --------------------------------------------------- |
| API Gateway   | http://localhost:3000                               |
| Swagger       | http://localhost:3000/docs                          |
| RabbitMQ UI   | http://localhost:15672 (`guest` / `guest`)          |
| Grafana       | http://localhost:3200                               |
| MinIO Console | http://localhost:9001 (`minioadmin` / `minioadmin`) |
| Seeded admin  | `admin@kira.store` / `Admin123!` (dev only)         |

### Full stack in Docker

Use when you want everything containerized (slower file watching on Windows):

```bash
pnpm docker:dev          # start (builds shared image once via identity-service)
pnpm docker:dev:build    # force rebuild shared image (no cache), then up
```

```bash
pnpm docker:dev:logs     # follow logs
pnpm docker:dev:ps       # container status
pnpm docker:dev:down     # stop stack
pnpm docker:dev:reset    # stop + wipe volumes
```

All Nest services share one image (`kira-nest-dev:latest`), built only by `identity-service` so Compose does not race tagging the same image. Use `docker:dev:build` after `Dockerfile.dev` / lockfile changes.

### Env setup (once)

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

Payment providers need real credentials in `apps/payments-service/.env` (`STRIPE_*`, `PAYOS_*`) when exercising checkout flows.

**Tip (Windows):** clone/run the repo from the WSL filesystem (`\\wsl$\...`) if you still use `docker:dev` — bind mounts from `/mnt/c` are much slower.

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

| Script                  | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `pnpm build`            | Build Nest projects                                   |
| `pnpm start:dev`        | Start default app (api-gateway) in watch mode         |
| `pnpm lint`             | Oxlint (type-aware) + Prettier check                  |
| `pnpm format`           | Prettier write                                        |
| `pnpm test`             | Unit tests (Jest)                                     |
| `pnpm test:cov`         | Coverage                                              |
| `pnpm generate:proto`   | Regenerate TypeScript from `.proto` files             |
| `pnpm docker:up`        | Infra only (Postgres, RabbitMQ, MinIO, Loki, Grafana) |
| `pnpm dev` / `dev:apps` | Recommended: infra + host Nest apps with watch        |
| `pnpm docker:dev`       | Full stack in Docker (one shared image build)         |
| `pnpm docker:dev:build` | Force rebuild shared Nest image (no cache), then up   |

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
