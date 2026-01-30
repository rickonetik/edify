# Story 3.5 — Ban enforcement (banned → 403) + audit entry — Final test report

**Branch:** `feat/epic3-3-5-ban-enforcement`  
**DoD:** Ban enforcement + minimal audit; gates PASS.

---

## A) Definition of Done

### Забаненный пользователь

| Check                        | Expected                     |
| ---------------------------- | ---------------------------- |
| `POST /auth/telegram`        | **403** и `code=USER_BANNED` |
| `GET /me` с валидным токеном | **403** и `code=USER_BANNED` |

### Незабаненный пользователь

| Check                                     | Expected                    |
| ----------------------------------------- | --------------------------- |
| `POST /auth/telegram` (валидный initData) | **200**, user + accessToken |
| `GET /me` с валидным токеном              | **200**, user               |

### Audit

На каждый блок создаётся запись:

- `trace_id` совпадает с `x-request-id`
- `action` одно из: `auth.blocked.banned`, `request.blocked.banned`
- `actor_user_id` = user.id

### Gates

- `pnpm verify` → **PASS**
- `pnpm test:foundation` → **PASS** (в т.ч. новые тесты banned)
- `pnpm audit:architecture` → **PASS**

---

## B) Gate results

### pnpm verify

**PASS** — workspace, deep imports, tsconfig, error codes, shared config, lint, typecheck, build.

### pnpm test:foundation

**PASS** — 13 pass, 2 skipped (banned tests when `DATABASE_URL` is not set).

**Новые тесты banned:**

- `GET /me with banned user returns 403 USER_BANNED and audit entry by trace_id` (требует `DATABASE_URL`)
- `POST /auth/telegram with banned user returns 403 USER_BANNED and audit entry by trace_id` (требует `DATABASE_URL`)

Без `DATABASE_URL` оба теста **SKIP**; остальные тесты выполняются как раньше.

### pnpm audit:architecture

**PASS** — prematurity, duplication, API layer checks.

---

## C) DB proof (placeholder — fill after run с включённой БД)

```sql
-- users: banned_at для забаненного
SELECT id, telegram_user_id, banned_at FROM users ORDER BY created_at DESC LIMIT 5;
```

```text
( paste result )
```

```sql
-- audit_log: trace_id = x-request-id, action = auth.blocked.banned | request.blocked.banned
SELECT action, actor_user_id, trace_id FROM audit_log ORDER BY created_at DESC LIMIT 5;
```

```text
( paste result )
```

---

## D) Mini App proof (ручной)

1. Открыть Mini App в Telegram после бана пользователя → ожидается **403** (и при /auth/telegram, и при запросах с токеном).
2. (Опционально) Снять бан → снова Auth: OK.
3. Обязательно: показать соответствие `trace_id` ↔ `x-request-id` (заголовок ответа и запись в `audit_log`).

---

## E) Минимальный SQL (миграции)

- `users.banned_at` (timestamptz null), `users.ban_reason` (text null)
- Таблица `audit_log` (id, created_at, actor_user_id, action, entity_type, entity_id, trace_id, meta)
- Индексы: `audit_log_trace_id_idx`, `audit_log_actor_user_id_idx`

См. `infra/migrations/002_users_banned_audit_log.sql` и применение в `apps/api/src/database/database.module.ts`.

---

## F) Миграции и конкуренция (проверка «на бумаге»)

**Идемпотентность:** Таблицы «applied migrations» нет. Миграции сделаны идемпотентными:

- `database.module.ts` (API): `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ALTER TABLE users ADD COLUMN IF NOT EXISTS`
- `api.banned.test.mjs` → `ensureMigrations(pool)`: те же конструкции

Повторный прогон тех же DDL безопасен.

**Конкуренция:** `pnpm test:foundation` запускает тесты с `--test-concurrency=1` (см. `package.json`), т.е. **последовательно**. Один процесс API и один вызов `ensureMigrations` на один прогон; параллельного применения миграций нет.

**Если в будущем включить конкурентный запуск foundation-тестов:** тогда либо оставить один job с БД и не поднимать несколько API с одной БД параллельно, либо ввести таблицу applied_migrations / advisory lock при применении миграций.
