#!/usr/bin/env node

/**
 * Foundation Smoke Test: API Error Format
 * Tests: 404 error format, 400 validation error format, requestId consistency
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildApi, startApi, stopApi, getApiBaseUrl } from './_utils/api-process.mjs';

test.before(async () => {
  await buildApi();
  await startApi({ nodeEnv: 'test', skipDb: true, swaggerEnabled: false });
});

test.after(async () => {
  await stopApi();
});

test('GET /nope returns 404 with unified error format', async () => {
  const res = await fetch(`${getApiBaseUrl()}/nope`);
  assert.equal(res.status, 404);

  const body = await res.json();
  assert.equal(body.statusCode, 404);
  assert.equal(typeof body.code, 'string');
  assert.ok(body.code.length > 0);
  assert.equal(typeof body.message, 'string');
  assert.ok(body.message.length > 0);
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);

  const headerId = res.headers.get('x-request-id');
  assert.equal(headerId, body.requestId);
});

test('GET /health/400 returns 400 with validation error format', async () => {
  const res = await fetch(`${getApiBaseUrl()}/health/400`);
  assert.equal(res.status, 400);

  const body = await res.json();
  assert.equal(body.statusCode, 400);
  assert.equal(typeof body.code, 'string');
  assert.ok(body.code.length > 0);
  assert.equal(typeof body.message, 'string');
  assert.ok(body.message.length > 0);
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);

  const headerId = res.headers.get('x-request-id');
  assert.equal(headerId, body.requestId);
});
