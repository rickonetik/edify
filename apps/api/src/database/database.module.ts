import { Module, Global, OnModuleInit, OnModuleDestroy, Optional } from '@nestjs/common';
import { Pool } from 'pg';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';

// Allow DATABASE_URL to be optional when SKIP_DB=1
// Note: We check process.env at module load time, but DATABASE_URL may be set later.
// The actual check happens in onModuleInit where we verify this.pool.
const skipDb = process.env.SKIP_DB === '1';
let env;
try {
  env = validateOrThrow(ApiEnvSchema, process.env);
} catch (error) {
  // If validation fails and SKIP_DB=1, allow missing DATABASE_URL
  if (skipDb) {
    env = { ...process.env, DATABASE_URL: undefined } as any;
  } else {
    throw error;
  }
}

// Determine if DB is disabled: SKIP_DB=1 OR DATABASE_URL not set in validated env
const isDbDisabled = skipDb || !env.DATABASE_URL;

@Global()
@Module({
  providers: [
    {
      provide: Pool,
      useFactory: () => {
        if (isDbDisabled) {
          // Return null when DB is disabled
          return null;
        }
        if (!env.DATABASE_URL) {
          throw new Error('DATABASE_URL is required when SKIP_DB is not set');
        }
        return new Pool({
          connectionString: env.DATABASE_URL,
          connectionTimeoutMillis: 3000, // Fail-fast: 3 seconds
        });
      },
    },
  ],
  exports: [Pool],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(@Optional() private readonly pool: Pool | null) {}

  async onModuleInit() {
    // Check if pool is null (disabled)
    // If pool is null, it means isDbDisabled was true at module load time
    if (!this.pool) {
      // Determine the actual reason: check skipDb first, then check if DATABASE_URL was missing
      const reason = skipDb ? 'SKIP_DB=1' : 'DATABASE_URL not set';
      console.warn(`⚠️  Database is disabled (${reason}). DB-dependent endpoints will fail.`);
      return;
    }

    // If we have a pool, DB is enabled - no warning needed, proceed with connection test

    // Test connection with fail-fast timeout
    try {
      await Promise.race([
        this.pool.query('SELECT 1'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database connection timeout (3s)')), 3000),
        ),
      ]);
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }

    // Ensure users table exists (run migration if needed)
    // In production, migrations should be run separately
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          telegram_user_id TEXT NOT NULL UNIQUE,
          username TEXT,
          first_name TEXT,
          last_name TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_users_telegram_user_id ON users(telegram_user_id);
      `);
    } catch (error) {
      console.warn('Failed to create users table (may already exist):', error);
      // Don't throw - table might already exist
    }
  }

  async onModuleDestroy() {
    if (this.pool && !isDbDisabled) {
      await this.pool.end();
    }
  }
}
