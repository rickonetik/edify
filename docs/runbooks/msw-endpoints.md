# MSW Endpoints (Story 2.4)

Фактический список эндпоинтов, которые дергает webapp (`apps/webapp/src/shared/query/api.ts`) и которые покрыты MSW handlers.

## 7 эндпоинтов

| Метод | Путь                                | Функция             | Ответ                                            |
| ----- | ----------------------------------- | ------------------- | ------------------------------------------------ |
| GET   | `/api/me`                           | `fetchMe`           | `ApiOk<User>`                                    |
| GET   | `/api/library`                      | `fetchLibrary`      | `ApiOk<{ catalog, recommendations, pageInfo? }>` |
| GET   | `/api/learn`                        | `fetchLearnSummary` | `ApiOk<LearnSummary>`                            |
| GET   | `/api/courses/:courseId`            | `fetchCourse`       | `ApiOk<{ course, lessons }>`                     |
| GET   | `/api/lessons/:lessonId`            | `fetchLesson`       | `ApiOk<Lesson>`                                  |
| GET   | `/api/me/invite`                    | `fetchInvite`       | `ApiOk<Invite>`                                  |
| GET   | `/api/lessons/:lessonId/submission` | `fetchSubmission`   | `ApiOk<Submission>`                              |

Формат успешного ответа: `ApiOk<T> = { data: T; requestId: string }`. В ответах всегда есть заголовок `x-request-id`.

## Smoke-тест MSW (в браузере)

MSW — service worker в браузере; он перехватывает только `fetch()` из приложения. **curl не попадает в MSW** (идёт в Vite dev server), поэтому проверять нужно в браузере.

1. Запуск с MSW:

   ```bash
   VITE_USE_MSW=true pnpm --filter @tracked/webapp dev
   ```

   **Важно:** Если `VITE_REAL_API=true`, MSW будет отключен даже при `VITE_USE_MSW=true`. См. [feature-flags.md](./feature-flags.md).

2. Открыть приложение (например `http://localhost:5173/` или порт из вывода Vite).

3. DevTools → Network. Перейти по экранам: `/account`, `/library`, `/learn`, `/course/1`, `/lesson/1`.

4. Ожидаемо:
   - запросы к `/api/me`, `/api/library`, `/api/learn`, `/api/courses/...`, `/api/lessons/...` дают **200**;
   - в ответах есть **x-request-id**;
   - тело — JSON вида `{ data: ..., requestId: "..." }`.

5. Ошибки через query param:
   - `/account?__msw=401` → UNAUTHORIZED (uiError.kind = 'unauthorized')
   - `/library?__msw=404` → NOT_FOUND (uiError.kind = 'not_found')
   - `/learn?__msw=network` → network error (uiError.kind = 'network')
   - `/learn?__msw=500` → INTERNAL (uiError.kind = 'unknown')

6. Empty states через query param:
   - `/library?__msw=empty` → пустой каталог (EmptyState)
   - `/learn?__msw=empty` → пустые секции (EmptyState)

Если в Network эти запросы возвращают данные с `data` и `requestId` — MSW отрабатывает на нужных путях.

См. также [feature-flags.md](./feature-flags.md) для полной документации по feature flags и error states.
