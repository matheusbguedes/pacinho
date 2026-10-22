import { DEVELOPMENT_RUNNER_EMAIL } from "@/auth/development-runner";
import { IdentityVerifier } from "@/auth/identity-verifier";
import {
  isProfileComplete,
  type OwnProfileRecord,
  ownProfileSelect,
  toOwnProfile,
} from "@/common/own-profile";
import { PrismaService } from "@/prisma/prisma.service";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { SocialSignInBody } from "@pacinho/shared";
import { UserRole } from "@prisma-client";

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(IdentityVerifier) private readonly identities: IdentityVerifier,
  ) {}

  async signInWithIdentity(input: SocialSignInBody) {
    const identity = await this.identities.verify(
      input.provider,
      input.identity_token,
    );

    const known = await this.prisma.authIdentity.findUnique({
      where: {
        provider_subject: {
          provider: identity.provider,
          subject: identity.subject,
        },
      },
    });
    if (known) {
      await this.keepNameIfEmpty(known.user_id, input.name);
      return this.sessionFor(known.user_id);
    }

    const email = identity.emailVerified ? identity.email : null;
    if (email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      });
      if (existing) {
        await this.prisma.authIdentity.create({
          data: {
            provider: identity.provider,
            subject: identity.subject,
            user_id: existing.id,
          },
        });
        await this.keepNameIfEmpty(existing.id, input.name);
        return this.sessionFor(existing.id);
      }
    }

    if (!email) {
      throw new BadRequestException({
        message: "O provedor não enviou um e-mail verificado.",
      });
    }

    const user = await this.prisma.user.create({
      data: {
        name: identity.name ?? givenName(input.name) ?? "",
        email,
        password: null,
        role: UserRole.USER,
        identities: {
          create: {
            provider: identity.provider,
            subject: identity.subject,
          },
        },
      },
      select: ownProfileSelect,
    });

    return this.session(user);
  }

  async signInDevelopment() {
    if (process.env.NODE_ENV !== "development") {
      throw new NotFoundException();
    }

    const user = await this.prisma.user.findUnique({
      where: { email: DEVELOPMENT_RUNNER_EMAIL },
      select: ownProfileSelect,
    });
    if (!user || !isProfileComplete(user, user._count.media)) {
      throw new NotFoundException();
    }

    return this.session(user);
  }

  private async keepNameIfEmpty(userId: string, name: string | undefined) {
    const nextName = givenName(name);
    if (!nextName) {
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    if (!user || user.name.trim().length >= 2) {
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { name: nextName },
    });
  }

  private async sessionFor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: ownProfileSelect,
    });
    if (!user) {
      throw new NotFoundException({ message: "Usuário não encontrado" });
    }
    return this.session(user);
  }

  private session(user: OwnProfileRecord) {
    const profile = toOwnProfile(user);
    return {
      token: this.jwt.sign({
        sub: profile.id,
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
      }),
      user: profile,
    };
  }
}

function givenName(name: string | undefined) {
  const trimmed = name?.trim();
  return trimmed && trimmed.length >= 2 ? trimmed : undefined;
}
