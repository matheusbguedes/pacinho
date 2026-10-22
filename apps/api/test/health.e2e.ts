import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { INestApplication } from "@nestjs/common";

import { createTestApp, http } from "./harness";

describe("GET /health", () => {
  let app: INestApplication;

  before(async () => {
    app = await createTestApp();
  });

  after(async () => {
    await app.close();
  });

  it("responde 200 com servidor e banco no ar", async () => {
    const response = await http(app).get("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.server, "up");
    assert.equal(response.body.database, "up");
    assert.equal(typeof response.body.environment, "string");
  });
});
