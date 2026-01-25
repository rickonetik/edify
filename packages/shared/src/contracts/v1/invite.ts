import type { ApiOk } from './errors.js';
import type { ISODateTime } from './common.js';

export type Invite = {
  code: string;
  url: string;
  createdAt: ISODateTime;
};

export type InviteResponse = ApiOk<Invite>;
