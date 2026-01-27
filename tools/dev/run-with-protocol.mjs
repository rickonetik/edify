#!/usr/bin/env node

/**
 * Протокол анти-зацикливания для выполнения команд
 * 
 * Требования:
 * 1. Не использовать tail/head/grep в командах
 * 2. Любую команду запускать с обёрткой: (set -o pipefail; <COMMAND> 2>&1 | tee /tmp/cursor-step.log)
 * 3. После выполнения показать: EXIT=$? и tail -80 /tmp/cursor-step.log
 * 4. Если команда идёт > 60 секунд — остановить процесс (watchdog)
 * 5. Никаких повторов одинаковых фраз
 * 
 * Usage: node tools/dev/run-with-protocol.mjs --timeout-ms=60000 -- <cmd> <args...>
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);

const sepIndex = argv.indexOf('--');
let cmdArgs = sepIndex === -1 ? argv : argv.slice(sepIndex + 1);

// guard: some callers accidentally pass an extra "--"
// Remove all leading "--" arguments
while (cmdArgs.length > 0 && cmdArgs[0] === '--') {
  cmdArgs = cmdArgs.slice(1);
}

const timeoutMsArg = argv.find((a) => a.startsWith('--timeout-ms='));
const timeoutMs = timeoutMsArg ? Number(timeoutMsArg.split('=')[1]) : 60000;

if (cmdArgs.length === 0) {
  console.error('Usage: node tools/dev/run-with-protocol.mjs [--timeout-ms=60000] -- <cmd> <args...>');
  process.exit(2);
}

// Уникальное имя лог-файла с timestamp
const timestamp = Date.now();
const LOG_FILE = `/tmp/cursor-step.${timestamp}.log`;

const cmd = cmdArgs[0];
const args = cmdArgs.slice(1);
const fullCmd = [cmd, ...args].join(' ');

// Экранируем аргументы для безопасной передачи в shell
const escapeShell = (arg) => {
  if (/^[a-zA-Z0-9_/.-]+$/.test(arg)) {
    return arg;
  }
  return `'${arg.replace(/'/g, "'\\''")}'`;
};

const escapedCmd = escapeShell(cmd);
const escapedArgs = args.map(escapeShell).join(' ');
const escapedFullCmd = escapedArgs ? `${escapedCmd} ${escapedArgs}` : escapedCmd;

// Формируем команду с протоколом анти-зацикливания
// Используем zsh для поддержки set -o pipefail
// (set -o pipefail; <COMMAND> 2>&1 | tee /tmp/cursor-step.log)
const shellCmd = `(set -o pipefail; ${escapedFullCmd} 2>&1 | tee ${LOG_FILE})`;

const startTime = Date.now();

// detached + new process group -> we can kill process group
// Важно: detached: true создаёт новую process group, что позволяет убить всю группу через -pid
const child = spawn('zsh', ['-c', shellCmd], {
  stdio: 'inherit',
  env: process.env,
  detached: true,
});

let killed = false;

const killGroup = (signal) => {
  try {
    // Убиваем всю process group (отрицательный PID)
    process.kill(-child.pid, signal);
  } catch {
    // Игнорируем ошибки (процесс может уже завершиться)
  }
};

const t = setTimeout(() => {
  killed = true;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.error(`\n[watchdog] Timeout ${timeoutMs}ms (${elapsed}s) exceeded. Terminating process group...`);
  killGroup('SIGTERM');
  setTimeout(() => killGroup('SIGKILL'), 5000).unref();
}, timeoutMs);

child.on('exit', (code, signal) => {
  clearTimeout(t);
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const exitCode = killed ? 124 : (signal ? 1 : (code ?? 1));
  
  // Показываем информацию о выполнении
  console.log(`\n--- Execution Summary ---`);
  console.log(`Command: ${fullCmd}`);
  console.log(`PID: ${child.pid}`);
  console.log(`Duration: ${elapsed}s`);
  if (killed) {
    console.log(`Status: Killed by watchdog (timeout ${timeoutMs}ms)`);
  } else if (signal) {
    console.log(`Status: Terminated by signal ${signal}`);
  } else {
    console.log(`Status: Completed`);
  }
  console.log(`EXIT=${exitCode}`);
  
  // Показываем последние 80 строк лога
  try {
    if (existsSync(LOG_FILE)) {
      const logContent = readFileSync(LOG_FILE, 'utf-8');
      const lines = logContent.split('\n');
      const lastLines = lines.slice(-80).join('\n');
      console.log('\n--- Last 80 lines of log ---');
      console.log(lastLines);
    } else {
      console.log('\n--- Log file not found ---');
    }
  } catch (err) {
    console.error(`\n--- Error reading log: ${err.message} ---`);
  }
  
  process.exit(exitCode);
});
