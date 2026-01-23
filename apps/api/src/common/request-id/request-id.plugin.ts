import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    traceId: string;
    _startAt?: number;
  }
}

async function requestIdPlugin(fastify: any) {
  fastify.decorateRequest('traceId', '');

  fastify.addHook('preHandler', async function (request: FastifyRequest, reply: FastifyReply) {
    reply.header('x-request-id', request.traceId);
  });
}

export default requestIdPlugin;
