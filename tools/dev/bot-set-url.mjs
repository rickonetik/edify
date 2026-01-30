#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');
const envPath = resolve(rootDir, '.env');

// Получаем URL из аргументов
const url = process.argv[2];

if (!url) {
  console.error('❌ Error: URL argument is required');
  console.error('Usage: pnpm bot:set-url <https-url>');
  process.exit(1);
}

// Валидация URL
try {
  const urlObj = new URL(url);
  if (urlObj.protocol !== 'https:') {
    console.error('❌ Error: URL must use HTTPS protocol');
    process.exit(1);
  }
} catch {
  console.error('❌ Error: Invalid URL format');
  process.exit(1);
}

// Маскируем URL для вывода (только домен)
const maskUrl = (urlStr) => {
  try {
    const urlObj = new URL(urlStr);
    return urlObj.hostname || 'masked';
  } catch {
    return 'masked';
  }
};

// Читаем .env файл
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch (err) {
  if (err.code === 'ENOENT') {
    // Файл не существует, создадим новый
    envContent = '';
  } else {
    console.error(`❌ Error reading .env file: ${err.message}`);
    process.exit(2);
  }
}

// Заменяем или добавляем TELEGRAM_WEBAPP_URL
const regex = /^TELEGRAM_WEBAPP_URL=.*$/m;
const newLine = `TELEGRAM_WEBAPP_URL=${url}`;

if (regex.test(envContent)) {
  // Заменяем существующую строку
  envContent = envContent.replace(regex, newLine);
} else {
  // Добавляем в конец
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += newLine + '\n';
}

// Записываем обратно
try {
  writeFileSync(envPath, envContent, 'utf-8');
  console.log(`✅ Updated TELEGRAM_WEBAPP_URL to ${maskUrl(url)}`);
  console.log('   Restart the bot to apply changes.');
} catch (err) {
  console.error(`❌ Error writing .env file: ${err.message}`);
  process.exit(2);
}
