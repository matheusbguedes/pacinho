import {
  isProfileComplete,
  ownProfileSelect,
  PROFILE_INCOMPLETE_MESSAGE,
} from "@/common/own-profile";
import { PrismaService } from "@/prisma/prisma.service";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ListPeopleParams, MatchActionBody } from "@pacinho/shared";
import { MatchAction } from "@prisma-client";

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

@Injectable()
export class MatchesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listPeople(userId: string, query: ListPeopleParams) {
    await this.assertProfileComplete(userId);
    const alreadyActed = await this.prisma.matchActionRecord.findMany({
      where: { from_id: userId },
      select: { to_id: true },
    });
    const excludedIds = [userId, ...alreadyActed.map((item) => item.to_id)];

    return this.prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        ...(query.event_id
          ? {
              event_attendances: {
                some: { event_id: query.event_id },
              },
            }
          : {}),
      },
      select: publicUserSelect,
      orderBy: { created_at: "desc" },
      take: 50,
    });
  }

  async act(userId: string, input: MatchActionBody) {
    await this.assertProfileComplete(userId);
    if (input.to_id === userId) {
      throw new BadRequestException({
        message: "Não é possível agir sobre si mesmo",
      });
    }

    const target = await this.prisma.user.findUnique({
      where: { id: input.to_id },
      select: publicUserSelect,
    });
    if (!target) {
      throw new NotFoundException({ message: "Usuário não encontrado" });
    }

    const record = await this.prisma.matchActionRecord.upsert({
      where: {
        from_id_to_id: { from_id: userId, to_id: input.to_id },
      },
      create: {
        from_id: userId,
        to_id: input.to_id,
        action: input.action,
        event_id: input.event_id ?? null,
      },
      update: {
        action: input.action,
        event_id: input.event_id ?? null,
      },
    });

    let isMatch = false;
    if (input.action === MatchAction.LIKE) {
      const reciprocal = await this.prisma.matchActionRecord.findUnique({
        where: {
          from_id_to_id: {
            from_id: input.to_id,
            to_id: userId,
          },
        },
      });
      isMatch = reciprocal?.action === MatchAction.LIKE;
    }

    return {
      id: record.id,
      action: record.action,
      is_match: isMatch,
      matched_user: isMatch ? target : null,
    };
  }

  async list(userId: string) {
    const likesSent = await this.prisma.matchActionRecord.findMany({
      where: {
        from_id: userId,
        action: MatchAction.LIKE,
      },
      select: { to_id: true },
    });
    const likedIds = likesSent.map((item) => item.to_id);
    if (likedIds.length === 0) {
      return [];
    }

    const reciprocal = await this.prisma.matchActionRecord.findMany({
      where: {
        from_id: { in: likedIds },
        to_id: userId,
        action: MatchAction.LIKE,
      },
      select: {
        created_at: true,
        from: {
          select: publicUserSelect,
        },
      },
      orderBy: { created_at: "desc" },
    });

    return reciprocal.map((item) => ({
      matched_at: item.created_at,
      user: item.from,
    }));
  }

  private async assertProfileComplete(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: ownProfileSelect,
    });
    if (!user) {
      throw new NotFoundException({ message: "Usuário não encontrado" });
    }
    if (!isProfileComplete(user, user._count.media)) {
      throw new ForbiddenException({ message: PROFILE_INCOMPLETE_MESSAGE });
    }
  }
}
