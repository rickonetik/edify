#!/usr/bin/env node

import { createHmac } from 'node:crypto';

/**
 * Create valid Telegram WebApp initData string for foundation tests.
 * Uses Node crypto only (HMAC-SHA256 as per Telegram spec).
 * Same algorithm as apps/api signTelegramInitData.
 *
 * @param {Record<string, string>} params - Query params (e.g. user, auth_date). Must NOT include hash.
 * @param {string} botToken - Telegram bot token (same as TELEGRAM_BOT_TOKEN used by API)
 * @returns {string} initData string with hash (suitable for POST /auth/telegram)
 */
export function makeTelegramInitData(params, botToken) {
  const urlParams = new URLSearchParams(params);
  const pairs = [];
  for (const [key, value] of urlParams.entries()) {
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  urlParams.set('hash', hash);
  return urlParams.toString();
}
