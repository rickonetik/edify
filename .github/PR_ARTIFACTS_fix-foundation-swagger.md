# PR fix/foundation-swagger-tests-regression — Artifacts

## Почему падало

- Swagger не включался в test-run из-за неверного NODE_ENV/SWAGGER_ENABLED в helper'е или перетирания из .env.
- В результате /docs не монтировался → 404.

## Изменения

1. **tools/tests/foundation/\_utils/api-process.mjs**
   - NODE_ENV и SWAGGER_ENABLED не копируются из родительского процесса в `processEnv`.
   - После сборки `processEnv` явно выставляются: `processEnv.NODE_ENV = effectiveNodeEnv`, `processEnv.SWAGGER_ENABLED = swaggerEnabled ? '1' : '0'`.
   - При `swaggerEnabled: true` всегда `effectiveNodeEnv = 'development'`.
   - Убран вывод stderr в консоль по умолчанию.

2. **tools/tests/foundation/api.swagger.test.mjs**
   - Для кейсов "GET /docs returns 200 in development mode" и "SWAGGER_ENABLED parsing: \"1\" and \"true\" are truthy" используется `fetch(url, { redirect: 'manual' })`, чтобы не следовать редиректу на /docs/ и не путать asserts.

3. **apps/api/src/load-env.ts**
   - До `config(...)` сохраняются `NODE_ENV` и `SWAGGER_ENABLED` (если заданы).
   - После всех `config(...)` они восстанавливаются, чтобы .env не перезаписывал явные переменные теста/процесса.

## Проверка (stdout)

### pnpm test:foundation

```
✔ GET /nope returns 404 with unified error format
✔ GET /health/400 returns 400 with validation error format
✔ GET /health returns 200 with correct format
✔ GET /health includes x-request-id header
✔ GET /me without auth returns 401 with unified error format
✔ GET /me with invalid token returns 401 unified error (NOT 500)
✔ GET /docs returns 200 in development mode
✔ GET /docs returns 404 with error format in production mode
✔ SWAGGER_ENABLED parsing: "0" and "false" are falsy
✔ SWAGGER_ENABLED parsing: "1" and "true" are truthy
✔ cleanupOldScrollKeys removes oldest keys when limit exceeded
✔ cleanupOldScrollKeys does nothing when limit not exceeded
✔ cleanupOldScrollKeys handles exactly 50 keys
ℹ tests 13, pass 13, fail 0
```

### pnpm verify

✅ All quality gates passed (workspace, deep imports, lint, typecheck, build).

### pnpm audit:architecture

✅ Architecture Freeze Audit: PASSED.
