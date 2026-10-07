import { prisma } from "@/lib/prisma";
import { MatchAction } from "@prisma-client";
import { FastifyInstance } from "fastify";
import { z } from "zod";

const publicUserSelect = {
  id: true,
  name: true,
  age: true,
  gender: true,
  city: true,
  region: true,
  bio: true,
  objective: true,
  pace: true,
  distance_km: true,
  media: {
    orderBy: { sort_order: "asc" as const },
    select: {
      id: true,
      url: true,
      sort_order: true,
    },
  },
};

export async function matchRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/people", async (request, reply) => {
    const querySchema = z.object({
      event_id: z.string().uuid().optional(),
    });

    const { event_id } = querySchema.parse(request.query);
    const me = request.user.sub;

    const alreadyActed = await prisma.matchActionRecord.findMany({
      where: { from_id: me },
      select: { to_id: true },
    });
    const excludedIds = [me, ...alreadyActed.map((item) => item.to_id)];

    const people = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        ...(event_id
          ? {
              event_attendances: {
                some: { event_id },
              },
            }
          : {}),
      },
      select: publicUserSelect,
      orderBy: { created_at: "desc" },
      take: 50,
    });

    return reply.status(200).send(people);
  });

  app.post("/", async (request, reply) => {
    const bodySchema = z.object({
      to_id: z.string().uuid(),
      action: z.enum(MatchAction),
      event_id: z.string().uuid().optional().nullable(),
    });

    const { to_id, action, event_id } = bodySchema.parse(request.body);
    const from_id = request.user.sub;

    if (to_id === from_id) {
      return reply
        .status(400)
        .send({ message: "Não é possível agir sobre si mesmo" });
    }

    const target = await prisma.user.findUnique({
      where: { id: to_id },
      select: publicUserSelect,
    });
    if (!target) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    const record = await prisma.matchActionRecord.upsert({
      where: {
        from_id_to_id: { from_id, to_id },
      },
      create: {
        from_id,
        to_id,
        action,
        event_id: event_id ?? null,
      },
      update: {
        action,
        event_id: event_id ?? null,
      },
    });

    let isMatch = false;

    if (action === MatchAction.LIKE) {
      const reciprocal = await prisma.matchActionRecord.findUnique({
        where: {
          from_id_to_id: {
            from_id: to_id,
            to_id: from_id,
          },
        },
      });

      isMatch = reciprocal?.action === MatchAction.LIKE;
    }

    return reply.status(200).send({
      id: record.id,
      action: record.action,
      is_match: isMatch,
      matched_user: isMatch ? target : null,
    });
  });

  app.get("/", async (request, reply) => {
    const me = request.user.sub;

    const likesISent = await prisma.matchActionRecord.findMany({
      where: {
        from_id: me,
        action: MatchAction.LIKE,
      },
      select: { to_id: true },
    });

    const likedIds = likesISent.map((item) => item.to_id);
    if (likedIds.length === 0) {
      return reply.status(200).send([]);
    }

    const reciprocal = await prisma.matchActionRecord.findMany({
      where: {
        from_id: { in: likedIds },
        to_id: me,
        action: MatchAction.LIKE,
      },
      select: {
        from_id: true,
        created_at: true,
        from: {
          select: publicUserSelect,
        },
      },
      orderBy: { created_at: "desc" },
    });

    return reply.status(200).send(
      reciprocal.map((item) => ({
        matched_at: item.created_at,
        user: item.from,
      })),
    );
  });
}
