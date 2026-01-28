import { z } from 'zod';
import type { ApiOk } from './errors.js';
import type { ID, ISODateTime } from './common.js';

export type UserV1 = {
  id: ID;
  telegramUserId?: ID;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export const UserV1Schema = z.object({
  id: z.string(),
  telegramUserId: z.string().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = UserV1;
export type MeResponse = ApiOk<UserV1>;
