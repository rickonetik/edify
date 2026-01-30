# Feature Flags (Story 2.5)

Управление источником данных для webapp через environment variables.

## Feature Flags

Единый источник истины: `apps/webapp/src/shared/config/flags.ts`

- `FLAGS.useMsw`: включен ли MSW (только в DEV, автоматически отключается если `realApi === true`)
- `FLAGS.realApi`: принудительное использование реального API (отключает MSW)

**Правило приоритета:** `realApi === true` → `useMsw = false` (hard override)

## Environment Variables

### VITE_USE_MSW

- Значение: `'true'` для включения MSW
- Работает только в `DEV` режиме
- Автоматически отключается если `VITE_REAL_API=true`

### VITE_REAL_API

- Значение: `'true'` для принудительного использования реального API
- Отключает MSW даже если `VITE_USE_MSW=true`
- Fetcher использует `VITE_API_BASE_URL` или same-origin

### VITE_API_BASE_URL

- Базовый URL для API (опционально)
- Если не задан → same-origin (`''`)
- Используется когда `realApi === true` или оба флага `false`

## Запуск

### С MSW (mock data)

```bash
VITE_USE_MSW=true pnpm --filter @tracked/webapp dev
```

- MSW worker стартует автоматически
- Все запросы перехватываются MSW handlers
- Данные из `apps/webapp/src/shared/msw/data.ts`

### С реальным API

```bash
VITE_REAL_API=true VITE_API_BASE_URL=http://localhost:3001 pnpm --filter @tracked/webapp dev
```

- MSW отключен (даже если `VITE_USE_MSW=true`)
- Запросы идут в реальный API по `VITE_API_BASE_URL`
- Если `VITE_API_BASE_URL` не задан → same-origin

### По умолчанию (без флагов)

```bash
pnpm --filter @tracked/webapp dev
```

- MSW отключен
- Используется `VITE_API_BASE_URL` или same-origin

## Тестирование Error States

Все экраны теперь используют React Query состояния (`isLoading`, `isError`, `uiError`, `data`) вместо query-param `?state=...`.

### MSW Error Simulation

Используйте query param `__msw` для симуляции ошибок:

- `/account?__msw=network` → network error (uiError.kind = 'network')
- `/account?__msw=401` → UNAUTHORIZED (uiError.kind = 'unauthorized')
- `/library?__msw=404` → NOT_FOUND (uiError.kind = 'not_found')
- `/learn?__msw=500` → INTERNAL (uiError.kind = 'unknown')
- `/course/1?__msw=404` → NOT_FOUND
- `/lesson/1?__msw=404` → NOT_FOUND

### MSW Empty State Simulation

- `/library?__msw=empty` → пустой каталог (EmptyState)
- `/learn?__msw=empty` → пустые секции (EmptyState)

### Ожидаемое поведение UI

1. **Loading:** Skeleton компоненты показываются при `isLoading === true`
2. **Error:** ErrorState с `uiError.title`, `uiError.description`, кнопка "Повторить" вызывает `refetch()`
3. **Empty:** EmptyState показывается когда `data` пустой или отсутствует (например, пустые массивы)

## Экраны с React Query

Все экраны переведены на data-driven состояния:

- **LearnPage** (`/learn`): `useLearnSummary()` → Skeleton/ErrorState/EmptyState
- **LibraryPage** (`/library`): `useLibrary()` → Skeleton/ErrorState/EmptyState
- **AccountPage** (`/account`): `useMe()` → Skeleton/ErrorState (fallback на мок если нет данных)
- **CourseDetailPage** (`/course/:id`): `useCourse(id)` → Skeleton/ErrorState
- **LessonPage** (`/lesson/:lessonId`): `useLesson(lessonId)` → Skeleton/ErrorState

Query-param `?state=loading|empty|error` больше не используется как основной механизм (можно оставить как временную dev-фичу, но по умолчанию работает путь "через данные").
