import { env } from "@/env";
import { HttpException, Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        environment: env.NODE_ENV,
        server: "up" as const,
        database: "up" as const,
      };
    } catch (error) {
      throw new HttpException(
        {
          environment: env.NODE_ENV,
          server: "down",
          database: "down",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }
}
