# PREFLIGHT_REPORT

## Результаты автоматических проверок

| Блок                                   | Результат                                                        |
| -------------------------------------- | ---------------------------------------------------------------- |
| 0                                      | Node v25.2.1, pnpm 9.15.4 ✅                                     |
| A1 pnpm verify                         | PASS                                                             |
| A2 lint / typecheck / build            | PASS (test — в воркспейсах нет скрипта test)                     |
| A3 Husky/lint-staged                   | PASS                                                             |
| B Docker up                            | PASS (Postgres, Redis, MinIO)                                    |
| C1 env fail-fast                       | PASS                                                             |
| C2 no deep imports                     | PASS (только в docs)                                             |
| D1 /health + x-request-id              | PASS                                                             |
| D2 единый формат ошибок (404/401/auth) | PASS                                                             |
| D3 /docs                               | BLOCKED (API build failed; no /docs), artifacts/api-docs-dev.txt |
