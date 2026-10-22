import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { eventRoutes } from "./events";
import { healthRoutes } from "./health";
import { matchRoutes } from "./matches";
import { userRoutes } from "./users";

export async function appRoutes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(healthRoutes);

  app.register(userRoutes, { prefix: "/users" });
  app.register(eventRoutes, { prefix: "/events" });
  app.register(matchRoutes, { prefix: "/matches" });
}
