# Repository Workflow

> **📖 Project Context**: Полный контекст проекта (версии, команды, токены, окружения) см. в [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)

## Workspace Verification

To list all packages in the workspace, use:

```bash
pnpm -r list --depth 0
```

This shows all packages: @tracked/api, @tracked/bot, @tracked/shared, @tracked/webapp.

## One Story = One PR

Каждая Story должна быть реализована в отдельном PR. Не смешивать несколько Stories в одном PR.

## Epic Order

Порядок EPIC'ов обязателен. См. [docs/runbooks/epics-outline.md](./epics-outline.md)

## Pre-PR Checklist

Перед созданием PR выполнить:

```bash
pnpm verify
```

Команда `pnpm verify` выполняет все проверки:

- Workspace integrity
- Deep imports check
- Lint (warnings OK, errors block)
- Typecheck
- Build

**PR is not allowed if verify fails.**

**Note**: `pnpm -w lint` warnings are acceptable; only errors block the PR.

See [Quality Gates](./quality-gates.md) for detailed information.

### Deep Imports Check

Проверка отсутствия deep imports в `@tracked/shared`:

```bash
rg "@tracked/shared/src" -n
```

Должно вернуть пустой результат (0 matches). Deep imports запрещены: см. реализацию в `packages/shared` (internal); импортировать только из `@tracked/shared`.

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

## Docs Consistency Checklist

При обновлении документации проверьте:

- ✅ **No deep import examples** — нет примеров импортов вида `@tracked/shared/src/*`
- ✅ **All commands copy-paste runnable** — все команды совпадают с scripts из `package.json`
- ✅ **Min supported browsers pinned** — явно указан минимум iOS/Safari/WebView
- ✅ **Epic status updated** — актуальный статус EPIC'ов (merged/in progress)
