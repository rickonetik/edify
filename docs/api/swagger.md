# Swagger Documentation

Swagger UI доступен в dev-режиме по адресу /docs.

В production режиме /docs недоступен (404).

## Использование

1. Запустить API в dev: `NODE_ENV=development pnpm --filter @tracked/api start`
2. Открыть http://localhost:3001/docs
3. Просмотреть доступные endpoints и их документацию

## Формат ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "traceId": "uuid-or-header-value",
  "details": ["field1 is required"]
}
```

Коды ошибок см. в `packages/shared/src/errors/codes.ts`.
