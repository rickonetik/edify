/**
 * Load .env from repo root before any other module.
 * Must be imported first in main.ts so DATABASE_URL etc. are set before AppModule loads.
 * Prefer process.cwd()/.env when running from repo root (e.g. node apps/api/dist/...).
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fromCwd = resolve(process.cwd(), '.env');
const fromDirname = resolve(__dirname, '../../../../../../.env');
config({ path: fromCwd });
if (!process.env.DATABASE_URL) {
  config({ path: fromDirname });
}
