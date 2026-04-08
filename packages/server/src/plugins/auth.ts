import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { TokenPayload } from '@nd-battleplanner/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
    teamId?: string;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorateRequest('user', undefined);
  fastify.decorateRequest('teamId', undefined);

  fastify.decorate('verifyToken', async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw { statusCode: 401, message: 'Missing or invalid authorization header' };
    }

    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      request.user = payload;
    } catch {
      throw { statusCode: 401, message: 'Invalid or expired token' };
    }
  });
});
