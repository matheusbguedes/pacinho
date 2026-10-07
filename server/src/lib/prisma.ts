import { env } from "@/env";
import { PrismaClient } from "@prisma-client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["query"] : [],
});

export { prisma };
