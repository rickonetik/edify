import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ExpertsModule } from '../experts/experts.module.js';
import { ExpertsRepository } from '../experts/experts.repository.js';
import { ExpertSubscriptionsRepository } from './expert-subscriptions.repository.js';

@Module({
  imports: [ExpertsModule],
  providers: [
    {
      provide: ExpertSubscriptionsRepository,
      useFactory: (pool: Pool, expertsRepository: ExpertsRepository) =>
        new ExpertSubscriptionsRepository(pool, expertsRepository),
      inject: [Pool, ExpertsRepository],
    },
  ],
  exports: [ExpertSubscriptionsRepository],
})
export class SubscriptionsModule {}
