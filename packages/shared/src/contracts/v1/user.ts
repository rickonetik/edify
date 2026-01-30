import type { ApiOk } from './errors.js';
import type { ID, ISODateTime, Locale } from './common.js';
import { z } from 'zod';

/**
 * User entity V1
 */
export interface UserV1 {
  id: ID;
  telegramUserId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  /** Set when user is banned (internal/enforcement); optional in response */
  bannedAt?: ISODateTime | null;
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

export type User = {
  id: ID;
  name: string;
  handle?: string;
  avatarUrl?: string;
  plan: 'free' | 'pro';
  locale: Locale;
  createdAt: ISODateTime;
};

export type MeResponse = ApiOk<User>;
