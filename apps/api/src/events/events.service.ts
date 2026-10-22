import { PrismaService } from "@/prisma/prisma.service";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateEventBody, ListEventsParams } from "@pacinho/shared";

function dayBounds(date: string) {
  const start = new Date(`${date}T00:00:00.000`);
  const end = new Date(`${date}T23:59:59.999`);
  return { start, end };
}

@Injectable()
export class EventsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListEventsParams) {
    const now = new Date();
    const startsAtFilter = query.date
      ? (() => {
          const { start, end } = dayBounds(query.date);
          return {
            gte: start < now ? now : start,
            lte: end,
          };
        })()
      : { gte: now };

    const events = await this.prisma.event.findMany({
      where: {
        starts_at: startsAtFilter,
        ...(query.q
          ? {
              name: {
                contains: query.q,
                mode: "insensitive" as const,
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
          where: { user_id: userId },
          select: { id: true },
          take: 1,
        },
      },
    });

    return events.map(({ attendances, ...event }) => ({
      ...event,
      attending: attendances.length > 0,
    }));
  }

  async getById(userId: string, id: string) {
    const event = await this.prisma.event.findUnique({
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
      throw new NotFoundException({ message: "Evento não encontrado" });
    }

    const attending = event.attendances.some(
      (attendance) => attendance.user.id === userId,
    );

    return { ...event, attending };
  }

  async create(input: CreateEventBody) {
    const event = await this.prisma.event.create({
      data: input,
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

    return { ...event, attending: false };
  }

  async attend(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException({ message: "Evento não encontrado" });
    }

    return this.prisma.eventAttendance.upsert({
      where: {
        user_id_event_id: {
          user_id: userId,
          event_id: eventId,
        },
      },
      create: {
        user_id: userId,
        event_id: eventId,
      },
      update: {},
      select: {
        id: true,
        event_id: true,
        created_at: true,
      },
    });
  }

  async unattend(userId: string, eventId: string) {
    await this.prisma.eventAttendance.deleteMany({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    return { message: "Presença removida" };
  }
}
