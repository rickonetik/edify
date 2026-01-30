import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

export interface AuditEntry {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  traceId: string;
  meta?: Record<string, unknown>;
}

/**
 * Minimal audit writer for ban enforcement and future audit needs.
 * Writes to audit_log; trace_id = x-request-id.
 */
@Injectable()
export class AuditService {
  constructor(private readonly pool: Pool | null) {}

  async write(entry: AuditEntry): Promise<void> {
    if (!this.pool) return;

    await this.pool.query(
      `INSERT INTO audit_log (actor_user_id, action, entity_type, entity_id, trace_id, meta)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        entry.actorUserId ?? null,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.traceId,
        JSON.stringify(entry.meta ?? {}),
      ],
    );
  }
}
