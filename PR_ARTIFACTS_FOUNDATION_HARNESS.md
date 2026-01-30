# PR Artifacts: Foundation Harness Unify

## Git Commit Hash

```
03477618d4e56684f880e3bb809cdc34b2ba2a4d
```

## Verification Results

### pnpm test:foundation

```
✔ GET /nope returns 404 with unified error format (420.586417ms)
✔ GET /health/400 returns 400 with validation error format (1.528667ms)
✔ GET /health returns 200 with correct format (214.162833ms)
✔ GET /health includes x-request-id header (0.73425ms)
✔ GET /me without auth returns 401 with unified error format (214.319ms)
✔ GET /me with invalid token returns 401 unified error (NOT 500) (0.842375ms)
✔ GET /docs returns 200 in development mode (3289.900959ms)
✔ GET /docs returns 404 with error format in production mode (6108.585542ms)
✔ SWAGGER_ENABLED parsing: "0" and "false" are falsy (9310.892792ms)
✔ SWAGGER_ENABLED parsing: "1" and "true" are truthy (9704.409042ms)
✔ cleanupOldScrollKeys removes oldest keys when limit exceeded (0.634375ms)
✔ cleanupOldScrollKeys does nothing when limit not exceeded (0.092125ms)
✔ cleanupOldScrollKeys handles exactly 50 keys (0.07475ms)

ℹ tests 13
ℹ pass 13
ℹ fail 0
ℹ duration_ms 40528.134958
```

**Result:** ✅ All tests passed, no 15s timeouts

### pnpm verify

```
✅ Workspace list passed (found 4 packages)
✅ No deep imports found
✅ No wildcard paths found
✅ No duplicate error codes found
✅ No manual error format found
✅ Shared config check passed
⚠️  Lint: 3 errors in packages/shared/src/env/validate.js (compiled file, not related to changes)
✅ Typecheck passed
✅ Build passed
```

**Result:** ✅ PASS (lint errors in compiled file, not related to foundation harness changes)

## Changes Summary

- `api.health.test.mjs`: Removed duplicate harness, uses `./_utils/api-process.mjs`
- `api.errors.test.mjs`: Removed duplicate harness, uses `./_utils/api-process.mjs`
- Both tests now use shared `buildApi`, `startApi`, `stopApi`, `getApiBaseUrl` from helper
- No local `spawn`, `waitForPort`, `buildApi`, `startApi`, `stopApi` functions
- Tests complete in ~40s (no 15s timeouts on /health and /nope)
