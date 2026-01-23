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

  fastify.addHook('onRequest', async function (request: FastifyRequest, reply: FastifyReply) {
    const incomingId = request.headers['x-request-id'];
    request.traceId = typeof incomingId === 'string' ? incomingId : randomUUID();
    request._startAt = Date.now();
    reply.header('x-request-id', request.traceId);
  });
}

export default requestIdPlugin;
