# EPIC 0 — Final RC Test Run

**Purpose**: Verify that Foundation (EPIC 0) is ready for EPIC 1.

**When to run**: Before starting any Story in EPIC 1.

**Prerequisites**: Working tree must be clean (`git status` shows no uncommitted changes).

## 0. Prerequisites

```bash
git status
```

**Expected**: `working tree clean`

**If not clean**: Commit or stash changes first.

## 1. "Golden Run" (Main Check)

```bash
pnpm i --frozen-lockfile
pnpm verify
pnpm test:foundation
pnpm audit:architecture
```

### Expected Results

- ✅ `pnpm verify` → PASS
- ✅ `pnpm test:foundation` → PASS (6/6 tests)
- ✅ `pnpm audit:architecture` → PASS

### If Something Fails

- **verify failed** → Blocker, fix before EPIC 1
- **test:foundation failed** → Blocker (Foundation must be deterministic)
- **audit:architecture failed** → Blocker (prevents duplicates/over-complication)

## 2. Infrastructure (Manual Gate, but Required)

### Start Infrastructure

```bash
cp -n .env.example .env || true
docker compose -f infra/docker-compose.yml --env-file .env up -d
docker compose -f infra/docker-compose.yml ps
```

**Expected**: `postgres`, `redis`, `minio`, `minio-init` in `running/healthy` status (init may show `exited 0`, that's normal).

### Service Checks

#### Postgres

```bash
psql "$DATABASE_URL" -c "select 1;"
```

**Expected**: Returns `1` row.

#### Redis

```bash
redis-cli -u "$REDIS_URL" ping
```

**Expected**: Returns `PONG`.

#### MinIO

1. Open MinIO console at port from `.env` (usually `http://localhost:9001`)
2. Verify bucket is created (name from `.env`)

**If services don't start**: Check Docker/ports/.env configuration.

## 3. API Smoke (As User)

### Start API (Using Correct Scripts)

```bash
pnpm dev:api
```

In another terminal:

```bash
curl -i http://localhost:${API_PORT:-3001}/health
```

**Expected**:

- `HTTP/1.1 200 OK`
- Header `x-request-id` present
- Body: `{"ok":true,"env":"development","version":"0.0.0"}`

### Error Format Check

```bash
curl -i http://localhost:${API_PORT:-3001}/nope
```

**Expected**:

- Status: `404`
- JSON: `{ statusCode, code: "NOT_FOUND", message, traceId }`
- Header `x-request-id` present and matches `traceId` (or correctly generated)

### Swagger Gating

#### Dev Mode

```bash
curl -i http://localhost:${API_PORT:-3001}/docs | head
```

**Expected**: `200 OK` (HTML content).

#### Prod Mode

```bash
NODE_ENV=production pnpm start:api
# In another terminal:
curl -i http://localhost:${API_PORT:-3001}/docs
```

**Expected**: `404 NOT_FOUND` in unified error format.

## 4. WebApp Smoke

```bash
pnpm dev:webapp
```

Check in browser:

- ✅ `/` redirects to `/learn`
- ✅ `/library` opens
- ✅ `/account` opens
- ✅ Tab bar doesn't overlap content (safe-area at bottom)

**Additional**: Open via ngrok (if already set up):

```bash
pnpm dev:public
```

## 5. Bot Smoke

### Positive Test

```bash
BOT_TOKEN=... pnpm --filter @tracked/bot start
```

**Expected**:

- Bot starts successfully
- `/start` command responds

### Negative Test (Required)

```bash
pnpm --filter @tracked/bot start
```

**Expected**: Bot does NOT start and complains about `BOT_TOKEN` (without leaking token).

## 6. CI Smoke (GitHub)

Check latest workflow run in Actions:

- ✅ Latest run is green
- ✅ Logs show `pnpm verify` + sanity list of packages

## Final Checklist for EPIC 1 Stories

**Before starting ANY Story in EPIC 1, Cursor must attach:**

1. **Output of commands:**

   ```bash
   pnpm verify
   pnpm test:foundation
   pnpm audit:architecture
   ```

2. **Screenshot (or log) from Actions** showing green run on `main`

3. **Manual smoke test results:**
   - `curl /health` (showing `x-request-id`)
   - `/docs` returns `200` in dev, `404` in prod

**If any of these fail, the Story cannot start.**

## Summary

- [ ] Working tree clean
- [ ] `pnpm verify` PASS
- [ ] `pnpm test:foundation` PASS (6/6)
- [ ] `pnpm audit:architecture` PASS
- [ ] Infrastructure services running
- [ ] API `/health` returns 200 with `x-request-id`
- [ ] API `/nope` returns 404 with unified error format
- [ ] API `/docs` returns 200 in dev, 404 in prod
- [ ] WebApp routes work, safe-area correct
- [ ] Bot validation works, token not leaked
- [ ] CI latest run on `main` is green

**If all checks pass → Ready for EPIC 1** 🚀
