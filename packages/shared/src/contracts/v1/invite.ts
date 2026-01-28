import { z } from 'zod';
import type { ApiOk } from './errors.js';
import type { ISODateTime } from './common.js';

export type InviteV1 = {
  id: string;
  code: string;
  courseId: string;
  createdAt: ISODateTime;
  expiresAt?: ISODateTime | null;
  maxUses?: number | null;
  usesCount?: number;
};

export const InviteV1Schema = z.object({
  id: z.string(),
  code: z.string(),
  courseId: z.string(),
  createdAt: z.string(),
  expiresAt: z.string().nullable().optional(),
  maxUses: z.number().nullable().optional(),
  usesCount: z.number().optional(),
});

export type Invite = InviteV1;
export type InviteResponse = ApiOk<InviteV1>;
