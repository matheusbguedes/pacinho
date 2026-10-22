import "reflect-metadata";

import { type INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { Gender, Objective, UserRole } from "@pacinho/shared";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { configureApp } from "../src/configure-app";
import { env } from "../src/env";
import { PrismaService } from "../src/prisma/prisma.service";

let sequence = 0;

const tokens = new JwtService({
  secret: env.SERVER_SECRET,
  signOptions: { expiresIn: "365 days" },
});

export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export function http(app: INestApplication) {
  return request(app.getHttpServer());
}

export async function resetDatabase(app: INestApplication) {
  const prisma = app.get(PrismaService);
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.matchActionRecord.deleteMany();
  await prisma.eventAttendance.deleteMany();
  await prisma.userMedia.deleteMany();
  await prisma.authIdentity.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
}

export function uniqueEmail(prefix = "runner") {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}@pacinho.test`;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

type SessionOverrides = {
  name?: string;
  email?: string;
  phone?: string;
  role?: "ADMIN" | "USER";
  complete?: boolean;
};

export async function signUp(
  app: INestApplication,
  overrides: SessionOverrides = {},
) {
  const prisma = app.get(PrismaService);
  const email = overrides.email ?? uniqueEmail();
  const name = overrides.name ?? "Ana Corrida";
  const phone = overrides.phone ?? "11987654321";
  const role = overrides.role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: null,
      role,
      ...(overrides.complete
        ? {
            age: 28,
            gender: Gender.WOMAN,
            city: "São Paulo",
            region: "Pinheiros",
            bio: "Treino de manhã.",
            objective: Objective.DATING,
            pace: "5:20/km",
            distance_km: 8,
          }
        : {}),
    },
  });

  if (overrides.complete) {
    await prisma.userMedia.create({
      data: {
        user_id: user.id,
        url: "https://example.com/photo.jpg",
        sort_order: 0,
      },
    });
  }

  const token = tokens.sign({
    sub: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });

  return {
    body: {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    },
  };
}

export async function signInAs(
  app: INestApplication,
  role: "ADMIN" | "USER",
) {
  const session = await signUp(app, {
    name: role === "ADMIN" ? "Admin" : "Corredor",
    role,
  });
  return {
    token: session.body.token,
    userId: session.body.user.id,
    email: session.body.user.email,
  };
}

export function atDayOffset(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function formatDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
