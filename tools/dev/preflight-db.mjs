#!/usr/bin/env node

/**
 * Preflight check for database port conflicts
 *
 * Ensures only one Postgres instance is listening on port 5432
 * (either Docker or local, but not both).
 */

import { execSync } from 'node:child_process';

const PORT = 5432;

function checkPortListeners() {
  try {
    const output = execSync(
      `lsof -nP -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true`,
      { encoding: 'utf-8' },
    );
    return output.trim().split('\n').filter((line) => line.trim());
  } catch {
    return [];
  }
}

function main() {
  const listeners = checkPortListeners();

  if (listeners.length === 0) {
    console.log(`✅ Port ${PORT} is free (no Postgres running)`);
    return 0;
  }

  if (listeners.length === 1) {
    const line = listeners[0];
    if (line.includes('com.docker') || line.includes('postgres')) {
      console.log(`✅ Port ${PORT} has single listener: ${line.split(/\s+/)[0]}`);
      return 0;
    }
  }

  // Multiple listeners or unexpected process
  console.error(`❌ Port ${PORT} has multiple or unexpected listeners:`);
  listeners.forEach((line) => console.error(`   ${line}`));
  console.error('');
  console.error('⚠️  Conflict detected: Multiple Postgres instances on port 5432');
  console.error('');
  console.error('Fix: Stop local Postgres services:');
  console.error('   brew services stop postgresql@14 || true');
  console.error('   brew services stop postgresql@15 || true');
  console.error('   brew services stop postgresql@16 || true');
  console.error('');
  console.error('Or stop Docker Compose Postgres:');
  console.error('   docker compose -f infra/docker-compose.yml stop postgres');
  console.error('');
  return 1;
}

process.exit(main());
