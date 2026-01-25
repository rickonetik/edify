import type { ApiOk } from './errors.js';
import type { ID, ISODateTime, Locale } from './common.js';

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
