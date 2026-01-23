# EPIC Outline — tracked-lms

## EPIC 0 — Foundation

### 0.1 Monorepo scaffold (pnpm + turbo)

**Status:** ✅ Completed  
**PR:** chore/monorepo-scaffold

**Выполнено:**

- Инициализация git репозитория
- Создан `.gitignore` (node_modules, dist, .env, .turbo, coverage и т.д.)
- Root workspace файлы:
  - `pnpm-workspace.yaml` (apps/_, packages/_)
  - `package.json` (root) с turbo и scripts
  - `turbo.json` с tasks (build, typecheck, lint, dev, clean)
  - `tsconfig.base.json` с baseUrl и paths (@shared/\*)
  - `README.md` (root) с базовыми командами
- Структура папок:
  - `apps/api` (TypeScript stub)
  - `apps/webapp` (Vite + React + TS)
  - `apps/bot` (TypeScript stub)
  - `packages/shared` (TypeScript library)
  - `infra/` (пустая)
  - `docs/runbooks/` (пустая)
  - `tools/ngrok/` (пустая)
  - `.cursor/` (rules.mdc уже был)
- apps/api:
  - `package.json` (@tracked/api, scripts: dev/build/typecheck/lint/clean)
  - `tsconfig.json` (extends base, outDir: dist)
  - `src/main.ts` (console.log stub)
  - `README.md`
- apps/bot:
  - `package.json` (@tracked/bot, scripts: dev/build/typecheck/lint/clean)
  - `tsconfig.json` (extends base, outDir: dist)
  - `src/index.ts` (console.log stub)
  - `README.md`
- apps/webapp:
  - Создан через `pnpm create vite webapp --template react-ts`
  - `package.json` (name: @tracked/webapp, добавлены typecheck и clean)
  - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` (Vite scaffold)
  - `vite.config.ts` (Vite scaffold)
  - `README.md`
- packages/shared:
  - `package.json` (@tracked/shared, main/types, scripts: build/typecheck/lint/clean)
  - `tsconfig.json` (extends base, declaration: true, outDir: dist)
  - `src/index.ts` (export const sharedOk = true)
  - `README.md`

**Проверено:**

- ✅ `pnpm i` проходит
- ✅ `pnpm -w build` проходит (4 пакета: api, bot, webapp, shared)
- ✅ `pnpm -w typecheck` проходит (4 пакета)
- ✅ Все dist/ папки создаются после build

**Git:**

- Ветка: `chore/monorepo-scaffold`
- Коммит: `602917b chore: monorepo scaffold (Story 0.1)`

### 0.2 Lint/format baseline + husky + lint-staged

**Status:** ✅ Completed  
**PR:** chore/lint-format-baseline

**Выполнено:**

- Добавлены devDependencies в root package.json:
  - ESLint: eslint, @eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-import, globals
  - Prettier: prettier, eslint-config-prettier
  - Husky: husky, lint-staged
- Созданы конфиги:
  - `.editorconfig` (UTF-8, LF, 2 spaces, trim trailing whitespace)
  - `prettier.config.cjs` (semi, singleQuote, trailingComma: all, printWidth: 100)
  - `eslint.config.mjs` (flat config, TS/React rules, ignores для .cjs файлов, no-explicit-any: warn)
  - `.lintstagedrc.cjs` (eslint --fix + prettier для TS/JS, prettier для остального)
- Настроен husky:
  - `.husky/pre-commit` hook запускает `pnpm lint-staged`
  - `prepare` script в root package.json
- Обновлены scripts:
  - Root: `prepare`, `lint`, `lint:fix`, `format`
  - Все пакеты: `lint` заменён с `echo "lint later"` на `eslint .`
- Обновлён `.cursor/rules/rules.mdc`:
  - Добавлены строки про epic order и scope boundaries

**Исправления:**

- ✅ `eslint.config.js` → `eslint.config.mjs` (убрано warning про module type)
- ✅ `@typescript-eslint/no-explicit-any: 'warn'` добавлен в правила

**Проверено:**

- ✅ `pnpm lint` проходит без warnings про module type
- ✅ `pnpm format` работает, форматирует файлы
- ✅ Pre-commit hook запускается и форматирует staged файлы
- ✅ Pre-commit hook блокирует коммит при ESLint ошибках (проверено на `any` типе)

**Git:**

- Ветка: `chore/monorepo-scaffold`
- Коммит: `cb70750 chore: lint/format baseline + husky + lint-staged (Story 0.2)`
- История: два отдельных коммита (0.1 → 0.2)

### 0.3 GitHub CI + PR template

**Status:** ✅ Completed  
**PR:** chore/github-ci-pr-template

**Выполнено:**

- Создан PR template: `.github/PULL_REQUEST_TEMPLATE.md`
  - Секции: Goal, Scope, Changes, DoD Checklist, Manual QA, Artifacts
- Создан GitHub Actions workflow: `.github/workflows/ci.yml`
  - Триггеры: pull_request, push в main
  - Шаги: checkout → setup Node 20 → enable corepack → install deps → lint → typecheck → build
  - Timeout: 15 минут
- Создан runbook: `docs/runbooks/repo-workflow.md`
  - Описание workflow: One Story = One PR
  - Epic order обязателен
  - Pre-PR checklist
  - Branch naming convention
  - CI workflow описание

**Проверено:**

- ✅ Все файлы созданы и структурированы
- ✅ CI workflow синтаксически корректен
- ✅ PR template содержит все необходимые секции

**Git:**

- Ветка: `chore/monorepo-scaffold`
- Коммит: `f00bf3d chore: GitHub CI + PR template (Story 0.3)`
- История: три коммита (0.1 → 0.2 → 0.3)

### 0.4 Docker Compose (Postgres/Redis/MinIO) + runbook

**Status:** ✅ Completed  
**PR:** chore/infra-compose

**Выполнено:**

- Создан `.env.example` в корне:
  - Переменные для Postgres (DB, USER, PASSWORD, PORT)
  - Переменные для Redis (PORT)
  - Переменные для MinIO (ROOT_USER, ROOT_PASSWORD, PORT, CONSOLE_PORT, BUCKET)
  - Placeholder переменные для будущих apps (API_PORT, WEBAPP_PORT, BOT_LOG_LEVEL)
- Создан `infra/docker-compose.yml`:
  - Service: postgres (postgres:16-alpine) с healthcheck
  - Service: redis (redis:7-alpine) с healthcheck и AOF
  - Service: minio (minio/minio:latest) с healthcheck и console
  - Service: minio-init (minio/mc:latest) для создания bucket
  - Volumes: pg_data, redis_data, minio_data
  - Restart policy: unless-stopped
- Создан runbook: `docs/runbooks/local-infra.md`:
  - Prerequisites (Docker Desktop)
  - Setup инструкции
  - Verification для всех сервисов
  - Stop/clean команды
  - Troubleshooting

**Проверено:**

- ✅ docker-compose.yml синтаксически корректен
- ✅ Все сервисы настроены с healthchecks
- ✅ Runbook содержит все необходимые команды

**Git:**

- Ветка: `chore/monorepo-scaffold`
- Коммит: готов к созданию (вместе с обновлением epics-outline.md)
