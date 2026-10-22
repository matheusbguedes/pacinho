import {
  isProfileComplete,
  ownProfileSelect,
  PROFILE_INCOMPLETE_MESSAGE,
} from "@/common/own-profile";
import { PrismaService } from "@/prisma/prisma.service";
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MatchAction, Prisma } from "@prisma-client";

const MATCH_REQUIRED_MESSAGE = "Só dá pra conversar com um match";
const CONVERSATION_NOT_FOUND_MESSAGE = "Conversa não encontrada";

const peerSelect = {
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

const messageSelect = {
  id: true,
  sender_id: true,
  body: true,
  created_at: true,
} as const;

type StoredMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: Date;
};

@Injectable()
export class ConversationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(userId: string) {
    await this.assertProfileComplete(userId);
    const matches = await this.mutualMatches(userId);
    const conversations = await Promise.all(
      matches.map(async (match) => ({
        match,
        conversation: await this.findOrCreate(userId, match.peer.id),
      })),
    );
    const lastMessages = await this.lastMessages(
      conversations.map((item) => item.conversation.id),
    );

    return conversations
      .map((item) =>
        this.summary(
          item.conversation.id,
          item.match.matchedAt,
          item.match.peer,
          lastMessages.get(item.conversation.id) ?? null,
        ),
      )
      .sort((left, right) => {
        const leftTime = left.last_message?.created_at ?? left.matched_at;
        const rightTime = right.last_message?.created_at ?? right.matched_at;
        return rightTime.localeCompare(leftTime);
      });
  }

  async open(userId: string, peerId: string) {
    await this.assertProfileComplete(userId);
    const peer = await this.prisma.user.findUnique({
      where: { id: peerId },
      select: peerSelect,
    });
    if (!peer) {
      throw new NotFoundException({ message: "Usuário não encontrado" });
    }

    const matchedAt = await this.matchedAt(userId, peerId);
    if (!matchedAt) {
      throw new ForbiddenException({ message: MATCH_REQUIRED_MESSAGE });
    }

    const pair = pairOf(userId, peerId);
    const existing = await this.prisma.conversation.findUnique({
      where: { user_low_id_user_high_id: pair },
    });
    if (existing) {
      const last = await this.lastMessages([existing.id]);
      return {
        created: false,
        conversation: this.summary(
          existing.id,
          matchedAt,
          peer,
          last.get(existing.id) ?? null,
        ),
      };
    }

    try {
      const created = await this.prisma.conversation.create({ data: pair });
      return {
        created: true,
        conversation: this.summary(created.id, matchedAt, peer, null),
      };
    } catch (error) {
      if (!isUniqueConflict(error)) {
        throw error;
      }
      const conversation = await this.prisma.conversation.findUniqueOrThrow({
        where: { user_low_id_user_high_id: pair },
      });
      const last = await this.lastMessages([conversation.id]);
      return {
        created: false,
        conversation: this.summary(
          conversation.id,
          matchedAt,
          peer,
          last.get(conversation.id) ?? null,
        ),
      };
    }
  }

  async messages(userId: string, conversationId: string) {
    await this.assertProfileComplete(userId);
    await this.requireParticipant(userId, conversationId);
    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: [{ created_at: "asc" }, { id: "asc" }],
      select: messageSelect,
    });
  }

  async send(userId: string, conversationId: string, body: string) {
    await this.assertProfileComplete(userId);
    await this.requireParticipant(userId, conversationId);
    return this.prisma.message.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId,
        body,
      },
      select: messageSelect,
    });
  }

  private async mutualMatches(userId: string) {
    const sent = await this.prisma.matchActionRecord.findMany({
      where: { from_id: userId, action: MatchAction.LIKE },
      select: { to_id: true, created_at: true },
    });
    const sentAt = new Map(sent.map((item) => [item.to_id, item.created_at]));
    const peerIds = [...sentAt.keys()];
    if (peerIds.length === 0) {
      return [];
    }

    const received = await this.prisma.matchActionRecord.findMany({
      where: {
        from_id: { in: peerIds },
        to_id: userId,
        action: MatchAction.LIKE,
      },
      select: {
        from_id: true,
        created_at: true,
        from: { select: peerSelect },
      },
    });

    return received.map((item) => ({
      peer: item.from,
      matchedAt: later(sentAt.get(item.from_id)!, item.created_at),
    }));
  }

  private async matchedAt(userId: string, peerId: string) {
    const [mine, theirs] = await Promise.all([
      this.prisma.matchActionRecord.findUnique({
        where: { from_id_to_id: { from_id: userId, to_id: peerId } },
      }),
      this.prisma.matchActionRecord.findUnique({
        where: { from_id_to_id: { from_id: peerId, to_id: userId } },
      }),
    ]);
    if (mine?.action !== MatchAction.LIKE || theirs?.action !== MatchAction.LIKE) {
      return null;
    }
    return later(mine.created_at, theirs.created_at);
  }

  private async findOrCreate(userId: string, peerId: string) {
    const pair = pairOf(userId, peerId);
    try {
      return await this.prisma.conversation.upsert({
        where: { user_low_id_user_high_id: pair },
        create: pair,
        update: {},
      });
    } catch (error) {
      if (!isUniqueConflict(error)) {
        throw error;
      }
      return this.prisma.conversation.findUniqueOrThrow({
        where: { user_low_id_user_high_id: pair },
      });
    }
  }

  private async lastMessages(conversationIds: string[]) {
    const last = new Map<string, StoredMessage>();
    if (conversationIds.length === 0) {
      return last;
    }

    const messages = await this.prisma.message.findMany({
      where: { conversation_id: { in: conversationIds } },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      select: { ...messageSelect, conversation_id: true },
    });
    for (const message of messages) {
      if (!last.has(message.conversation_id)) {
        last.set(message.conversation_id, message);
      }
    }
    return last;
  }

  private summary(
    id: string,
    matchedAt: Date,
    peer: {
      id: string;
      name: string;
      age: number | null;
      gender: string | null;
      city: string | null;
      region: string | null;
      bio: string | null;
      objective: string | null;
      pace: string | null;
      distance_km: number | null;
      media: { id: string; url: string; sort_order: number }[];
    },
    lastMessage: StoredMessage | null,
  ) {
    return {
      id,
      matched_at: matchedAt.toISOString(),
      peer,
      last_message: lastMessage
        ? {
            id: lastMessage.id,
            sender_id: lastMessage.sender_id,
            body: lastMessage.body,
            created_at: lastMessage.created_at.toISOString(),
          }
        : null,
    };
  }

  private async requireParticipant(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (
      !conversation ||
      (conversation.user_low_id !== userId &&
        conversation.user_high_id !== userId)
    ) {
      throw new NotFoundException({ message: CONVERSATION_NOT_FOUND_MESSAGE });
    }
    return conversation;
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

function pairOf(leftId: string, rightId: string) {
  return leftId < rightId
    ? { user_low_id: leftId, user_high_id: rightId }
    : { user_low_id: rightId, user_high_id: leftId };
}

function later(left: Date, right: Date) {
  return left > right ? left : right;
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
