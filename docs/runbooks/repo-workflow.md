# Repository Workflow

## One Story = One PR

Каждая Story должна быть реализована в отдельном PR. Не смешивать несколько Stories в одном PR.

## Epic Order

Порядок EPIC'ов обязателен. См. [docs/runbooks/epics-outline.md](./epics-outline.md)

## Pre-PR Checklist

Перед созданием PR выполнить:

```bash
pnpm -w lint
pnpm -w typecheck
pnpm -w build
```

Все команды должны проходить без ошибок.

## Branch Naming

Формат: `type/scope-short`

Примеры:

- `chore/monorepo-scaffold`
- `chore/lint-format-baseline`
- `chore/github-ci-pr-template`

## No Refactors Without Scope

Не делать рефакторинги, переименования или изменения структуры, если это не указано в scope текущей Story.

## Definition of Done (DoD)

Каждый PR должен содержать:

- DoD checklist (в PR template)
- Manual QA результаты
- Артефакты (логи, скриншоты)

## CI Workflow

В GitHub на каждом PR автоматически запускается workflow "CI".

Workflow выполняет:

1. `pnpm i --frozen-lockfile` (установка зависимостей)
2. `pnpm -w lint` (проверка линта)
3. `pnpm -w typecheck` (проверка типов)
4. `pnpm -w build` (сборка)

Все шаги должны проходить успешно.

## PR Template

При создании PR в GitHub автоматически подставляется шаблон из `.github/PULL_REQUEST_TEMPLATE.md`.

Шаблон должен быть заполнен перед merge.
