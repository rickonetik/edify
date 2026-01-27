#!/usr/bin/env node

/**
 * Foundation Smoke Test: API Health Endpoint
 * Tests: /health response format, x-request-id header, requestId
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApi, stopApi, getApiBaseUrl } from './_utils/api-process.mjs';

test.before(async () => {
  await startApi({ nodeEnv: 'test', skipDb: true, swaggerEnabled: false });
});

test.after(async () => {
  await stopApi();
});

test('GET /health returns 200 with correct format', async () => {
  const res = await fetch(`${getApiBaseUrl()}/health`);
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(typeof body.env, 'string');
  assert.ok(body.env.length > 0);
  assert.equal(typeof body.version, 'string');
  assert.ok(body.version.length > 0);
});

test('GET /health includes x-request-id header', async () => {
  const res = await fetch(`${getApiBaseUrl()}/health`);
  assert.equal(res.status, 200);

  const requestId = res.headers.get('x-request-id');
  assert.ok(requestId);
  assert.ok(requestId.length > 10);
});
