import { prisma } from "@/lib/prisma";
import { Gender, Objective } from "@prisma-client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/me", async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
    });

    if (!user)
      return reply.status(404).send({ message: "Usuário não encontrado" });

    const { password: _, ...safeUser } = user;
    return reply.status(200).send(safeUser);
  });

  app.put("/me", async (request, reply) => {
    const bodySchema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().min(11).max(11).optional(),
      age: z.number().int().min(18).max(100).optional().nullable(),
      gender: z.enum(Gender).optional().nullable(),
      city: z.string().optional().nullable(),
      region: z.string().optional().nullable(),
      bio: z.string().max(500).optional().nullable(),
      objective: z.enum(Objective).optional().nullable(),
      pace: z.string().optional().nullable(),
      distance_km: z.number().positive().optional().nullable(),
    });

    const data = bodySchema.parse(request.body);

    const user = await prisma.user.update({
      where: { id: request.user.sub },
      data,
    });

    const { password: _, ...safeUser } = user;
    return reply.status(200).send(safeUser);
  });
}
