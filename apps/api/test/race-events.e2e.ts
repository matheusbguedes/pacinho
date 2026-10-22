import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, it } from "node:test";

import type { INestApplication } from "@nestjs/common";

import { PrismaService } from "../src/prisma/prisma.service";
import {
  atDayOffset,
  authHeader,
  createTestApp,
  formatDay,
  http,
  resetDatabase,
  signInAs,
  signUp,
} from "./harness";

describe("race-events", () => {
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

  async function asAdmin() {
    const admin = await signInAs(app, "ADMIN");
    return authHeader(admin.token);
  }

  it("lista só provas futuras, da mais próxima para a mais distante", async () => {
    const headers = await asAdmin();
    const runner = await signUp(app);
    const runnerHeaders = authHeader(runner.body.token);
    const prisma = app.get(PrismaService);

    await prisma.event.create({
      data: {
        name: "Prova que já foi",
        starts_at: atDayOffset(-1, 8),
        location: "Ibirapuera",
      },
    });
    await http(app).post("/events").set(headers).send({
      name: "Mais distante",
      starts_at: atDayOffset(5, 8).toISOString(),
      location: "Pinheiros",
      ticket_url: "https://example.com/ingressos",
    });
    await http(app).post("/events").set(headers).send({
      name: "Mais próxima",
      starts_at: atDayOffset(1, 8).toISOString(),
      location: "Paulista",
    });

    const response = await http(app).get("/events").set(runnerHeaders);

    assert.equal(response.status, 200);
    assert.deepEqual(
      response.body.map((event: { name: string }) => event.name),
      ["Mais próxima", "Mais distante"],
    );
    assert.equal(response.body[1].ticket_url, "https://example.com/ingressos");
    assert.equal(response.body[0]._count.attendances, 0);
    assert.equal(response.body[0].attending, false);
  });

  it("filtra por nome sem diferenciar maiúsculas e por dia, e ainda exclui o que já começou", async () => {
    const headers = await asAdmin();
    const runner = await signUp(app);
    const runnerHeaders = authHeader(runner.body.token);
    const tomorrow = atDayOffset(1, 10);
    const prisma = app.get(PrismaService);

    await http(app).post("/events").set(headers).send({
      name: "Run and Bass SP",
      starts_at: tomorrow.toISOString(),
      location: "Ibirapuera",
    });
    await http(app).post("/events").set(headers).send({
      name: "Longão",
      starts_at: atDayOffset(3, 7).toISOString(),
      location: "Moema",
    });
    await prisma.event.create({
      data: {
        name: "Run and Bass antiga",
        starts_at: atDayOffset(0, 0),
        location: "Centro",
      },
    });

    const response = await http(app)
      .get("/events")
      .query({ q: "run and bass", date: formatDay(tomorrow) })
      .set(runnerHeaders);

    assert.equal(response.status, 200);
    assert.equal(response.body.length, 1);
    assert.equal(response.body[0].name, "Run and Bass SP");
  });

  it("detalha a prova e quem confirmou, do mais recente ao mais antigo", async () => {
    const headers = await asAdmin();
    const first = await signUp(app, { name: "Ana Corrida" });
    const second = await signUp(app, { name: "Bruno Lima" });
    const created = await http(app).post("/events").set(headers).send({
      name: "Treino leve",
      starts_at: atDayOffset(2, 7).toISOString(),
      location: "Paulista",
    });
    const eventId = created.body.id as string;

    const older = await http(app)
      .post(`/events/${eventId}/attend`)
      .set(authHeader(first.body.token));
    const newer = await http(app)
      .post(`/events/${eventId}/attend`)
      .set(authHeader(second.body.token));
    await app.get(PrismaService).eventAttendance.update({
      where: { id: older.body.id },
      data: { created_at: new Date(Date.now() - 60_000) },
    });

    const response = await http(app)
      .get(`/events/${eventId}`)
      .set(authHeader(second.body.token));

    assert.equal(response.status, 200);
    assert.equal(response.body.attending, true);
    assert.equal(response.body.attendances[0].id, newer.body.id);
    assert.equal(response.body.attendances[1].id, older.body.id);
    const attendee = response.body.attendances[0].user;
    assert.equal(attendee.name, "Bruno Lima");
    assert.equal("email" in attendee, false);
    assert.equal("phone" in attendee, false);
    assert.equal("password" in attendee, false);
    assert.ok("objective" in attendee);
    assert.ok("pace" in attendee);
  });

  it("responde 404 para prova inexistente", async () => {
    const runner = await signUp(app);
    const response = await http(app)
      .get(`/events/${randomUUID()}`)
      .set(authHeader(runner.body.token));

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Evento não encontrado");
  });

  it("confirma presença uma vez só e remove mesmo sem vínculo", async () => {
    const headers = await asAdmin();
    const runner = await signUp(app);
    const runnerHeaders = authHeader(runner.body.token);
    const created = await http(app).post("/events").set(headers).send({
      name: "Sunset",
      starts_at: atDayOffset(2, 18).toISOString(),
      location: "Vila Madalena",
    });
    const eventId = created.body.id as string;

    const first = await http(app)
      .post(`/events/${eventId}/attend`)
      .set(runnerHeaders);
    const second = await http(app)
      .post(`/events/${eventId}/attend`)
      .set(runnerHeaders);

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(first.body.id, second.body.id);
    assert.equal(
      await app.get(PrismaService).eventAttendance.count({
        where: { event_id: eventId, user_id: runner.body.user.id },
      }),
      1,
    );

    const missing = await http(app)
      .post(`/events/${randomUUID()}/attend`)
      .set(runnerHeaders);
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Evento não encontrado");

    const removed = await http(app)
      .delete(`/events/${eventId}/attend`)
      .set(runnerHeaders);
    const removedAgain = await http(app)
      .delete(`/events/${eventId}/attend`)
      .set(runnerHeaders);
    assert.equal(removed.status, 200);
    assert.equal(removed.body.message, "Presença removida");
    assert.equal(removedAgain.body.message, "Presença removida");
  });

  it("só administrador cria prova, e o ingresso é um link externo", async () => {
    const adminHeaders = await asAdmin();
    const runner = await signUp(app);
    const before = await app.get(PrismaService).event.count();

    const forbidden = await http(app)
      .post("/events")
      .set(authHeader(runner.body.token))
      .send({
        name: "Prova clandestina",
        starts_at: atDayOffset(2, 8).toISOString(),
        location: "Centro",
      });
    assert.equal(forbidden.status, 403);
    assert.equal(forbidden.body.message, "Não autorizado");
    assert.equal(await app.get(PrismaService).event.count(), before);

    const invalidUrl = await http(app).post("/events").set(adminHeaders).send({
      name: "Sem link",
      starts_at: atDayOffset(2, 8).toISOString(),
      location: "Centro",
      ticket_url: "nao-e-url",
    });
    assert.equal(invalidUrl.status, 400);
    assert.equal(await app.get(PrismaService).event.count(), before);

    const created = await http(app).post("/events").set(adminHeaders).send({
      name: "Run and Bass",
      starts_at: atDayOffset(2, 7).toISOString(),
      location: "Ibirapuera",
      distance_km: 5,
      organizer: "Run and Bass",
      ticket_url: "https://example.com/ingressos",
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.attending, false);
    assert.equal(created.body._count.attendances, 0);
    assert.equal(created.body.ticket_url, "https://example.com/ingressos");
    assert.ok(created.body.ticket_url.startsWith("https://"));
    assert.equal("price" in created.body, false);
    assert.equal("checkout" in created.body, false);
  });
});
