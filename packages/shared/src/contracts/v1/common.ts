export type ID = string;
export type ISODateTime = string;
export type ISODate = string;

export type Locale = 'ru' | 'en';
export type Platform = 'web' | 'tg-miniapp';

export type Pagination = { cursor?: string; limit: number };
export type PageInfo = { nextCursor?: string | null };
