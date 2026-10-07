import { env } from '@/env'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`

      return reply.status(200).send({
        environment: env.NODE_ENV,
        server: 'up',
        database: 'up',
      })
    } catch (error) {
      return reply.status(500).send({
        environment: env.NODE_ENV,
        server: 'down',
        database: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
}
