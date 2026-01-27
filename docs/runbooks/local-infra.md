# Local Infrastructure Runbook

## Prerequisites

- Docker Desktop installed and running
- `docker compose` command available (Docker Compose V2)

## Quick Start

Use the convenience script to start everything:

```bash
pnpm dev:all
```

This will:

1. Start Docker Compose services (Postgres, Redis, MinIO)
2. Run database migrations
3. Start the API server

**Note:** Docker Postgres uses port **5433** (not 5432), so there's no conflict with local Homebrew Postgres. You can run both simultaneously if needed.

## Setup

1. Copy environment file:

   ```bash
   cp .env.example .env
   ```

2. Start services:
   ```bash
   pnpm infra:up
   # or manually:
   docker compose -f infra/docker-compose.yml --env-file .env up -d postgres redis minio
   ```

## Verification

### Check Services Status

```bash
docker compose -f infra/docker-compose.yml ps
```

All services should be `running` and `healthy`.

### Postgres

```bash
psql -h localhost -p 5433 -U tracked -d tracked_lms -c "SELECT 1;"
```

Password: `tracked_password` (from .env)

Or use `DATABASE_URL` from `.env`:

```bash
psql "$DATABASE_URL" -c "SELECT 1;"
```

### Redis

```bash
redis-cli -h localhost -p 6379 ping
```

Should return: `PONG`

### MinIO

1. Open MinIO Console: http://localhost:9001
2. Login with credentials from .env:
   - Username: `minio`
   - Password: `minio_password`
3. Verify bucket `tracked-dev` exists

## Stop Services

```bash
pnpm infra:down
# or manually:
docker compose -f infra/docker-compose.yml down -v
```

## Clean Data (⚠️ Destructive)

To remove all volumes and data:

```bash
docker compose -f infra/docker-compose.yml down -v
```

Or remove specific volumes:

```bash
docker volume rm tracked-lms_pg_data
docker volume rm tracked-lms_redis_data
docker volume rm tracked-lms_minio_data
```

**Warning:** This will delete all database data, Redis cache, and MinIO objects.

## Services

- **Postgres**: Port **5433** (Docker maps 5433→5432 to avoid conflicts with local Postgres)
- **Redis**: Port 6379
- **MinIO API**: Port 9000
- **MinIO Console**: Port 9001

## Database Migrations

Run migrations after starting Postgres:

```bash
pnpm db:migrate
# or manually:
psql "$DATABASE_URL" -f infra/migrations/001_create_users_table.sql
```

## Troubleshooting

### Services not starting

- Check Docker Desktop is running
- Check ports are not already in use: `lsof -i :5433` (or other ports)
- Check logs: `docker compose -f infra/docker-compose.yml logs <service-name>`
- Run preflight check: `node tools/dev/preflight-db.mjs`

### Health checks failing

- Wait a bit longer (healthchecks have retries)
- Check service logs for errors
- Verify .env file has correct values
