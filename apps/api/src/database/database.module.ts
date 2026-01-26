import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';

const env = validateOrThrow(ApiEnvSchema, process.env);

@Global()
@Module({
  providers: [
    {
      provide: Pool,
      useFactory: () => {
        if (!env.DATABASE_URL) {
          throw new Error('DATABASE_URL is required');
        }
        return new Pool({
          connectionString: env.DATABASE_URL,
        });
      },
    },
  ],
  exports: [Pool],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}

  async onModuleInit() {
    // Test connection
    try {
      await this.pool.query('SELECT 1');
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
    await this.pool.end();
  }
}
