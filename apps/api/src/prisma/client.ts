import { env } from "@/env";
import { PrismaClient } from "@prisma-client";
import { PrismaPg } from "@prisma/adapter-pg";

export function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query"] : [],
  });
}
