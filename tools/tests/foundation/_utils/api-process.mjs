#!/usr/bin/env node

/**
 * Common helper for starting/stopping API process in foundation tests
 */

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

export const API_PORT = Number(process.env.API_PORT) || 3001;
export const PORT_TIMEOUT = 15000; // 15 seconds
export const STARTUP_TIMEOUT = 30000; // 30 seconds total

let apiProcess = null;
let apiLogFile = null;

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

export async function buildApi() {
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

/**
 * Start API process with environment variables
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.nodeEnv] - NODE_ENV (default: 'test')
 * @param {boolean} [options.skipDb] - SKIP_DB flag (default: true)
 * @param {boolean} [options.swaggerEnabled] - SWAGGER_ENABLED flag (default: false)
 * @param {Object} [options.extraEnv] - Additional environment variables to merge
 * @returns {Promise<void>}
 */
async function waitForPortFree(port, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      // Port is still in use
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      // Port is free (connection refused)
      return true;
    }
  }
  return false;
}

export async function startApi({
  nodeEnv,
  skipDb = true,
  swaggerEnabled = false,
  extraEnv = {},
} = {}) {
  // Ensure previous process is fully stopped and port is free
  await stopApi();
  await waitForPortFree(API_PORT, 5000);
  
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    const timeout = setTimeout(() => {
      if (apiProcess) {
        apiProcess.kill();
      }
      reject(new Error(`API startup timeout after ${STARTUP_TIMEOUT}ms`));
    }, STARTUP_TIMEOUT);

    // Build processEnv with all defaults
    // Note: We need PATH from process.env for pnpm to work, but we explicitly
    // exclude SWAGGER_ENABLED to avoid contamination from previous test runs
    const cleanProcessEnv = { ...process.env };
    // Remove SWAGGER_ENABLED if it exists to ensure our explicit value is used
    delete cleanProcessEnv.SWAGGER_ENABLED;
    
    const processEnv = {
      ...cleanProcessEnv,
      // Merge any extra env vars first
      ...extraEnv,
      // Core settings (override extraEnv if needed)
      API_PORT: String(API_PORT),
      NODE_ENV: nodeEnv || 'test',
      SKIP_DB: skipDb ? '1' : '0',
      // Swagger (default: disabled, but can be overridden by extraEnv)
      // Explicitly set based on parameter to ensure test control
      // IMPORTANT: Set AFTER extraEnv to ensure our value takes precedence
      SWAGGER_ENABLED: swaggerEnabled ? '1' : '0',
      // JWT defaults (required for API to start)
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'test-jwt-secret-for-foundation-tests',
      JWT_ACCESS_TTL_SECONDS: process.env.JWT_ACCESS_TTL_SECONDS || '900',
      // Telegram defaults
      TELEGRAM_BOT_TOKEN:
        process.env.TELEGRAM_BOT_TOKEN || '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
    };

    // Debug: log SWAGGER_ENABLED value (remove after fix)
    console.error(
      `[api-process] Starting API with SWAGGER_ENABLED=${processEnv.SWAGGER_ENABLED}, NODE_ENV=${processEnv.NODE_ENV}, swaggerEnabled param=${swaggerEnabled}`,
    );

    // Create unique log file for this API instance
    const timestamp = Date.now();
    apiLogFile = `/tmp/api-process.${timestamp}.log`;
    writeFileSync(apiLogFile, `=== API Process Log (${new Date().toISOString()}) ===\n`);
    writeFileSync(apiLogFile, `Command: node ${join(cwd, 'apps', 'api', 'dist', 'apps', 'api', 'src', 'main.js')}\n`, { flag: 'a' });
    writeFileSync(apiLogFile, `Environment: NODE_ENV=${processEnv.NODE_ENV}, SWAGGER_ENABLED=${processEnv.SWAGGER_ENABLED}, API_PORT=${processEnv.API_PORT}\n\n`, { flag: 'a' });

    // Launch API directly via node (not via pnpm start) to avoid .env file dependency
    // This ensures foundation tests are completely independent of local .env
    // Note: TypeScript compiles preserving the full path structure
    const apiMainPath = join(cwd, 'apps', 'api', 'dist', 'apps', 'api', 'src', 'main.js');
    apiProcess = spawn('node', [apiMainPath], {
      cwd,
      stdio: 'pipe',
      env: processEnv,
      detached: false, // Keep attached so we can kill it properly
    });

    let stderr = '';
    let stdout = '';
    
    apiProcess.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      writeFileSync(apiLogFile, text, { flag: 'a' });
    });

    apiProcess.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      writeFileSync(apiLogFile, text, { flag: 'a' });
      // Output stderr to console for debugging (remove after fix)
      console.error(`[API stderr] ${text.trim()}`);
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
        
        // Авто-логирование: если API не стартанул, показываем лог-файл
        let errorMessage = `Failed to start API: ${err.message}\n`;
        if (apiLogFile && existsSync(apiLogFile)) {
          errorMessage += `\n📋 API log file: ${apiLogFile}\n`;
          errorMessage += `\n--- Last 50 lines of API log ---\n`;
          try {
            const logContent = readFileSync(apiLogFile, 'utf-8');
            const lines = logContent.split('\n');
            const lastLines = lines.slice(-50).join('\n');
            errorMessage += lastLines;
            if (lastLines.trim()) {
              errorMessage += '\n';
            }
          } catch (readErr) {
            errorMessage += `(Error reading log: ${readErr.message})\n`;
          }
          errorMessage += `--- End of log ---\n`;
        } else {
          errorMessage += `\nStderr: ${stderr}`;
        }
        
        reject(new Error(errorMessage));
      });
  });
}

/**
 * Stop API process
 *
 * @returns {Promise<void>}
 */
export async function stopApi() {
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
    apiLogFile = null;
    // Wait longer for port to be released and process to fully terminate
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

/**
 * Get API base URL
 *
 * @returns {string}
 */
export function getApiBaseUrl() {
  return `http://localhost:${API_PORT}`;
}
