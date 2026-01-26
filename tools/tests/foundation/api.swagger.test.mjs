#!/usr/bin/env node

/**
 * Foundation Smoke Test: Swagger Documentation
 * Tests: /docs available in dev, 404 in production
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

async function startApi(env = {}) {
  // Ensure previous process is stopped and port is free
  await stopApi();
  // Wait a bit more to ensure port is released
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const timeout = setTimeout(() => {
      if (apiProcess) {
        apiProcess.kill();
      }
      reject(new Error(`API startup timeout after ${STARTUP_TIMEOUT}ms`));
    }, STARTUP_TIMEOUT);

    // Explicitly set NODE_ENV to ensure deterministic behavior
    // Important: env parameter overrides process.env, so explicitly passed NODE_ENV takes precedence
    const processEnv = { ...process.env, API_PORT: String(API_PORT), ...env };
    if (!processEnv.NODE_ENV) {
      processEnv.NODE_ENV = 'development'; // Default to development for tests
      processEnv.SKIP_DB = '1'; // Foundation tests don't require DB
    }
    // Ensure SKIP_DB is set for foundation tests if not explicitly provided
    if (!('SKIP_DB' in env)) {
      processEnv.SKIP_DB = '1';
    }
    
    // Use TELEGRAM_BOT_TOKEN from process.env (set in .env or CI secrets)
    // If not set, use test token (for local development without .env)
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

test('GET /docs returns 200 in development mode', async () => {
  await buildApi();
  await startApi({ NODE_ENV: 'development', SKIP_DB: '1' });
  
  try {
    // Try /docs first, if 404 try /docs/ (some Swagger setups use trailing slash)
    let response = await fetch(`${API_URL}/docs`);
    if (response.status === 404) {
      response = await fetch(`${API_URL}/docs/`);
    }
    
    if (response.status !== 200) {
      const body = await response.text();
      throw new Error(`Expected 200, got ${response.status}. Response: ${body.substring(0, 200)}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error(`Expected text/html, got ${contentType}`);
    }
  } finally {
    await stopApi();
  }
});

test('GET /docs returns 404 with error format in production mode', async () => {
  await buildApi();
  await startApi({ NODE_ENV: 'production', SKIP_DB: '1' });
  
  try {
    const response = await fetch(`${API_URL}/docs`);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }

    const body = await response.json();
    
    // Check unified error format
    if (!body.statusCode || !body.code || !body.message || !body.requestId) {
      throw new Error(`Invalid error response format: ${JSON.stringify(body)}`);
    }

    if (body.statusCode !== 404) {
      throw new Error(`Expected statusCode 404, got ${body.statusCode}`);
    }

    if (body.code !== 'NOT_FOUND') {
      throw new Error(`Expected code NOT_FOUND, got ${body.code}`);
    }

    // Check x-request-id header
    const requestId = response.headers.get('x-request-id');
    if (!requestId) {
      throw new Error('Missing x-request-id header');
    }
  } finally {
    await stopApi();
  }
});
