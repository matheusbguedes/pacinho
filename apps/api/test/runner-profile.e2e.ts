import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import type { INestApplication } from "@nestjs/common";

import { PrismaService } from "../src/prisma/prisma.service";
import {
  authHeader,
  createTestApp,
  http,
  resetDatabase,
  signUp,
} from "./harness";

describe("runner-profile", () => {
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

  it("devolve o próprio perfil, inclusive campos vazios, sem senha", async () => {
    const session = await signUp(app);
    const response = await http(app)
      .get("/users/me")
      .set(authHeader(session.body.token));

    assert.equal(response.status, 200);
    for (const field of [
      "id",
      "name",
      "email",
      "phone",
      "role",
      "age",
      "birth_date",
      "height_cm",
      "gender",
      "city",
      "region",
      "bio",
      "objective",
      "pace",
      "distance_km",
      "created_at",
      "profile_complete",
    ]) {
      assert.ok(field in response.body, field);
    }
    assert.equal(response.body.profile_complete, false);
    assert.equal(response.body.age, null);
    assert.equal(response.body.birth_date, null);
    assert.equal(response.body.height_cm, null);
    assert.equal(response.body.objective, null);
    assert.equal("password" in response.body, false);
  });

  it("responde 404 quando a conta do token não existe mais", async () => {
    const session = await signUp(app);
    await app.get(PrismaService).user.delete({
      where: { id: session.body.user.id },
    });

    const response = await http(app)
      .get("/users/me")
      .set(authHeader(session.body.token));

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Usuário não encontrado");
  });

  it("atualiza só o que foi enviado e preserva o resto, sem senha", async () => {
    const session = await signUp(app);
    const token = session.body.token as string;

    const updated = await http(app)
      .put("/users/me")
      .set(authHeader(token))
      .send({ city: "São Paulo", objective: "DATING" });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.city, "São Paulo");
    assert.equal(updated.body.objective, "DATING");
    assert.equal(updated.body.name, "Ana Corrida");
    assert.equal("password" in updated.body, false);

    const current = await http(app).get("/users/me").set(authHeader(token));
    assert.equal(current.body.phone, "11987654321");
  });

  it("aceita só DATING, FRIENDSHIP, TRAINING ou ausência de objetivo", async () => {
    const session = await signUp(app);
    const token = session.body.token as string;

    for (const objective of ["DATING", "FRIENDSHIP", "TRAINING"]) {
      const response = await http(app)
        .put("/users/me")
        .set(authHeader(token))
        .send({ objective });
      assert.equal(response.status, 200);
      assert.equal(response.body.objective, objective);
    }

    const cleared = await http(app)
      .put("/users/me")
      .set(authHeader(token))
      .send({ objective: null });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.objective, null);

    const invalid = await http(app)
      .put("/users/me")
      .set(authHeader(token))
      .send({ objective: "LOVE" });
    assert.equal(invalid.status, 400);
    assert.equal(
      (await http(app).get("/users/me").set(authHeader(token))).body.objective,
      null,
    );
  });

  it("aceita só os gêneros previstos ou ausência", async () => {
    const session = await signUp(app);
    const token = session.body.token as string;
    const genders = [
      "WOMAN",
      "MAN",
      "NON_BINARY",
      "OTHER",
      "PREFER_NOT_TO_SAY",
    ];

    for (const gender of genders) {
      const response = await http(app)
        .put("/users/me")
        .set(authHeader(token))
        .send({ gender });
      assert.equal(response.status, 200);
      assert.equal(response.body.gender, gender);
    }

    const cleared = await http(app)
      .put("/users/me")
      .set(authHeader(token))
      .send({ gender: null });
    assert.equal(cleared.status, 200);
    assert.equal(cleared.body.gender, null);

    const invalid = await http(app)
      .put("/users/me")
      .set(authHeader(token))
      .send({ gender: "ALIEN" });
    assert.equal(invalid.status, 400);
  });

  it("não grava idade, bio ou telefone fora do limite", async () => {
    const session = await signUp(app);
    const token = session.body.token as string;
    const headers = authHeader(token);

    const tooYoung = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ birth_date: yearsAgo(17) });
    const tooOld = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ birth_date: yearsAgo(101) });
    const invalidDate = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ birth_date: "2020-02-31" });
    const shortHeight = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ height_cm: 119 });
    const tallHeight = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ height_cm: 221 });
    const longBio = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ bio: "a".repeat(501) });
    const shortPhone = await http(app)
      .put("/users/me")
      .set(headers)
      .send({ phone: "1198765432" });

    assert.equal(tooYoung.status, 400);
    assert.equal(tooYoung.body.message, "A idade precisa estar entre 18 e 100");
    assert.equal(tooOld.status, 400);
    assert.equal(invalidDate.status, 400);
    assert.equal(invalidDate.body.message, "Data de nascimento inválida");
    assert.equal(shortHeight.status, 400);
    assert.equal(tallHeight.status, 400);
    assert.equal(longBio.status, 400);
    assert.equal(shortPhone.status, 400);

    const current = await http(app).get("/users/me").set(headers);
    assert.equal(current.body.age, null);
    assert.equal(current.body.birth_date, null);
    assert.equal(current.body.height_cm, null);
    assert.equal(current.body.bio, null);
    assert.equal(current.body.phone, "11987654321");
  });

  it("mostra a outra pessoa só o recorte público", async () => {
    const viewer = await signUp(app, { complete: true });
    const other = await signUp(app, { name: "Bruno Lima" });
    const birthDate = yearsAgo(29);
    await http(app)
      .put("/users/me")
      .set(authHeader(other.body.token))
      .send({
        birth_date: birthDate,
        height_cm: 175,
        city: "São Paulo",
        objective: "FRIENDSHIP",
      });

    const deck = await http(app)
      .get("/matches/people")
      .set(authHeader(viewer.body.token));

    assert.equal(deck.status, 200);
    assert.equal(deck.body.length, 1);
    const person = deck.body[0];
    assert.equal(person.name, "Bruno Lima");
    assert.equal(person.age, 29);
    assert.equal(person.city, "São Paulo");
    assert.equal("birth_date" in person, false);
    assert.equal("height_cm" in person, false);
    assert.equal("email" in person, false);
    assert.equal("phone" in person, false);
    assert.equal("password" in person, false);

    const own = await http(app)
      .get("/users/me")
      .set(authHeader(other.body.token));
    assert.equal(own.body.birth_date, birthDate);
    assert.equal(own.body.height_cm, 175);
    assert.equal(own.body.age, 29);
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
