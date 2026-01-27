#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import fs from 'node:fs';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');
const envPath = resolve(rootDir, '.env');

const PID_DIR = '/tmp';
const WEBAPP_PID = `${PID_DIR}/tracked-webapp.pid`;
const WEBAPP_LOG = `${PID_DIR}/tracked-webapp.log`;
const NGROK_PID = `${PID_DIR}/tracked-ngrok.pid`;
const NGROK_LOG = `${PID_DIR}/tracked-ngrok.log`;
const BOT_PID = `${PID_DIR}/tracked-bot.pid`;
const BOT_LOG = `${PID_DIR}/tracked-bot.log`;

// Проверка наличия ngrok
function checkNgrok() {
  return new Promise((resolve) => {
    const check = spawn('ngrok', ['version'], { stdio: 'pipe' });
    check.on('close', (code) => {
      resolve(code === 0);
    });
    check.on('error', () => {
      resolve(false);
    });
  });
}

// Запуск процесса detached с логированием
function spawnDetachedLogged(command, args, { cwd, env, logPath }) {
  // fd должен быть готов ДО spawn
  const fd = fs.openSync(logPath, 'a');

  const child = spawn(command, args, {
    cwd,
    env,
    detached: true,
    stdio: ['ignore', fd, fd], // stdout+stderr -> log
  });

  // Важно: закрываем fd в родителе (у child уже есть копия)
  fs.closeSync(fd);

  // Отвязываем, чтобы родитель мог завершиться
  child.unref();

  return child;
}

// Получение ngrok URL через API
function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const tunnels = json.tunnels || [];
          const httpsTunnel = tunnels.find((t) => t.proto === 'https');
          if (httpsTunnel && httpsTunnel.public_url) {
            resolve(httpsTunnel.public_url);
          } else {
            reject(new Error('No HTTPS tunnel found'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout waiting for ngrok API'));
    });
  });
}

// Маскировка URL (только домен)
function maskUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname || 'masked';
  } catch {
    return 'masked';
  }
}

// Ожидание появления ngrok URL
async function waitForNgrokUrl(maxAttempts = 30, delayMs = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const url = await getNgrokUrl();
      return url;
    } catch {
      if (i < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw new Error('Failed to get ngrok URL after multiple attempts');
}

// Выполнение команды синхронно
function runCommand(cmd, args, cwd) {
  return execSync([cmd, ...args].join(' '), { cwd, stdio: 'pipe' });
}

// Парсинг .env файла (без зависимостей)
function parseDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, 'utf-8');
  const env = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    // Пропускаем пустые строки и комментарии
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    // Убираем кавычки если есть
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) {
      env[key] = value;
    }
  }

  return env;
}

// Проверка, что процесс жив
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Telegram dev environment...\n');

  // Проверка ngrok
  console.log('📋 Checking ngrok...');
  const hasNgrok = await checkNgrok();
  if (!hasNgrok) {
    console.error('❌ Error: ngrok is not available');
    console.error('   Install ngrok: https://ngrok.com/download');
    console.error('   Configure authtoken: ngrok config add-authtoken YOUR_TOKEN');
    process.exit(2);
  }
  console.log('✅ ngrok found\n');

  // Запуск webapp
  console.log('🌐 Starting webapp on port 5173...');
  try {
    const webapp = spawnDetachedLogged(
      'pnpm',
      ['--filter', '@tracked/webapp', 'dev', '--host', '0.0.0.0', '--port', '5173'],
      { cwd: rootDir, env: process.env, logPath: WEBAPP_LOG }
    );
    writeFileSync(WEBAPP_PID, String(webapp.pid));
    console.log(`   PID: ${webapp.pid}, log: ${WEBAPP_LOG}`);
  } catch (err) {
    console.error(`❌ Error starting webapp: ${err.message}`);
    process.exit(1);
  }

  // Небольшая задержка перед запуском ngrok
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Запуск ngrok
  console.log('\n🔗 Starting ngrok tunnel...');
  try {
    const ngrok = spawnDetachedLogged(
      'ngrok',
      ['http', '5173'],
      { cwd: rootDir, env: process.env, logPath: NGROK_LOG }
    );
    writeFileSync(NGROK_PID, String(ngrok.pid));
    console.log(`   PID: ${ngrok.pid}, log: ${NGROK_LOG}`);
  } catch (err) {
    console.error(`❌ Error starting ngrok: ${err.message}`);
    process.exit(1);
  }

  // Ожидание ngrok URL
  console.log('\n⏳ Waiting for ngrok URL...');
  let ngrokUrl;
  try {
    ngrokUrl = await waitForNgrokUrl();
    console.log(`✅ ngrok URL ready: ${maskUrl(ngrokUrl)}`);
  } catch (err) {
    console.error(`❌ Error getting ngrok URL: ${err.message}`);
    process.exit(1);
  }

  // Обновление .env через helper
  console.log('\n📝 Updating TELEGRAM_WEBAPP_URL in .env...');
  try {
    // Гарантируем, что URL включает https://
    const urlToSet = ngrokUrl.startsWith('https://') ? ngrokUrl : `https://${ngrokUrl}`;
    runCommand('pnpm', ['bot:set-url', urlToSet], rootDir);
    console.log('✅ .env updated');
  } catch (err) {
    console.error(`❌ Error updating .env: ${err.message}`);
    process.exit(1);
  }

  // Парсим .env для передачи боту
  const dotEnv = parseDotEnv(envPath);
  const childEnv = { ...process.env, ...dotEnv };

  // Проверяем, что BOT_TOKEN есть
  if (!childEnv.BOT_TOKEN) {
    console.error('❌ Error: BOT_TOKEN not found in .env file');
    console.error('   Please set BOT_TOKEN in .env file');
    process.exit(1);
  }

  // Запуск бота
  console.log('\n🤖 Starting bot...');
  let bot;
  try {
    bot = spawnDetachedLogged(
      'pnpm',
      ['--filter', '@tracked/bot', 'dev'],
      { cwd: rootDir, env: childEnv, logPath: BOT_LOG }
    );
    writeFileSync(BOT_PID, String(bot.pid));
    console.log(`   PID: ${bot.pid}, log: ${BOT_LOG}`);
  } catch (err) {
    console.error(`❌ Error starting bot: ${err.message}`);
    process.exit(1);
  }

  // Post-start check: проверяем, что бот жив
  console.log('\n🔍 Verifying bot is running...');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Даем время на старт

  if (!isProcessAlive(bot.pid)) {
    console.error(`❌ Error: Bot process ${bot.pid} died immediately after start`);
    console.error(`   See ${BOT_LOG} for details`);
    process.exit(1);
  }

  // Дополнительная проверка через несколько секунд
  await new Promise((resolve) => setTimeout(resolve, 3000));
  if (!isProcessAlive(bot.pid)) {
    console.error(`❌ Error: Bot process ${bot.pid} died after start`);
    console.error(`   See ${BOT_LOG} for details`);
    process.exit(1);
  }

  console.log('✅ Bot is running');

  // Итоговый вывод
  console.log('\n✨ All services started!\n');
  console.log(`🌐 Webapp: http://localhost:5173`);
  console.log(`🔗 ngrok: ${maskUrl(ngrokUrl)}`);
  console.log(`🤖 Bot: running\n`);
  console.log('📁 PID files:');
  console.log(`   ${WEBAPP_PID}`);
  console.log(`   ${NGROK_PID}`);
  console.log(`   ${BOT_PID}\n`);
  console.log('📄 Log files:');
  console.log(`   ${WEBAPP_LOG}`);
  console.log(`   ${NGROK_LOG}`);
  console.log(`   ${BOT_LOG}\n`);
  console.log('💡 Stop all services: pnpm telegram:dev:down');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
