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
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const timeout = setTimeout(() => {
      if (apiProcess) {
        apiProcess.kill();
      }
      reject(new Error(`API startup timeout after ${STARTUP_TIMEOUT}ms`));
    }, STARTUP_TIMEOUT);

    // Explicitly set NODE_ENV to ensure deterministic behavior
    const processEnv = { ...process.env, ...env, API_PORT: String(API_PORT) };
    if (!processEnv.NODE_ENV) {
      processEnv.NODE_ENV = 'development'; // Default to development for tests
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
    await once(apiProcess, 'exit').catch(() => {});
    apiProcess = null;
  }
}

test('GET /docs returns 200 in development mode', async () => {
  await buildApi();
  await startApi({ NODE_ENV: 'development' });
  
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
  await startApi({ NODE_ENV: 'production' });
  
  try {
    const response = await fetch(`${API_URL}/docs`);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`);
    }

    const body = await response.json();
    
    // Check unified error format
    if (!body.statusCode || !body.code || !body.message || !body.traceId) {
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
