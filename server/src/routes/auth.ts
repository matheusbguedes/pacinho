import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";

function signToken(
  app: FastifyInstance,
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  },
) {
  return app.jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    {
      sub: user.id,
      expiresIn: "365 days",
    },
  );
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/signup", async (request, reply) => {
    const bodySchema = z.object({
      name: z.string().min(2),
      email: z.email(),
      password: z.string().min(6),
      phone: z.string().min(11).max(11),
    });

    const { name, email, password, phone } = bodySchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ message: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        age: true,
        gender: true,
        city: true,
        region: true,
        bio: true,
        objective: true,
        pace: true,
        distance_km: true,
        created_at: true,
      },
    });

    const token = signToken(app, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    return reply.status(201).send({ token, user });
  });

  app.post("/signin", async (request, reply) => {
    const bodySchema = z.object({
      email: z.email(),
      password: z.string(),
    });

    const { email, password } = bodySchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password)
      return reply.status(400).send({ message: "Email ou senha incorretos." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return reply.status(400).send({ message: "Email ou senha incorretos." });

    const token = signToken(app, user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        gender: user.gender,
        city: user.city,
        region: user.region,
        bio: user.bio,
        objective: user.objective,
        pace: user.pace,
        distance_km: user.distance_km,
        created_at: user.created_at,
      },
    };
  });
}
