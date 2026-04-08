import { config } from 'dotenv';
config({ path: '../../.env' });
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import battleplansRoutes from './routes/battleplans.js';
import drawsRoutes from './routes/draws.js';
import operatorSlotsRoutes from './routes/operator-slots.js';
import roomsRoutes from './routes/rooms.js';
import adminUsersRoutes from './routes/admin/users.js';
import adminTeamsRoutes from './routes/admin/teams.js';
import adminSettingsRoutes from './routes/admin/settings.js';
import { setupSocket } from './socket/index.js';
import { startCleanupScheduler, stopCleanupScheduler } from './services/cleanup.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || '3001');

async function start() {
  const fastify = Fastify({ logger: true });

  // Plugins
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });
  await fastify.register(cookie);
  await fastify.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await fastify.register(redisPlugin);
  await fastify.register(authPlugin);

  // Static files for uploads
  await fastify.register(fastifyStatic, {
    root: path.resolve(process.env.UPLOAD_DIR || path.join(import.meta.dirname, '..', 'uploads')),
    prefix: '/uploads/',
  });

  // API Routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(gamesRoutes, { prefix: '/api/games' });
  await fastify.register(battleplansRoutes, { prefix: '/api/battleplans' });
  await fastify.register(drawsRoutes, { prefix: '/api' });
  await fastify.register(operatorSlotsRoutes, { prefix: '/api' });
  await fastify.register(roomsRoutes, { prefix: '/api/rooms' });

  // Admin Routes
  await fastify.register(adminUsersRoutes, { prefix: '/api/admin/users' });
  await fastify.register(adminTeamsRoutes, { prefix: '/api/admin/teams' });
  await fastify.register(adminSettingsRoutes, { prefix: '/api/admin/settings' });

  // Health check
  fastify.get('/api/health', async () => ({ status: 'ok' }));

  // Error handler
  fastify.setErrorHandler((err, _request, reply) => {
    const error = err as Record<string, any>;
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        statusCode: 400,
      });
    }

    // Zod validation errors
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.issues?.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ') || error.message,
        statusCode: 400,
      });
    }

    const statusCode = error.statusCode || 500;
    fastify.log.error(err);
    return reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : 'Error',
      message: statusCode >= 500 ? 'An unexpected error occurred' : error.message,
      statusCode,
    });
  });

  // Socket.IO
  const io = new Server(fastify.server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : true,
      credentials: true,
    },
  });

  setupSocket(io);

  // Start cleanup scheduler
  startCleanupScheduler();

  fastify.addHook('onClose', () => {
    stopCleanupScheduler();
    io.close();
  });

  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running on port ${PORT}`);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
