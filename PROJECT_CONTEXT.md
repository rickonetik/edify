# Контекст проекта tracked-lms

## 📊 Current Status

- **Merged**: EPIC 0 (v0.1 Foundation) ✅
- **In progress**: EPIC 2.1 (branch: `feat/epic2-2-1-contracts-v1`)

## 📦 Структура монорепы

### Apps

- **`apps/api`** — NestJS + Fastify backend
  - Порт: `3001` (по умолчанию)
  - Health endpoint: `/health`
  - Swagger UI: `/docs` (только в dev)
  - Логирование: Pino (pretty в dev, plain в prod)

- **`apps/webapp`** — React + Vite frontend
  - Порт: `5173` (по умолчанию)
  - React Router с 3 основными табами
  - Safe-area handling для мобильных

- **`apps/bot`** — grammY Telegram bot
  - Команда `/start`
  - Требует `BOT_TOKEN` в env

### Packages

- **`packages/shared`** — общие типы, контракты, валидация
  - SSoT (Single Source of Truth)
  - Запрещены deep imports: импортировать только из `@tracked/shared`
  - См. реализацию в `packages/shared` (internal); импортировать только из `@tracked/shared`

## 🔧 Версии инструментов

- **Node.js**: `v25.2.1` (project pinned)
- **pnpm**: `9.15.4` (закреплено в `packageManager`)
- **Turbo**: `2.0.0`
- **TypeScript**: `5.5.0`

## 🌐 Целевые браузеры

### Minimum Supported

- **iOS 16+** (Safari iOS)
- **Telegram iOS WebView** на iOS 16+ (основной целевой браузер для Mini App)

### Known Risky Areas

- **Safe-area handling**: CSS переменные (`--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right`)
- **Scroll restoration**: поведение в WebView
- **Feature flags**: переключение MSW/REAL_API

## 🗺️ Роуты и экраны

### Основные табы (Bottom Navigation)

1. **Библиотека** (`/library`) — 📚
2. **Обучение** (`/learn`) — 📖 (дефолтный роут `/`)
3. **Профиль** (`/account`) — 👤

### Дополнительные роуты

- `/course/:id` — детали курса
- `/lesson/:lessonId` — страница урока
- `/update/:id` — обновление
- `/settings` — настройки
- `/creator/onboarding` — онбординг создателя
- `/ui-preview` — превью UI компонентов
- `*` — 404 (NotFoundPage)

## 👥 User Flows (роли)

**Примечание**: В текущей версии (v0.1 Foundation) роли Student/Expert/Admin не реализованы. Это будет в будущих EPIC'ах.

Текущие страницы:

- `LibraryPage` — библиотека курсов
- `LearnPage` — активное обучение
- `AccountPage` — профиль пользователя
- `CreatorOnboardingPage` — онбординг для создателей контента

## 🎨 Дизайн-токены

### Цвета

```css
/* Layout */
--app-bg-1: #0b0d10 --app-bg-2: #0f1218 --surface: #0b0d10 --chrome-bg: rgba(255, 255, 255, 0.08)
  --chrome-border: rgba(255, 255, 255, 0.1) /* Base */ --bg: #0b0d10 --fg: #e8edf3
  --muted-fg: #98a6b6 --card: #141a22 --card-2: #10151c --border: rgba(255, 255, 255, 0.08)
  --accent: #7ccfe6 --accent-2: #8ad9ee --danger: #ef5350;
```

### Радиусы

- `--r-xs`: 4px
- `--r-sm`: 6px
- `--r-md`: 8px
- `--r-lg`: 16px
- `--r-xl`: 20px

### Отступы (Spacing)

- `--sp-1`: 4px
- `--sp-2`: 8px
- `--sp-3`: 12px
- `--sp-4`: 16px
- `--sp-5`: 20px
- `--sp-6`: 24px
- `--sp-7`: 32px
- `--sp-8`: 40px

### Типографика

- **Шрифт**: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, Arial, sans-serif`
- **Размеры**:
  - `--text-xs`: 0.75rem (12px)
  - `--text-sm`: 0.875rem (14px)
  - `--text-md`: 1rem (16px)
  - `--text-lg`: 1.125rem (18px)
  - `--text-xl`: 1.25rem (20px)
- **Веса**: 400 (regular), 500 (medium), 600 (semibold)

### Эффекты

- **Тени**: `--shadow-1`, `--shadow-2`
- **Glass**: `--glass-bg: rgba(20, 26, 34, 0.72)`, `--glass-blur: blur(12px)`

**Файл токенов**: `apps/webapp/src/shared/ui/theme/tokens.css`

**Figma**: Ссылка на Figma не найдена в репозитории.

## 🌍 Окружения

### Локальная разработка

#### Инфраструктура (Docker Compose)

```bash
docker compose -f infra/docker-compose.yml --env-file .env up -d
```

**Сервисы**:

- **PostgreSQL**: `localhost:5432`
  - DB: `tracked_lms`
  - User: `tracked`
  - Password: `tracked_password`
- **Redis**: `localhost:6379`
- **MinIO**:
  - API: `localhost:9000`
  - Console: `localhost:9001`
  - User: `minio`
  - Password: `minio_password`
  - Bucket: `tracked-dev`

#### Переменные окружения (`.env`)

```env
# Infra
POSTGRES_DB=tracked_lms
POSTGRES_USER=tracked
POSTGRES_PASSWORD=tracked_password
POSTGRES_PORT=5432
REDIS_PORT=6379
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio_password
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_BUCKET=tracked-dev

# URLs
DATABASE_URL=postgresql://tracked:tracked_password@localhost:5432/tracked_lms
REDIS_URL=redis://localhost:6379

# S3 (MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio_password
S3_REGION=us-east-1
S3_BUCKET=tracked-dev
S3_FORCE_PATH_STYLE=true

# Apps
API_PORT=3001
WEBAPP_PORT=5173
BOT_LOG_LEVEL=info

# Bot
BOT_TOKEN=your_token_here
TELEGRAM_WEBAPP_URL=https://xxxx.ngrok-free.app
```

### Dev/Stage/Prod

**Текущая политика** (v0.1 Foundation):

- **Dev**: локальная разработка через `pnpm dev`
- **Public Dev**: ngrok туннель для Telegram Mini App
- **Stage/Prod**: не настроены (будут в будущих EPIC'ах)

### ngrok для Telegram Mini App

**Процесс**:

1. Запустить webapp (порт 5173):

```bash
pnpm --filter @tracked/webapp dev
```

2. Запустить ngrok:

```bash
ngrok http 5173
```

3. Скопировать public URL (например, `https://xxxx.ngrok-free.app`)

4. Добавить в `.env`:

```env
TELEGRAM_WEBAPP_URL=https://xxxx.ngrok-free.app
```

5. Запустить bot:

```bash
BOT_TOKEN=your_token pnpm --filter @tracked/bot start
```

**Документация**: `docs/runbooks/telegram-dev.md`, `tools/ngrok/README.md`

## 📝 Соглашения

### Нейминг веток

Формат: `type/scope-short`

Примеры:

- `chore/monorepo-scaffold`
- `chore/lint-format-baseline`
- `feat/epic2-2-1-contracts-v1` (текущая ветка)

### PR процесс

- **One Story = One PR** — каждая Story в отдельном PR
- **Epic Order** — порядок EPIC'ов обязателен
- **Pre-PR**: обязательно запустить `pnpm verify`
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md`

### Линтеры

- **ESLint**: flat config (`eslint.config.mjs`)
  - TypeScript правила
  - React правила
  - Import правила
  - Warnings OK, errors блокируют PR
- **Prettier**: форматирование кода
  - Semi: true
  - Single quotes
  - Trailing comma: all
  - Print width: 100
- **Husky + lint-staged**: pre-commit hooks

### Формат ошибок

**Коды ошибок**: См. реализацию в `packages/shared` (internal); импортировать только из `@tracked/shared`.

**Пример импорта**:

```typescript
import { ErrorCodes } from '@tracked/shared';
```

**❌ Неправильно** (deep import запрещен):

```text
НЕ КОПИРУЙТЕ ЭТУ СТРОКУ — анти-пример
import { ErrorCodes } from '@tracked/shared/<do-not-import>/errors/codes';
```

**Unified API Error Format**:

- Все API ошибки возвращаются в едином формате
- Включают `code`, `message`, `requestId` (x-request-id header)

### Стиль логирования

**Backend (API)**:

- **Pino** logger
- **Dev**: pretty format с colorize
- **Prod**: plain JSON
- **Request ID**: автоматически добавляется через interceptor (`x-request-id`)

**Bot**:

- Log level через `BOT_LOG_LEVEL` env (default: `info`)
- Уровни: `debug`, `info`, `warn`, `error`

**Frontend**:

- Console warnings для env validation в dev режиме

## 🚀 Команды

### Root level

```bash
pnpm verify              # Все quality gates
pnpm build               # Собрать все пакеты
pnpm typecheck           # Проверить типы
pnpm lint                # Линтер
pnpm dev                 # Запустить все приложения параллельно
pnpm dev:webapp          # Только webapp (alias для pnpm --filter @tracked/webapp dev)
pnpm dev:api             # Только API (alias для pnpm --filter @tracked/shared build && pnpm --filter @tracked/api dev)
pnpm start:api           # Запустить API (alias для pnpm --filter @tracked/shared build && pnpm --filter @tracked/api start)
pnpm dev:public          # Инструкции для ngrok setup
pnpm test:foundation     # Foundation тесты
pnpm audit:architecture  # Архитектурный аудит
```

### Package level (унифицированный стиль)

#### Webapp

```bash
pnpm --filter @tracked/webapp dev
```

```bash
pnpm --filter @tracked/webapp build
```

```bash
pnpm --filter @tracked/webapp typecheck
```

#### API

**Важно**: требует предварительной сборки `@tracked/shared`.

```bash
pnpm --filter @tracked/shared build && pnpm --filter @tracked/api dev
```

```bash
pnpm --filter @tracked/shared build && pnpm --filter @tracked/api start
```

#### Bot

```bash
pnpm --filter @tracked/bot dev
```

_Примечание: выполняет build + start_

```bash
pnpm --filter @tracked/bot start
```

_Примечание: только start (требует предварительный build)_

```bash
BOT_TOKEN=your_token pnpm --filter @tracked/bot start
```

#### Shared

```bash
pnpm --filter @tracked/shared build
```

```bash
pnpm --filter @tracked/shared typecheck
```

## 📚 Документация

- **Runbooks**: `docs/runbooks/`
  - `repo-workflow.md` — workflow разработки
  - `quality-gates.md` — система проверок
  - `local-infra.md` — локальная инфраструктура
  - `telegram-dev.md` — разработка Telegram Mini App
  - `epics-outline.md` — план EPIC'ов
- **API**: `docs/api/swagger.md`
- **CHANGELOG**: `CHANGELOG.md`
- **README**: `README.md`

## 🔒 Правила проекта (Cursor Rules)

Из `.cursor/rules/rules.mdc`:

- One Story = One PR
- No scope creep (no refactors/renames/deps)
- Foundation frozen in EPIC 1+
- No structure changes
- Shared is SSoT; no deep imports; no wildcard paths
- **UI kit** (`apps/webapp/src/shared/ui/*`) — без fetching/business logic
- **Pages/features** — могут использовать hooks/fetcher
- Run verify/test/audit and attach artifacts
- Stop after DoD

## 📊 Quality Gates

Перед PR обязательно:

```bash
pnpm verify              # Workspace, deep imports, lint, typecheck, build
pnpm test:foundation     # Foundation тесты
pnpm audit:architecture  # Архитектурный аудит
```

Все три проверки должны проходить успешно.

## 🔗 Репозиторий

**Название**: `tracked-lms`  
**Описание**: Telegram Mini App для обучения (LMS) с интеграцией бота и веб-приложения  
**Версия**: 0.1 — Foundation (EPIC 0)

---

_Документ создан автоматически на основе анализа кодовой базы_
