# Changelog

All notable changes to this project will be documented in this file.

## [0.3.5] - 2026-01-30 - Epic 3 final — Ban enforcement + audit (Story 3.5)

### Added

- **Ban enforcement** — Banned users receive 403 `USER_BANNED` on `POST /auth/telegram` and `GET /me`
- **Audit** — `audit_log` entries with `trace_id = x-request-id` for `auth.blocked.banned` and `request.blocked.banned`
- **DB** — `users.banned_at`, `users.ban_reason`; `audit_log` table (migration 002)
- **CI** — Postgres service; `pnpm test:foundation` and `pnpm audit:architecture` (banned tests run in CI)
- **Foundation tests** — `api.banned.test.mjs`: /me and /auth/telegram 403 + audit by trace_id

### Changed

- **Shared** — Error code `USER_BANNED`; `UserV1.bannedAt` in contracts
- **API** — `AuditService`, JWT guard and Telegram auth enforce ban and write audit

## [0.3.4] - 2026-01-29 - Bot WebApp button, ngrok dev fixes (Story 3.4)

### Added

- **Bot (Story 3.4)** — `/start` returns inline button "Open WebApp" opening Mini App via `TELEGRAM_WEBAPP_URL`
  - Startup validation: `TELEGRAM_WEBAPP_URL` required, must be https, trailing slash stripped
  - Bot reads env from root `.env` (`--env-file-if-exists=../../.env`), entrypoint `dist/apps/bot/src/index.js`
  - `apps/bot/.env.example`: `BOT_TOKEN`, `TELEGRAM_WEBAPP_URL`
- **Runbooks** — Free ngrok workflow (Story 3.4), infra baseline (v0.3.3+), allowedHosts troubleshooting

### Changed

- **WebApp** — Vite dev: `server.allowedHosts` for `.ngrok-free.dev`, `.ngrok-free.app`, `.ngrok-free.de` (no "Blocked request" via ngrok)
- **Protocol** — `run-with-protocol.mjs`: `--timeout-ms=*` and leading `--` no longer passed to command (long-running dev works)
- **Local infra** — All `docker compose` examples use `--env-file .env`; Infra baseline section in runbook

### Fixed

- Bot entrypoint: start script uses `dist/apps/bot/src/index.js` (correct build output)
- ngrok ERR_NGROK_8012: run ngrok with `127.0.0.1:5173` instead of `localhost:5173` (IPv4 vs ::1)

## [0.3.4.1] - 2026-01-29 - Mobile tab bar layout (Telegram Mini App)

### Fixed

- **WebApp (mobile)** — Bottom tab bar no longer overlapped by main content: increased main `paddingBottom` to 80px + safe-area
- **WebApp (mobile)** — Tab bar: `minHeight` instead of fixed height, `flex: 1` + centered icon/label per tab, proper centering in Telegram

## [0.3.4.2] - 2026-01-29 - Tab bar safe-area, single source of truth (--tabs-h, --topbar-h)

### Changed

- **Layout tokens** — `--topbar-h: 56px` and `--tabs-h: 72px` in tokens.css; AppShell main uses them for paddingTop/paddingBottom
- **BottomTabs** — Total height = `--tabs-h` + `--safe-bottom`; `paddingBottom: var(--safe-bottom)` so content area is never squeezed on iOS; ellipsis for long labels
- **TopBar** — `minHeight: calc(var(--topbar-h) + var(--safe-top))`, `paddingTop: var(--safe-top)`; Toast/ToastHost use `var(--topbar-h)` for top offset

### Fixed

- Tab bar on iPhone: no icon/label clipping; panel does not sit on home indicator; no double safe-area gap
- Single source of truth for bar heights so main padding always matches actual chrome height

## [0.2.3] - 2026-01-25 - Data Layer & API Contracts (EPIC 2)

### Added

#### Shared Contracts v1 (Story 2.1)

- **Versioned Data Contracts**
  - Common types: `ID`, `ISODateTime`, `ISODate`, `Locale`, `Platform`, `Pagination`, `PageInfo`
  - Error contracts: `ErrorCode`, `ErrorPayload`, `ErrorResponse`, `ApiOk<T>`
  - User contract: `User`, `MeResponse`
  - Course contract: `Course`, `CourseBadge`, `LibraryResponse`
  - Lesson contract: `Lesson`, `LearnSummary`, `LearnResponse`, `CourseResponse`
  - Invite contract: `Invite`, `InviteResponse`
  - Submission contract: `Submission`, `SubmissionStatus`, `SubmissionResponse`
  - All contracts exported from `@tracked/shared` public API
  - Resolved `ErrorCode` name conflict (legacy type renamed to `ApiErrorCode`)

#### WebApp HTTP Client (Story 2.2)

- **API Fetcher**
  - `request<T>()` function with query params, body, headers, signal support
  - Automatic `x-request-id` generation (crypto.randomUUID with fallback)
  - `x-platform: 'webapp'` header
  - Proper error mapping to `ApiClientError` with status, code, payload, requestId
  - Network error handling
  - 204 No Content support
  - Empty response handling (no JSON.parse on empty text)
  - Base URL configuration with same-origin support

#### React Query Integration (Story 2.3)

- **Data Hooks**
  - `useMe()`, `useLibrary()`, `useLearnSummary()`
  - `useCourse(courseId)`, `useLesson(lessonId)`
  - `useInvite()`, `useSubmission(lessonId)`
  - Typed query keys for cache management
  - Error mapping to UI-friendly states (`uiError`)
  - QueryClient with optimized defaults (retry: 0, staleTime: 30s, gcTime: 5min)
  - React Query DevTools (DEV only)

#### MSW Mocking (Story 2.4)

- **Mock Service Worker**
  - 7 API endpoints mocked: `/api/me`, `/api/library`, `/api/learn`, `/api/courses/:id`, `/api/lessons/:id`, `/api/me/invite`, `/api/lessons/:id/submission`
  - Error simulation via `?__msw=401|403|404|422|500|network`
  - Empty state simulation via `?__msw=empty`
  - Proper `ApiOk<T>` and `ErrorResponse` format
  - `x-request-id` header propagation
  - DEV-only activation via `VITE_USE_MSW=true`

#### Feature Flags (Story 2.5)

- **Data Source Control**
  - `FLAGS.useMsw`: MSW activation (DEV only, respects realApi override)
  - `FLAGS.realApi`: Force real API usage (disables MSW)
  - Priority rule: `realApi === true` → `useMsw = false`
  - Base URL logic: MSW uses same-origin, real API uses `VITE_API_BASE_URL`
  - Environment variables: `VITE_USE_MSW`, `VITE_REAL_API`, `VITE_API_BASE_URL`

#### Data-Driven UI States (Story 2.5)

- **React Query States**
  - All pages use `isLoading` (Skeleton), `isError` (ErrorState), empty data (EmptyState)
  - Removed query-param `?state=loading|empty|error` as primary mechanism
  - LearnPage: `useLearnSummary()` with data-driven rendering
  - LibraryPage: `useLibrary()` with catalog/recommendations from API
  - AccountPage: `useMe()` with fallback to mock
  - CourseDetailPage, LessonPage: React Query hooks with loading/error states

#### Library News Section (Fix)

- Restored local mock news section in LibraryPage
- News items clickable to `/update/:id`
- Hidden during active search (as per Story 1.5)

### Technical Details

- **Type Safety**: All API contracts typed with shared v1 contracts
- **Error Handling**: Unified error mapping from `ApiClientError` to UI states
- **Development**: MSW enables frontend development without backend
- **Production**: Feature flags allow seamless switch to real API
- **Code Quality**: All quality gates pass, no regressions

### Documentation

- `docs/runbooks/msw-endpoints.md`: MSW endpoints and smoke testing
- `docs/runbooks/feature-flags.md`: Feature flags usage and error state testing
- `apps/webapp/src/shared/contracts/__sanity__.ts`: Contract export verification

## [0.2.2] - 2026-01-25 - WebApp UI Foundation (EPIC 1)

### Added

#### WebApp UI Kit (Story 1.3)

- **UI Components**
  - Button component with variants (primary, secondary, ghost, danger) and sizes
  - Card component with CardHeader, CardTitle, CardDescription, CardContent
  - Input component with label, hint, and error states
  - ListItem component for navigation and actions
  - Skeleton component for loading states
  - EmptyState and ErrorState components for feedback
  - Toast notification system with useToast hook
  - Modal component for dialogs

#### WebApp Pages & Features

- **Learn Page (Story 1.4)**
  - Current course card with progress circle
  - Next lesson card
  - Continue learning section with progress bars
  - My courses horizontal scroll section
  - News section
  - Loading/empty/error states via query params

- **Library Page (Story 1.5)**
  - Catalog courses section (vertical list)
  - Recommendations section (horizontal scroll)
  - News section
  - Local search functionality with filtering
  - Mock data for courses and news
  - Loading/empty/error states via query params

- **Account Page (Story 1.6)**
  - Profile card with avatar, name, handle, status badge
  - Referral card with code, link, and copy to clipboard
  - Stats row with progress, streak, and points metrics
  - Actions list with navigation
  - Copy to clipboard with fallback support
  - Loading/empty/error states via query params

- **Stub Screens (Story 1.7)**
  - CourseDetailPage, LessonPage, UpdatePage
  - SettingsPage, CreatorOnboardingPage
  - NotFoundPage for 404 fallback
  - Unified stub page UI pattern
  - All routes properly configured

#### UI Improvements

- **Toast Component**
  - Fixed positioning and animation (centered, no left shift)
  - Proper willChange optimization
  - Responsive width calculation

- **Navigation**
  - Removed headers from Library and Account pages
  - All actions navigate to proper routes instead of toast
  - News items in Library are clickable

### Technical Details

- All components use design tokens (--sp-_, --text-_, --fg, --muted-fg, etc.)
- No inline "magic" colors
- Scroll restoration preserved
- All routes work without 404 errors
- Consistent UI patterns across all pages

## [0.1.0] - 2024 - Foundation (EPIC 0)

### Added

#### Infrastructure & Tooling

- **Monorepo Setup**
  - pnpm workspace configuration
  - Turborepo for build caching and parallel execution
  - TypeScript base configuration
  - Package structure: `apps/api`, `apps/webapp`, `apps/bot`, `packages/shared`

- **Code Quality**
  - ESLint with flat config (TypeScript + React rules)
  - Prettier for code formatting
  - Husky pre-commit hooks with lint-staged
  - GitHub Actions CI workflow
  - Quality Gates verification system (`pnpm verify`)

- **Environment Management**
  - Zod schemas for runtime env validation
  - Unified env schemas for all applications
  - Secret masking in validation errors

- **Local Infrastructure**
  - Docker Compose setup (PostgreSQL, Redis, MinIO)
  - Healthchecks for all services
  - Infrastructure runbooks

#### Applications

- **API** (`apps/api`)
  - NestJS + Fastify setup
  - `/health` endpoint
  - Unified error response format
  - Request ID tracing (`x-request-id` header)
  - Pino structured logging
  - Swagger UI at `/docs` (development only)

- **WebApp** (`apps/webapp`)
  - React + Vite setup
  - React Router with 3-tab navigation (Library, Learn, Account)
  - Bottom navigation bar
  - Safe-area handling for mobile viewports

- **Bot** (`apps/bot`)
  - grammY framework setup
  - `/start` command handler
  - Error handling without token leakage

#### Shared Package

- Environment validation schemas (API, Bot, Webapp)
- Error codes and types
- Contracts (pagination types)
- Public API exports (no deep imports allowed)

#### Documentation

- Repository workflow runbook
- Quality gates documentation
- Local infrastructure runbook
- Telegram Mini App development runbook
- PR template
- Cursor AI rules

#### Development Tools

- ngrok helper scripts and documentation
- Quality gates verification script
- Development helper commands

### Technical Details

- **Node.js**: 20+
- **Package Manager**: pnpm 9.0.0
- **Build System**: Turborepo 2.x
- **TypeScript**: 5.5+
- **Backend Framework**: NestJS 10.x, Fastify 5.x
- **Frontend**: React 18.x, Vite 5.x
- **Bot Framework**: grammY 1.x
- **Validation**: Zod 3.x
- **Logging**: Pino 9.x

### Quality Gates

Automated checks via `pnpm verify`:

- Workspace integrity (4 packages)
- Deep imports check (forbidden `@tracked/shared/src/*`)
- Lint (errors block, warnings OK)
- Typecheck
- Build

### Development Workflow

- One Story = One PR
- Epic order is mandatory
- Quality gates must pass before PR
- Scope discipline enforced
