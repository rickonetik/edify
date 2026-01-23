import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    traceId: string;
    _startAt?: number;
  }
}

const requestIdPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('traceId', '');

  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const incomingId = request.headers['x-request-id'];
    request.traceId = typeof incomingId === 'string' ? incomingId : randomUUID();
    request._startAt = Date.now();
  });

  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('x-request-id', request.traceId);
  });
};

export default requestIdPlugin;
