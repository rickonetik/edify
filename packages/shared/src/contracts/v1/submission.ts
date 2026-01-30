import type { ApiOk } from './errors.js';
import type { ID, ISODateTime } from './common.js';

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type Submission = {
  id: ID;
  lessonId: ID;
  userId: ID;
  status: SubmissionStatus;
  text?: string;
  attachments?: { name: string; url: string }[];
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
};

export type SubmissionResponse = ApiOk<Submission>;
