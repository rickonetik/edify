import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { AuditService } from './audit.service.js';

@Module({
  providers: [
    {
      provide: AuditService,
      useFactory: (pool: Pool | null) => new AuditService(pool),
      inject: [Pool],
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
