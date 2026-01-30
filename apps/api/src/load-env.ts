/**
 * Load .env from repo root before any other module.
 * Must be imported first in main.ts so DATABASE_URL etc. are set before AppModule loads.
 * Prefer process.cwd()/.env when running from repo root (e.g. node apps/api/dist/...).
 * NODE_ENV and SWAGGER_ENABLED are preserved if already set (e.g. by tests or process manager).
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fromCwd = resolve(process.cwd(), '.env');
const fromDirname = resolve(__dirname, '../../../../../../.env');

const preserveNodeEnv = process.env.NODE_ENV;
const preserveSwaggerEnabled = process.env.SWAGGER_ENABLED;

config({ path: fromCwd });
if (!process.env.DATABASE_URL) {
  config({ path: fromDirname });
}

if (preserveNodeEnv !== undefined) process.env.NODE_ENV = preserveNodeEnv;
if (preserveSwaggerEnabled !== undefined) process.env.SWAGGER_ENABLED = preserveSwaggerEnabled;
