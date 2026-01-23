#!/usr/bin/env node

/**
 * Foundation Smoke Test: API Error Format
 * Tests: 404 error format, 400 validation error format, traceId consistency
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

    apiProcess = spawn('pnpm', ['--filter', '@tracked/api', 'start'], {
      cwd,
      stdio: 'pipe',
      env: { ...process.env, API_PORT: String(API_PORT), NODE_ENV: 'development' },
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

test.before(async () => {
  // Build API first to ensure it's ready
  await buildApi();
  // Start API and wait for it to be ready
  await startApi();
});

test.after(async () => {
  await stopApi();
});

test('GET /nope returns 404 with unified error format', async () => {
  const response = await fetch(`${API_URL}/nope`);
  
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

  // traceId should match x-request-id
  if (body.traceId !== requestId) {
    throw new Error(`traceId (${body.traceId}) does not match x-request-id (${requestId})`);
  }
});

test('GET /health/400 returns 400 with validation error format', async () => {
  const response = await fetch(`${API_URL}/health/400`);
  
  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }

  const body = await response.json();
  
  // Check unified error format
  if (!body.statusCode || !body.code || !body.message || !body.traceId) {
    throw new Error(`Invalid error response format: ${JSON.stringify(body)}`);
  }

  if (body.statusCode !== 400) {
    throw new Error(`Expected statusCode 400, got ${body.statusCode}`);
  }

  if (body.code !== 'VALIDATION_ERROR') {
    throw new Error(`Expected code VALIDATION_ERROR, got ${body.code}`);
  }

  // Check details array for validation errors
  if (!Array.isArray(body.details)) {
    throw new Error(`Expected details array, got ${typeof body.details}`);
  }

  // Check x-request-id header
  const requestId = response.headers.get('x-request-id');
  if (!requestId) {
    throw new Error('Missing x-request-id header');
  }

  // traceId should match x-request-id
  if (body.traceId !== requestId) {
    throw new Error(`traceId (${body.traceId}) does not match x-request-id (${requestId})`);
  }
});
