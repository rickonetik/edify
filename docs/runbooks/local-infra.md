# Local Infrastructure Runbook

## Prerequisites

- Docker Desktop installed and running
- `docker compose` command available (Docker Compose V2)

## Setup

1. Copy environment file:

   ```bash
   cp .env.example .env
   ```

2. Start services:
   ```bash
   docker compose -f infra/docker-compose.yml --env-file .env up -d
   ```

## Verification

### Check Services Status

```bash
docker compose -f infra/docker-compose.yml ps
```

All services should be `running` and `healthy`.

### Postgres

```bash
psql -h localhost -p 5432 -U tracked -d tracked_lms -c "SELECT 1;"
```

Password: `tracked_password` (from .env)

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
docker compose -f infra/docker-compose.yml down
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

- **Postgres**: Port 5432 (configurable via POSTGRES_PORT)
- **Redis**: Port 6379 (configurable via REDIS_PORT)
- **MinIO API**: Port 9000 (configurable via MINIO_PORT)
- **MinIO Console**: Port 9001 (configurable via MINIO_CONSOLE_PORT)

## Troubleshooting

### Services not starting

- Check Docker Desktop is running
- Check ports are not already in use: `lsof -i :5432` (or other ports)
- Check logs: `docker compose -f infra/docker-compose.yml logs <service-name>`

### Health checks failing

- Wait a bit longer (healthchecks have retries)
- Check service logs for errors
- Verify .env file has correct values
