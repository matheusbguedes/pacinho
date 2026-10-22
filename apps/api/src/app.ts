import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { UserRole } from "@prisma-client";
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "./env";
import { appRoutes } from "./routes";

export const app = fastify();

app.register(cors, {
  origin: true,
  methods: "*",
});

app.register(jwt, {
  secret: env.SERVER_SECRET,
});

app.decorate(
  "verifyAuth",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ message: "Não autorizado" });
    }
  },
);

app.decorate(
  "verifyAdmin",
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user;
    if (role !== UserRole.ADMIN) {
      return reply.status(403).send({ message: "Não autorizado" });
    }
  },
);

app.setErrorHandler(async (error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Erro de validação", issues: error.format() });
  }

  if ((error as { statusCode?: number }).statusCode === 401) {
    return reply.status(401).send({ message: "Não autorizado" });
  }

  console.error(error);
  return reply.status(500).send({ message: "Erro interno do servidor" });
});

declare module "fastify" {
  interface FastifyInstance {
    verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    verifyAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

app.register(appRoutes);
