import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";

function dayBounds(date: string) {
  const start = new Date(`${date}T00:00:00.000`);
  const end = new Date(`${date}T23:59:59.999`);
  return { start, end };
}

export async function eventRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.verifyAuth);

  app.get("/", async (request, reply) => {
    const querySchema = z.object({
      q: z.string().trim().min(1).optional(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    });

    const { q, date } = querySchema.parse(request.query);
    const now = new Date();

    const startsAtFilter = date
      ? (() => {
          const { start, end } = dayBounds(date);
          return {
            gte: start < now ? now : start,
            lte: end,
          };
        })()
      : { gte: now };

    const events = await prisma.event.findMany({
      where: {
        starts_at: startsAtFilter,
        ...(q
          ? {
              name: {
                contains: q,
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: { starts_at: "asc" },
      select: {
        id: true,
        name: true,
        starts_at: true,
        location: true,
        distance_km: true,
        organizer: true,
        ticket_url: true,
        created_at: true,
        _count: {
          select: { attendances: true },
        },
        attendances: {
          where: { user_id: request.user.sub },
          select: { id: true },
          take: 1,
        },
      },
    });

    return reply.status(200).send(
      events.map(({ attendances, ...event }) => ({
        ...event,
        attending: attendances.length > 0,
      })),
    );
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        starts_at: true,
        location: true,
        distance_km: true,
        organizer: true,
        ticket_url: true,
        created_at: true,
        _count: {
          select: { attendances: true },
        },
        attendances: {
          select: {
            id: true,
            created_at: true,
            user: {
              select: {
                id: true,
                name: true,
                age: true,
                city: true,
                objective: true,
                pace: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!event) {
      return reply.status(404).send({ message: "Evento não encontrado" });
    }

    const attending = event.attendances.some(
      (attendance) => attendance.user.id === request.user.sub,
    );

    return reply.status(200).send({ ...event, attending });
  });

  app.post("/", { preHandler: [app.verifyAdmin] }, async (request, reply) => {
    const bodySchema = z.object({
      name: z.string().min(2),
      starts_at: z.coerce.date(),
      location: z.string().min(2),
      distance_km: z.number().positive().optional().nullable(),
      organizer: z.string().optional().nullable(),
      ticket_url: z.string().url().optional().nullable(),
    });

    const data = bodySchema.parse(request.body);
    const event = await prisma.event.create({
      data,
      select: {
        id: true,
        name: true,
        starts_at: true,
        location: true,
        distance_km: true,
        organizer: true,
        ticket_url: true,
        created_at: true,
        _count: {
          select: { attendances: true },
        },
      },
    });

    return reply.status(201).send({ ...event, attending: false });
  });

  app.post("/:id/attend", async (request, reply) => {
    const { id } = request.params as { id: string };

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event)
      return reply.status(404).send({ message: "Evento não encontrado" });

    const attendance = await prisma.eventAttendance.upsert({
      where: {
        user_id_event_id: {
          user_id: request.user.sub,
          event_id: id,
        },
      },
      create: {
        user_id: request.user.sub,
        event_id: id,
      },
      update: {},
      select: {
        id: true,
        event_id: true,
        created_at: true,
      },
    });

    return reply.status(200).send(attendance);
  });

  app.delete("/:id/attend", async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.eventAttendance.deleteMany({
      where: {
        user_id: request.user.sub,
        event_id: id,
      },
    });

    return reply.status(200).send({ message: "Presença removida" });
  });
}
