import "@fastify/jwt";

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      sub: string;
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      role: string;
    };
  }
}
