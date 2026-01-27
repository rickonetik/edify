import { Pool } from 'pg';
import { ContractsV1 } from '@tracked/shared';

/**
 * User database model (matches Postgres schema)
 */
interface UserDbModel {
  id: string;
  telegram_user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Users repository for database operations
 */
export class UsersRepository {
  constructor(private readonly pool: Pool | null) {}

  /**
   * Upsert user by telegram_user_id
   *
   * Creates user if not exists, updates if exists
   */
  async upsertByTelegramUserId(data: {
    telegramUserId: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  }): Promise<ContractsV1.UserV1> {
    if (!this.pool) {
      throw new Error('Database is disabled (SKIP_DB=1). Cannot perform database operations.');
    }
    const now = new Date();

    const query = `
      INSERT INTO users (
        telegram_user_id,
        username,
        first_name,
        last_name,
        avatar_url,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6)
      ON CONFLICT (telegram_user_id)
      DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `;

    const values = [
      data.telegramUserId,
      data.username ?? null,
      data.firstName ?? null,
      data.lastName ?? null,
      data.avatarUrl ?? null,
      now,
    ];

    const result = await this.pool.query<UserDbModel>(query, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to upsert user');
    }

    const row = result.rows[0];

    // Map to ContractsV1.UserV1
    return {
      id: row.id,
      telegramUserId: row.telegram_user_id,
      username: row.username ?? undefined,
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      avatarUrl: row.avatar_url ?? null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  /**
   * Find user by ID
   *
   * @param id - User ID (UUID)
   * @returns User data or null if not found
   */
  async findById(id: string): Promise<ContractsV1.UserV1 | null> {
    if (!this.pool) {
      throw new Error('Database is disabled (SKIP_DB=1). Cannot perform database operations.');
    }

    const query = `
      SELECT *
      FROM users
      WHERE id = $1
    `;

    const result = await this.pool.query<UserDbModel>(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Map to ContractsV1.UserV1
    return {
      id: row.id,
      telegramUserId: row.telegram_user_id,
      username: row.username ?? undefined,
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      avatarUrl: row.avatar_url ?? null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
