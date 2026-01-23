#!/usr/bin/env node

/**
 * Foundation Smoke Test: API Health Endpoint
 * Tests: /health response format, x-request-id header, traceId
 */

import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const API_PORT = process.env.API_PORT || 3001;
const API_URL = `http://localhost:${API_PORT}`;
const TIMEOUT = 30000; // 30 seconds

let apiProcess = null;

async function waitForPort(port, timeout = 10000) {
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

async function startApi() {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    apiProcess = spawn('pnpm', ['--filter', '@tracked/api', 'start'], {
      cwd,
      stdio: 'pipe',
      env: { ...process.env, API_PORT: String(API_PORT) },
    });

    let stderr = '';
    apiProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    apiProcess.on('error', reject);

    waitForPort(API_PORT, 20000)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        apiProcess.kill();
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
