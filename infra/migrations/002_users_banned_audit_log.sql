-- Migration: users.banned_at, ban_reason + audit_log (Story 3.5)
-- Created: 2026-01-30

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE NULL,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT NULL;

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  actor_user_id UUID NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  trace_id TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_log_trace_id_idx ON audit_log (trace_id);
CREATE INDEX IF NOT EXISTS audit_log_actor_user_id_idx ON audit_log (actor_user_id);
