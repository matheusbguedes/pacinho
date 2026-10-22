import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { after, before, beforeEach, describe, it } from "node:test";

import type { INestApplication } from "@nestjs/common";
import { Gender, Objective } from "@pacinho/shared";
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey } from "jose";

import { DEVELOPMENT_RUNNER_EMAIL } from "../src/auth/development-runner";
import { PROFILE_INCOMPLETE_MESSAGE } from "../src/common/own-profile";
import { PrismaService } from "../src/prisma/prisma.service";
import {
  authHeader,
  createTestApp,
  http,
  resetDatabase,
  signUp,
  uniqueEmail,
} from "./harness";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

describe("social-onboarding", () => {
  let app: INestApplication;
  let privateKey: CryptoKey;
  let jwks: Server;

  before(async () => {
    const keys = await generateKeyPair("RS256");
    privateKey = keys.privateKey;
    const jwk = {
      ...(await exportJWK(keys.publicKey)),
      kid: "test-key",
      alg: "RS256",
      use: "sig",
    };
    jwks = createServer((_request, response) => {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ keys: [jwk] }));
    });
    await new Promise<void>((resolve) => {
      jwks.listen(0, "127.0.0.1", resolve);
    });
    const address = jwks.address();
    if (!address || typeof address === "string") {
      throw new Error("JWKS de teste sem porta");
    }
    const url = `http://127.0.0.1:${address.port}/keys`;
    process.env.APPLE_CLIENT_ID = "app.pacinho.test";
    process.env.GOOGLE_CLIENT_ID = "google-test-client";
    process.env.APPLE_JWKS_URL = url;
    process.env.GOOGLE_JWKS_URL = url;
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  after(async () => {
    process.env.NODE_ENV = "production";
    await app.close();
    await new Promise<void>((resolve, reject) => {
      jwks.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("cria a conta na primeira identidade e reabre pelo mesmo sub", async () => {
    const email = uniqueEmail("apple");
    const firstToken = await identityToken({
      provider: "APPLE",
      subject: "apple-sub-1",
      email,
      name: "Ana Corrida",
      privateKey,
    });

    const created = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: firstToken,
    });

    assert.equal(created.status, 200);
    assert.equal(typeof created.body.token, "string");
    assert.equal(created.body.user.email, email);
    assert.equal(created.body.user.name, "Ana Corrida");
    assert.equal(created.body.user.role, "USER");
    assert.equal(created.body.user.profile_complete, false);
    assert.equal("password" in created.body.user, false);

    const secondToken = await identityToken({
      provider: "APPLE",
      subject: "apple-sub-1",
      email: uniqueEmail("apple-novo"),
      privateKey,
    });
    const reopened = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: secondToken,
    });

    assert.equal(reopened.status, 200);
    assert.equal(reopened.body.user.id, created.body.user.id);
    assert.equal(reopened.body.user.email, email);
    assert.equal("password" in reopened.body.user, false);
    assert.equal(await app.get(PrismaService).user.count(), 1);
  });

  it("grava o nome enviado quando a conta ainda não tem nome", async () => {
    const email = uniqueEmail("apple");
    const token = await identityToken({
      provider: "APPLE",
      subject: "apple-sem-nome",
      email,
      privateKey,
    });

    const created = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: token,
      name: "Ana Corrida",
    });
    assert.equal(created.status, 200);
    assert.equal(created.body.user.name, "Ana Corrida");

    const kept = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: token,
      name: "Outro Nome",
    });
    assert.equal(kept.status, 200);
    assert.equal(kept.body.user.id, created.body.user.id);
    assert.equal(kept.body.user.name, "Ana Corrida");

    const unnamed = await identityToken({
      provider: "APPLE",
      subject: "apple-nome-curto",
      email: uniqueEmail("apple"),
      privateKey,
    });
    const invalid = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: unnamed,
      name: "A",
    });
    assert.equal(invalid.status, 400);
    assert.equal(await app.get(PrismaService).user.count(), 1);
  });

  it("preenche o nome vazio ao reabrir a mesma identidade", async () => {
    const email = uniqueEmail("apple");
    const token = await identityToken({
      provider: "APPLE",
      subject: "apple-depois",
      email,
      privateKey,
    });

    const created = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: token,
    });
    assert.equal(created.status, 200);
    assert.equal(created.body.user.name, "");

    const named = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: token,
      name: "Ana Corrida",
    });
    assert.equal(named.status, 200);
    assert.equal(named.body.user.id, created.body.user.id);
    assert.equal(named.body.user.name, "Ana Corrida");
  });

  it("liga o provedor na conta do e-mail verificado", async () => {
    const email = uniqueEmail("google");
    const existing = await signUp(app, { email, name: "Bruno Lima" });
    const token = await identityToken({
      provider: "GOOGLE",
      subject: "google-sub-novo",
      email,
      privateKey,
    });

    const response = await http(app).post("/auth/social").send({
      provider: "GOOGLE",
      identity_token: token,
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.user.id, existing.body.user.id);
    assert.equal("password" in response.body.user, false);
    assert.equal(await app.get(PrismaService).user.count(), 1);
    assert.equal(await app.get(PrismaService).authIdentity.count(), 1);
  });

  it("recusa identidade inválida sem criar sessão", async () => {
    const response = await http(app).post("/auth/social").send({
      provider: "APPLE",
      identity_token: "token-invalido",
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.message, "Identidade inválida");
    assert.equal("token" in response.body, false);
    assert.equal(await app.get(PrismaService).user.count(), 0);
  });

  it("não abre sessão em /signup nem /signin", async () => {
    const signup = await http(app).post("/signup").send({
      name: "Ana Corrida",
      email: uniqueEmail(),
      password: "segredo",
      phone: "11987654321",
    });
    const signin = await http(app).post("/signin").send({
      email: uniqueEmail(),
      password: "segredo",
    });

    assert.equal(signup.status, 404);
    assert.equal(signin.status, 404);
    assert.equal("token" in signup.body, false);
    assert.equal("token" in signin.body, false);
  });

  it("abre a sessão de desenvolvimento só com NODE_ENV=development", async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.create({
      data: {
        name: "Corredor Demo",
        email: DEVELOPMENT_RUNNER_EMAIL,
        password: null,
        age: 26,
        gender: Gender.MAN,
        city: "São Paulo",
        region: "Ibirapuera",
        bio: "Treino de terça e quinta. Topo um café depois.",
        objective: Objective.DATING,
        pace: "5:00/km",
        distance_km: 5,
        media: {
          create: {
            url: "https://example.com/runner.jpg",
            sort_order: 0,
          },
        },
      },
    });

    process.env.NODE_ENV = "development";
    const opened = await http(app).post("/auth/dev");
    assert.equal(opened.status, 200);
    assert.equal(typeof opened.body.token, "string");
    assert.equal(opened.body.user.email, DEVELOPMENT_RUNNER_EMAIL);
    assert.equal(opened.body.user.profile_complete, true);
    assert.equal("password" in opened.body.user, false);

    process.env.NODE_ENV = "production";
    const blocked = await http(app).post("/auth/dev");
    assert.equal(blocked.status, 404);
    assert.equal("token" in blocked.body, false);
  });

  it("responde 401 sem token e 403 com perfil incompleto no deck e no like", async () => {
    const missing = await http(app).get("/matches/people");
    const invalid = await http(app)
      .get("/matches/people")
      .set(authHeader("token-invalido"));
    assert.equal(missing.status, 401);
    assert.equal(missing.body.message, "Não autorizado");
    assert.equal(invalid.status, 401);
    assert.equal(invalid.body.message, "Não autorizado");

    const session = await signUp(app);
    const headers = authHeader(session.body.token);
    const deck = await http(app).get("/matches/people").set(headers);
    const action = await http(app).post("/matches").set(headers).send({
      to_id: randomUUID(),
      action: "LIKE",
    });

    assert.equal(deck.status, 403);
    assert.equal(deck.body.message, PROFILE_INCOMPLETE_MESSAGE);
    assert.equal(action.status, 403);
    assert.equal(action.body.message, PROFILE_INCOMPLETE_MESSAGE);
  });

  it("grava a foto, serve a url e completa o perfil", async () => {
    const session = await signUp(app);
    const headers = authHeader(session.body.token);
    const saved = await http(app).put("/users/me").set(headers).send({
      birth_date: yearsAgo(28),
      gender: "WOMAN",
      city: "São Paulo",
      region: "Pinheiros",
      objective: "DATING",
      pace: "5:20/km",
      distance_km: 8,
      bio: "Treino de manhã.",
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.profile_complete, false);
    assert.equal("password" in saved.body, false);

    const uploaded = await http(app)
      .post("/users/me/media")
      .set(headers)
      .attach("file", PNG, { filename: "foto.png", contentType: "image/png" });

    assert.equal(uploaded.status, 201);
    assert.equal(typeof uploaded.body.id, "string");
    assert.equal(uploaded.body.sort_order, 0);
    assert.match(uploaded.body.url, /^https?:\/\/.+\/media\/.+\.png$/);

    const file = await http(app).get(new URL(uploaded.body.url).pathname);
    assert.equal(file.status, 200);
    assert.equal(file.headers["content-type"], "image/png");

    const me = await http(app).get("/users/me").set(headers);
    assert.equal(me.status, 200);
    assert.equal(me.body.profile_complete, true);
  });
});

function yearsAgo(years: number) {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split("-");
  return `${Number(year) - years}-${month}-${day}`;
}

function identityToken(input: {
  provider: "APPLE" | "GOOGLE";
  subject: string;
  email: string;
  name?: string;
  privateKey: CryptoKey;
}) {
  const claims: Record<string, unknown> = {
    email: input.email,
    email_verified: true,
  };
  if (input.name) {
    claims.name = input.name;
  }

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(
      input.provider === "APPLE"
        ? "https://appleid.apple.com"
        : "https://accounts.google.com",
    )
    .setAudience(
      input.provider === "APPLE"
        ? process.env.APPLE_CLIENT_ID!
        : process.env.GOOGLE_CLIENT_ID!,
    )
    .setSubject(input.subject)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(input.privateKey);
}
