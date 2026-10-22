import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, it } from "node:test";

import type { INestApplication } from "@nestjs/common";

import { PROFILE_INCOMPLETE_MESSAGE } from "../src/common/own-profile";
import {
  authHeader,
  createTestApp,
  http,
  resetDatabase,
  signUp,
} from "./harness";

describe("conversations", () => {
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

  it("responde 401 sem token", async () => {
    const id = randomUUID();
    const missingList = await http(app).get("/conversations");
    const missingOpen = await http(app)
      .post("/conversations")
      .send({ peer_id: id });
    const missingHistory = await http(app).get(`/conversations/${id}/messages`);
    const missingSend = await http(app)
      .post(`/conversations/${id}/messages`)
      .send({ body: "oi" });

    for (const response of [missingList, missingOpen, missingHistory, missingSend]) {
      assert.equal(response.status, 401);
      assert.equal(response.body.message, "Não autorizado");
    }
  });

  it("responde 403 com perfil incompleto", async () => {
    const session = await signUp(app);
    const headers = authHeader(session.body.token);
    const id = randomUUID();
    const list = await http(app).get("/conversations").set(headers);
    const open = await http(app)
      .post("/conversations")
      .set(headers)
      .send({ peer_id: id });
    const history = await http(app)
      .get(`/conversations/${id}/messages`)
      .set(headers);
    const send = await http(app)
      .post(`/conversations/${id}/messages`)
      .set(headers)
      .send({ body: "oi" });

    for (const response of [list, open, history, send]) {
      assert.equal(response.status, 403);
      assert.equal(response.body.message, PROFILE_INCOMPLETE_MESSAGE);
    }
  });

  it("lista o match sem mensagem e reabre a mesma conversa", async () => {
    const ana = await signUp(app, { name: "Ana Corrida", complete: true });
    const bruno = await signUp(app, { name: "Bruno Lima", complete: true });
    await likeEachOther(app, ana, bruno);

    const listed = await http(app)
      .get("/conversations")
      .set(authHeader(ana.body.token));

    assert.equal(listed.status, 200);
    assert.equal(listed.body.length, 1);
    assert.equal(listed.body[0].peer.name, "Bruno Lima");
    assert.equal(listed.body[0].last_message, null);
    assert.equal(typeof listed.body[0].id, "string");
    assert.equal(typeof listed.body[0].matched_at, "string");
    assert.equal("email" in listed.body[0].peer, false);
    assert.equal("phone" in listed.body[0].peer, false);
    assert.equal("password" in listed.body[0].peer, false);

    const created = await http(app)
      .post("/conversations")
      .set(authHeader(ana.body.token))
      .send({ peer_id: bruno.body.user.id });
    const again = await http(app)
      .post("/conversations")
      .set(authHeader(bruno.body.token))
      .send({ peer_id: ana.body.user.id });

    assert.equal(created.status, 200);
    assert.equal(again.status, 200);
    assert.equal(created.body.id, listed.body[0].id);
    assert.equal(again.body.id, listed.body[0].id);
    assert.equal(again.body.peer.name, "Ana Corrida");
  });

  it("cria a conversa uma vez e recusa quem não é match", async () => {
    const ana = await signUp(app, { name: "Ana Corrida", complete: true });
    const bruno = await signUp(app, { name: "Bruno Lima", complete: true });
    const clara = await signUp(app, { name: "Clara Nunes", complete: true });
    await likeEachOther(app, ana, bruno);
    await http(app)
      .post("/matches")
      .set(authHeader(ana.body.token))
      .send({ to_id: clara.body.user.id, action: "LIKE" });

    const created = await http(app)
      .post("/conversations")
      .set(authHeader(ana.body.token))
      .send({ peer_id: bruno.body.user.id });
    const same = await http(app)
      .post("/conversations")
      .set(authHeader(ana.body.token))
      .send({ peer_id: bruno.body.user.id });

    assert.equal(created.status, 201);
    assert.equal(created.body.last_message, null);
    assert.equal(same.status, 200);
    assert.equal(same.body.id, created.body.id);

    const notMatch = await http(app)
      .post("/conversations")
      .set(authHeader(ana.body.token))
      .send({ peer_id: clara.body.user.id });
    assert.equal(notMatch.status, 403);
    assert.equal(notMatch.body.message, "Só dá pra conversar com um match");

    const missing = await http(app)
      .post("/conversations")
      .set(authHeader(ana.body.token))
      .send({ peer_id: randomUUID() });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.message, "Usuário não encontrado");

    const inbox = await http(app)
      .get("/conversations")
      .set(authHeader(ana.body.token));
    assert.deepEqual(
      inbox.body.map((item: { peer: { name: string } }) => item.peer.name),
      ["Bruno Lima"],
    );
  });

  it("grava mensagens da mais antiga para a mais nova e esconde de quem está fora", async () => {
    const ana = await signUp(app, { name: "Ana Corrida", complete: true });
    const bruno = await signUp(app, { name: "Bruno Lima", complete: true });
    const clara = await signUp(app, { name: "Clara Nunes", complete: true });
    await likeEachOther(app, ana, bruno);
    const opened = await http(app)
      .post("/conversations")
      .set(authHeader(ana.body.token))
      .send({ peer_id: bruno.body.user.id });
    const conversationId = opened.body.id as string;

    const first = await http(app)
      .post(`/conversations/${conversationId}/messages`)
      .set(authHeader(ana.body.token))
      .send({ body: "Bora correr?" });
    const second = await http(app)
      .post(`/conversations/${conversationId}/messages`)
      .set(authHeader(bruno.body.token))
      .send({ body: "Bora, no Ibirapuera." });

    assert.equal(first.status, 201);
    assert.equal(first.body.body, "Bora correr?");
    assert.equal(first.body.sender_id, ana.body.user.id);
    assert.equal(typeof first.body.created_at, "string");

    const history = await http(app)
      .get(`/conversations/${conversationId}/messages`)
      .set(authHeader(bruno.body.token));
    assert.equal(history.status, 200);
    assert.deepEqual(
      history.body.map((message: { body: string }) => message.body),
      ["Bora correr?", "Bora, no Ibirapuera."],
    );
    assert.equal(history.body[1].id, second.body.id);

    const listed = await http(app)
      .get("/conversations")
      .set(authHeader(ana.body.token));
    assert.equal(listed.body[0].last_message.body, "Bora, no Ibirapuera.");
    assert.equal(listed.body[0].last_message.sender_id, bruno.body.user.id);

    const hiddenRead = await http(app)
      .get(`/conversations/${conversationId}/messages`)
      .set(authHeader(clara.body.token));
    const hiddenSend = await http(app)
      .post(`/conversations/${conversationId}/messages`)
      .set(authHeader(clara.body.token))
      .send({ body: "posso entrar?" });
    const missing = await http(app)
      .get(`/conversations/${randomUUID()}/messages`)
      .set(authHeader(ana.body.token));

    assert.equal(hiddenRead.status, 404);
    assert.equal(hiddenRead.body.message, "Conversa não encontrada");
    assert.equal(hiddenSend.status, 404);
    assert.equal(hiddenSend.body.message, "Conversa não encontrada");
    assert.equal(missing.status, 404);

    const empty = await http(app)
      .post(`/conversations/${conversationId}/messages`)
      .set(authHeader(ana.body.token))
      .send({ body: "" });
    const long = await http(app)
      .post(`/conversations/${conversationId}/messages`)
      .set(authHeader(ana.body.token))
      .send({ body: "a".repeat(2001) });
    assert.equal(empty.status, 400);
    assert.equal(long.status, 400);
  });
});

async function likeEachOther(
  app: INestApplication,
  left: { body: { token: string; user: { id: string } } },
  right: { body: { token: string; user: { id: string } } },
) {
  const first = await http(app)
    .post("/matches")
    .set(authHeader(left.body.token))
    .send({ to_id: right.body.user.id, action: "LIKE" });
  const second = await http(app)
    .post("/matches")
    .set(authHeader(right.body.token))
    .send({ to_id: left.body.user.id, action: "LIKE" });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(second.body.is_match, true);
}
