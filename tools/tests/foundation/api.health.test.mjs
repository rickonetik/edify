#!/usr/bin/env node

/**
 * Foundation Smoke Test: API Health Endpoint
 * Tests: /health response format, x-request-id header, requestId
 * 
 * This test is deterministic: it builds and starts the API itself,
 * waits for the port to be available, and cleans up after itself.
 */

import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { execSync } from 'node:child_process';

const API_PORT = process.env.API_PORT || 3001;
const API_URL = `http://localhost:${API_PORT}`;
const PORT_TIMEOUT = 15000; // 15 seconds
const STARTUP_TIMEOUT = 30000; // 30 seconds total

let apiProcess = null;

async function waitForPort(port, timeout = PORT_TIMEOUT) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      if (response.ok) {
        return true;
      }
    } catch (err) {
      // Port not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Port ${port} did not become available within ${timeout}ms`);
}

async function buildApi() {
  try {
    // Build shared first (required dependency)
    execSync('pnpm --filter @tracked/shared build', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    // Then build API
    execSync('pnpm --filter @tracked/api build', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
  } catch (err) {
    throw new Error(`Failed to build API: ${err.message}`);
  }
}

async function startApi() {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const timeout = setTimeout(() => {
      if (apiProcess) {
        apiProcess.kill();
      }
      reject(new Error(`API startup timeout after ${STARTUP_TIMEOUT}ms`));
    }, STARTUP_TIMEOUT);

    // Use TELEGRAM_BOT_TOKEN from process.env (set in .env or CI secrets)
    // If not set, use test token (for local development without .env)
    // Foundation tests don't require DB, so set SKIP_DB=1
    // JWT required for API to start (used by /me and auth)
    const processEnv = {
      ...process.env,
      API_PORT: String(API_PORT),
      NODE_ENV: 'test',
      SKIP_DB: '1',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'test-jwt-secret-for-foundation-tests',
      JWT_ACCESS_TTL_SECONDS: process.env.JWT_ACCESS_TTL_SECONDS || '900',
    };
    if (!processEnv.TELEGRAM_BOT_TOKEN) {
      processEnv.TELEGRAM_BOT_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
    }

    apiProcess = spawn('pnpm', ['--filter', '@tracked/api', 'start'], {
      cwd,
      stdio: 'pipe',
      env: processEnv,
    });

    let stderr = '';
    apiProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    apiProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    waitForPort(API_PORT, PORT_TIMEOUT)
      .then(() => {
        clearTimeout(timeout);
        resolve();
      })
      .catch((err) => {
        clearTimeout(timeout);
        if (apiProcess) {
          apiProcess.kill();
        }
        reject(new Error(`Failed to start API: ${err.message}\nStderr: ${stderr}`));
      });
  });
}

async function stopApi() {
  if (apiProcess) {
    apiProcess.kill('SIGTERM');
    try {
      await Promise.race([
        once(apiProcess, 'exit'),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch {
      // Ignore errors
    }
    // Force kill if still running
    if (apiProcess && !apiProcess.killed) {
      apiProcess.kill('SIGKILL');
      await once(apiProcess, 'exit').catch(() => {});
    }
    apiProcess = null;
    // Wait a bit for port to be released
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

test.before(async () => {
  // Build API first to ensure it's ready
  await buildApi();
  // Start API and wait for it to be ready
  await startApi();
});

test.after(async () => {
  await stopApi();
});

test('GET /health returns 200 with correct format', async () => {
  const response = await fetch(`${API_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  const body = await response.json();
  
  // Check response body structure
  if (!body.ok || typeof body.env !== 'string' || typeof body.version !== 'string') {
    throw new Error(`Invalid health response: ${JSON.stringify(body)}`);
  }

  // Check x-request-id header
  const requestId = response.headers.get('x-request-id');
  if (!requestId || requestId.trim().length === 0) {
    throw new Error('Missing or empty x-request-id header');
  }
});

test('GET /health includes x-request-id header', async () => {
  const response = await fetch(`${API_URL}/health`);
  
  const requestId = response.headers.get('x-request-id');
  if (!requestId) {
    throw new Error('x-request-id header is missing');
  }
  
  // Should be a valid UUID or similar format
  if (requestId.trim().length === 0) {
    throw new Error('x-request-id header is empty');
  }
});
