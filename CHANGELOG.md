# Changelog

All notable changes to this project will be documented in this file.

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
