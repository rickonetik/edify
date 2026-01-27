/* global console, process */
import { signTelegramInitData } from '../../apps/api/dist/apps/api/src/auth/telegram/telegram-init-data.js';
import { readFileSync } from 'fs';

// Read .env manually
const envContent = readFileSync('.env', 'utf-8');
const botTokenMatch = envContent.match(/^TELEGRAM_BOT_TOKEN=(.+)$/m);
const botToken = botTokenMatch ? botTokenMatch[1].trim() : '';

if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env');
  process.exit(1);
}

const authDate = Math.floor(Date.now() / 1000);
const user = {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  photo_url: 'https://example.com/photo.jpg',
};
const params = {
  query_id: 'test',
  user: JSON.stringify(user),
  auth_date: String(authDate),
};

const initData = signTelegramInitData(params, botToken);
console.log(initData);
