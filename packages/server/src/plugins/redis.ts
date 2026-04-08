import fp from 'fastify-plugin';
import Redis from 'ioredis';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  redis.on('error', (err) => {
    fastify.log.error(err, 'Redis connection error');
  });

  redis.on('connect', () => {
    fastify.log.info('Connected to Redis');
  });

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
  });
});
