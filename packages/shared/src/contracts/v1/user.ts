import { z } from 'zod';
import type { Id, IsoDateTime, UrlString } from './common.js';

/**
 * User entity V1
 */
export interface UserV1 {
  id: Id;
  telegramUserId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: UrlString | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  /** Set when user is banned (internal/enforcement); optional in response */
  bannedAt?: IsoDateTime | null;
}

/**
 * Zod schema for UserV1
 */
export const UserV1Schema = z.object({
  id: z.string(),
  telegramUserId: z.string().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  bannedAt: z.string().nullable().optional(),
});
