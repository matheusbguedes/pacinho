import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, it } from "node:test";

import type { INestApplication } from "@nestjs/common";
import bcrypt from "bcrypt";

import { PrismaService } from "../src/prisma/prisma.service";
import {
  atDayOffset,
  authHeader,
  createTestApp,
  http,
  resetDatabase,
  signInAs,
  signUp,
  uniqueEmail,
} from "./harness";

describe("runner-match", () => {
  let app: INestApplication;

  before(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  after(async () => {
    await app.close();
  });

  it("lista até 50 pessoas ainda sem ação, da mais nova para a mais antiga, com mídia ordenada", async () => {
    const viewer = await signUp(app, { complete: true });
    const prisma = app.get(PrismaService);
    const password = await bcrypt.hash("segredo", 4);
    const oldest = await prisma.user.create({
      data: {
        name: "Antiga",
        email: uniqueEmail("antiga"),
        password,
        created_at: new Date("2020-01-01T00:00:00.000Z"),
      },
    });

    for (let index = 0; index < 50; index += 1) {
      await prisma.user.create({
        data: {
          name: `Pessoa ${index}`,
          email: uniqueEmail("pessoa"),
          password,
          created_at: new Date(Date.UTC(2024, 0, 1, 0, 0, index)),
        },
      });
    }

    const withMedia = await prisma.user.findFirst({
      where: { name: "Pessoa 49" },
    });
    await prisma.userMedia.createMany({
      data: [
        { user_id: withMedia!.id, url: "https://example.com/b", sort_order: 1 },
        { user_id: withMedia!.id, url: "https://example.com/a", sort_order: 0 },
      ],
    });

    const response = await http(app)
      .get("/matches/people")
      .set(authHeader(viewer.body.token));

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 50);
    assert.equal(
      response.body.some((person: { id: string }) => person.id === viewer.body.user.id),
      false,
    );
    assert.equal(
      response.body.some((person: { id: string }) => person.id === oldest.id),
      false,
    );
    assert.equal(response.body[0].name, "Pessoa 49");
    assert.deepEqual(
      response.body[0].media.map((media: { url: string }) => media.url),
      ["https://example.com/a", "https://example.com/b"],
    );
    assert.equal("email" in response.body[0], false);
    assert.equal("phone" in response.body[0], false);
    assert.equal("password" in response.body[0], false);
  });

  it("restringe o deck à prova e tira quem já recebeu ação fora dela", async () => {
    const viewer = await signUp(app, { complete: true });
    const visible = await signUp(app, { name: "Visível" });
    const hidden = await signUp(app, { name: "Oculta" });
    const admin = await signInAs(app, "ADMIN");
    const created = await http(app)
      .post("/events")
      .set(authHeader(admin.token))
      .send({
        name: "Prova",
        starts_at: atDayOffset(2, 8).toISOString(),
        location: "Ibirapuera",
      });
    const eventId = created.body.id as string;
    await http(app)
      .post(`/events/${eventId}/attend`)
      .set(authHeader(visible.body.token));
    await http(app)
      .post(`/events/${eventId}/attend`)
      .set(authHeader(hidden.body.token));
    await http(app).post("/matches").set(authHeader(viewer.body.token)).send({
      to_id: hidden.body.user.id,
      action: "PASS",
    });

    const response = await http(app)
      .get("/matches/people")
      .query({ event_id: eventId })
      .set(authHeader(viewer.body.token));

    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.map((person: { name: string }) => person.name),
      ["Visível"],
    );
  });

  it("grava um like ou pass por par, recusa a si mesmo e quem não existe", async () => {
    const viewer = await signUp(app, { complete: true });
    const other = await signUp(app);
    const headers = authHeader(viewer.body.token);
    const eventId = randomUUID();

    const like = await http(app).post("/matches").set(headers).send({
      to_id: other.body.user.id,
      action: "LIKE",
    });
    const replaced = await http(app).post("/matches").set(headers).send({
      to_id: other.body.user.id,
      action: "PASS",
      event_id: eventId,
    });

    assert.equal(like.status, 200);
    assert.equal(replaced.status, 200);
    assert.equal(replaced.body.id, like.body.id);
    assert.equal(replaced.body.action, "PASS");
    assert.equal(replaced.body.is_match, false);
    assert.equal(replaced.body.matched_user, null);
    assert.equal(
      await app.get(PrismaService).matchActionRecord.count({
        where: { from_id: viewer.body.user.id, to_id: other.body.user.id },
      }),
      1,
    );
    const stored = await app.get(PrismaService).matchActionRecord.findUnique({
      where: {
        from_id_to_id: {
          from_id: viewer.body.user.id,
          to_id: other.body.user.id,
        },
      },
    });
    assert.equal(stored?.event_id, eventId);

    const self = await http(app).post("/matches").set(headers).send({
      to_id: viewer.body.user.id,
      action: "LIKE",
    });
    assert.equal(self.status, 400);
    assert.equal(self.body.message, "Não é possível agir sobre si mesmo");

    const missing = await http(app).post("/matches").set(headers).send({
      to_id: randomUUID(),
      action: "LIKE",
    });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Usuário não encontrado");
  });

  it("marca match só no like recíproco e lista do mais recente ao mais antigo", async () => {
    const viewer = await signUp(app, { name: "Ana", complete: true });
    const bruno = await signUp(app, { name: "Bruno", complete: true });
    const clara = await signUp(app, { name: "Clara", complete: true });
    const alone = await signUp(app, { name: "Diego", complete: true });

    const brunoLike = await http(app)
      .post("/matches")
      .set(authHeader(bruno.body.token))
      .send({ to_id: viewer.body.user.id, action: "LIKE" });
    const claraLike = await http(app)
      .post("/matches")
      .set(authHeader(clara.body.token))
      .send({ to_id: viewer.body.user.id, action: "LIKE" });
    await app.get(PrismaService).matchActionRecord.update({
      where: { id: brunoLike.body.id },
      data: { created_at: new Date("2024-01-01T00:00:00.000Z") },
    });
    await app.get(PrismaService).matchActionRecord.update({
      where: { id: claraLike.body.id },
      data: { created_at: new Date("2024-06-01T00:00:00.000Z") },
    });

    const oneWay = await http(app)
      .post("/matches")
      .set(authHeader(viewer.body.token))
      .send({ to_id: alone.body.user.id, action: "LIKE" });
    assert.equal(oneWay.body.is_match, false);
    assert.equal(oneWay.body.matched_user, null);

    const pass = await http(app)
      .post("/matches")
      .set(authHeader(viewer.body.token))
      .send({ to_id: bruno.body.user.id, action: "PASS" });
    assert.equal(pass.body.is_match, false);
    assert.equal(pass.body.matched_user, null);

    const match = await http(app)
      .post("/matches")
      .set(authHeader(viewer.body.token))
      .send({ to_id: clara.body.user.id, action: "LIKE" });
    assert.equal(match.status, 200);
    assert.equal(match.body.is_match, true);
    assert.equal(match.body.matched_user.name, "Clara");
    assert.equal("email" in match.body.matched_user, false);
    assert.equal("phone" in match.body.matched_user, false);
    assert.equal("password" in match.body.matched_user, false);

    await http(app).post("/matches").set(authHeader(viewer.body.token)).send({
      to_id: bruno.body.user.id,
      action: "LIKE",
    });

    const matches = await http(app)
      .get("/matches")
      .set(authHeader(viewer.body.token));
    assert.equal(matches.status, 200);
    assert.deepEqual(
      matches.body.map((item: { user: { name: string } }) => item.user.name),
      ["Clara", "Bruno"],
    );
    assert.equal(typeof matches.body[0].matched_at, "string");

    const empty = await http(app)
      .get("/matches")
      .set(authHeader(alone.body.token));
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, []);
  });
});
