#!/usr/bin/env node

import { existsSync, readFileSync, unlinkSync } from 'fs';

const PID_DIR = '/tmp';
const PID_FILES = [
  `${PID_DIR}/tracked-webapp.pid`,
  `${PID_DIR}/tracked-ngrok.pid`,
  `${PID_DIR}/tracked-bot.pid`,
];

async function stopProcess(pidFile, name) {
  if (!existsSync(pidFile)) {
    return false;
  }

  try {
    const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10);
    if (isNaN(pid)) {
      console.log(`⚠️  ${name}: Invalid PID in ${pidFile}`);
      unlinkSync(pidFile);
      return false;
    }

    // Проверка, что процесс существует
    try {
      process.kill(pid, 0); // Сигнал 0 проверяет существование процесса
    } catch {
      // Процесс не существует
      console.log(`ℹ️  ${name}: Process ${pid} not running`);
      unlinkSync(pidFile);
      return false;
    }

    // Отправка SIGTERM в process group (минус pid = группа)
    try {
      process.kill(-pid, 'SIGTERM');
      console.log(`🛑 ${name}: Sent SIGTERM to process group ${pid}`);

      // Ждем до 3 секунд
      let waited = 0;
      const checkInterval = 100;
      const maxWait = 3000;

      while (waited < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        waited += checkInterval;
        try {
          process.kill(pid, 0);
        } catch {
          // Процесс завершился
          unlinkSync(pidFile);
          return true;
        }
      }

      // Процесс все еще жив, отправляем SIGKILL в process group
      try {
        process.kill(-pid, 'SIGKILL');
        console.log(`💀 ${name}: Sent SIGKILL to process group ${pid}`);
      } catch {
        // Процесс уже завершился
      }
      unlinkSync(pidFile);
      return true;
    } catch (err) {
      console.log(`⚠️  ${name}: Error stopping PID ${pid}: ${err.message}`);
      unlinkSync(pidFile);
      return false;
    }
  } catch (err) {
    console.log(`⚠️  ${name}: Error reading ${pidFile}: ${err.message}`);
    if (existsSync(pidFile)) {
      unlinkSync(pidFile);
    }
    return false;
  }
}

async function main() {
  console.log('🛑 Stopping Telegram dev environment...\n');

  const results = await Promise.all([
    stopProcess(PID_FILES[0], 'Webapp'),
    stopProcess(PID_FILES[1], 'ngrok'),
    stopProcess(PID_FILES[2], 'Bot'),
  ]);

  const stopped = results.filter(Boolean).length;
  console.log(`\n✅ Stopped ${stopped} service(s)`);
  console.log('💡 All PID files cleaned up');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
