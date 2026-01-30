/**
 * Load .env from repo root before any other module.
 * Must be imported first in main.ts so DATABASE_URL etc. are set before AppModule loads.
 * Explicit env vars (e.g. NODE_ENV, SWAGGER_ENABLED from test runner) must not be overwritten by .env.
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fromCwd = resolve(process.cwd(), '.env');
const fromDirname = resolve(__dirname, '../../../../../../.env');

// Save before config() so .env cannot override explicit test/process-manager values
const hadNodeEnv = process.env.NODE_ENV !== undefined;
const hadSwaggerEnabled = process.env.SWAGGER_ENABLED !== undefined;
const savedNodeEnv = process.env.NODE_ENV;
const savedSwaggerEnabled = process.env.SWAGGER_ENABLED;

config({ path: fromCwd });
if (!process.env.DATABASE_URL) {
  config({ path: fromDirname });
}

if (hadNodeEnv) process.env.NODE_ENV = savedNodeEnv;
if (hadSwaggerEnabled) process.env.SWAGGER_ENABLED = savedSwaggerEnabled;
