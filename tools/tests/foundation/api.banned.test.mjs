#!/usr/bin/env node

/**
 * Foundation tests: Ban enforcement (Story 3.5)
 * - GET /me with valid JWT for banned user → 403 USER_BANNED + audit entry
 * - POST /auth/telegram with valid initData for banned user → 403 USER_BANNED + audit entry
 *
 * Requires DATABASE_URL and running Postgres (e.g. pnpm infra:up).
 * When DATABASE_URL is not set, all tests are skipped so pnpm test:foundation still passes.
 */

import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { buildApi, startApi, stopApi, getApiBaseUrl, API_PORT } from './_utils/api-process.mjs';
import { makeTelegramInitData } from './_utils/makeTelegramInitData.mjs';
import pg from 'pg';
import jwt from 'jsonwebtoken';

const API_URL = getApiBaseUrl();
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'test-jwt-secret-for-foundation-tests';
const JWT_TTL = Number(process.env.JWT_ACCESS_TTL_SECONDS || '900');
const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

const hasDb = Boolean(DATABASE_URL);

let pool = null;

function createTestUserId() {
  return `foundation-ban-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function ensureMigrations(p) {
  await p.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT NULL;
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      actor_user_id UUID NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      trace_id TEXT NOT NULL,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb
    );
    CREATE INDEX IF NOT EXISTS audit_log_trace_id_idx ON audit_log (trace_id);
    CREATE INDEX IF NOT EXISTS audit_log_actor_user_id_idx ON audit_log (actor_user_id);
  `);
}

test.before(async () => {
  if (!hasDb) return;
  await buildApi();
  await startApi({
    skipDb: false,
    extraEnv: { DATABASE_URL },
  });
  pool = new pg.Pool({ connectionString: DATABASE_URL });
  await ensureMigrations(pool);
});

test.after(async () => {
  if (pool) {
    await pool.query(
      "DELETE FROM users WHERE telegram_user_id::text LIKE 'foundation-ban-%' OR telegram_user_id::text LIKE '999%'",
    );
    await pool.query("DELETE FROM audit_log WHERE trace_id LIKE 'foundation-ban-%'");
    await pool.end();
    pool = null;
  }
  await stopApi();
});

test('GET /me with banned user returns 403 USER_BANNED and audit entry by trace_id', {
  skip: !hasDb,
}, async () => {
  const traceId = `foundation-ban-${randomUUID()}`;
  const telegramUserId = createTestUserId();

  const insert = await pool.query(
    `INSERT INTO users (telegram_user_id, created_at, updated_at, banned_at)
     VALUES ($1, NOW(), NOW(), NOW())
     RETURNING id`,
    [telegramUserId],
  );
  const userId = insert.rows[0].id;

  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    { sub: userId, tg: telegramUserId, iat: now, exp: now + JWT_TTL },
    JWT_SECRET,
    { algorithm: 'HS256' },
  );

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-request-id': traceId,
    },
  });

  if (response.status !== 403) {
    throw new Error(`Expected 403, got ${response.status}`);
  }
  const body = await response.json();
  if (body.code !== 'USER_BANNED') {
    throw new Error(`Expected code USER_BANNED, got ${body.code}`);
  }
  const requestId = response.headers.get('x-request-id');
  if (!requestId) {
    throw new Error('Missing x-request-id header');
  }
  if (body.requestId !== requestId) {
    throw new Error(`requestId ${body.requestId} does not match x-request-id ${requestId}`);
  }

  const audit = await pool.query(
    'SELECT action, actor_user_id, trace_id FROM audit_log WHERE trace_id = $1',
    [traceId],
  );
  if (audit.rows.length === 0) {
    throw new Error(`No audit_log entry for trace_id=${traceId}`);
  }
  const row = audit.rows[0];
  if (row.action !== 'request.blocked.banned') {
    throw new Error(`Expected action request.blocked.banned, got ${row.action}`);
  }
  if (row.actor_user_id !== userId) {
    throw new Error(`Expected actor_user_id ${userId}, got ${row.actor_user_id}`);
  }
});

test('POST /auth/telegram with banned user returns 403 USER_BANNED and audit entry by trace_id', {
  skip: !hasDb,
}, async () => {
  const traceId = `foundation-ban-${randomUUID()}`;
  const telegramUserIdNum = 999000 + Math.floor(Math.random() * 1000);
  const telegramUserId = String(telegramUserIdNum);

  await pool.query(
    `INSERT INTO users (telegram_user_id, created_at, updated_at, banned_at)
     VALUES ($1, NOW(), NOW(), NOW())
     ON CONFLICT (telegram_user_id) DO UPDATE SET banned_at = NOW()`,
    [telegramUserId],
  );

  const userJson = JSON.stringify({
    id: telegramUserIdNum,
    first_name: 'Banned',
    username: 'banned_user',
  });
  const authDate = Math.floor(Date.now() / 1000);
  const initData = makeTelegramInitData(
    { user: userJson, auth_date: String(authDate) },
    BOT_TOKEN,
  );

  const response = await fetch(`${API_URL}/auth/telegram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': traceId,
    },
    body: JSON.stringify({ initData }),
  });

  if (response.status !== 403) {
    throw new Error(`Expected 403, got ${response.status}`);
  }
  const body = await response.json();
  if (body.code !== 'USER_BANNED') {
    throw new Error(`Expected code USER_BANNED, got ${body.code}`);
  }
  const requestId = response.headers.get('x-request-id');
  if (!requestId) {
    throw new Error('Missing x-request-id header');
  }

  const audit = await pool.query(
    'SELECT action, actor_user_id, trace_id FROM audit_log WHERE trace_id = $1',
    [traceId],
  );
  if (audit.rows.length === 0) {
    throw new Error(`No audit_log entry for trace_id=${traceId}`);
  }
  if (audit.rows[0].action !== 'auth.blocked.banned') {
    throw new Error(`Expected action auth.blocked.banned, got ${audit.rows[0].action}`);
  }
});
