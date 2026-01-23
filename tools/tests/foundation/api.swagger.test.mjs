#!/usr/bin/env node

/**
 * Foundation Smoke Test: Swagger Documentation
 * Tests: /docs available in dev, 404 in production
 */

import { test } from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const API_PORT = process.env.API_PORT || 3001;
const API_URL = `http://localhost:${API_PORT}`;

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

async function startApi(env = {}) {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    apiProcess = spawn('pnpm', ['--filter', '@tracked/api', 'start'], {
      cwd,
      stdio: 'pipe',
      env: { ...process.env, ...env, API_PORT: String(API_PORT) },
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

test('GET /docs returns 200 in development mode', async () => {
  await startApi({ NODE_ENV: 'development' });
  
  try {
    const response = await fetch(`${API_URL}/docs`);
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
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
