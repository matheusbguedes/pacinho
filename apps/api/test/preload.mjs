import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import pg from "pg";

process.env.NODE_ENV = "production";
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/pacinho_test?schema=public";

const admin = new pg.Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

await admin.connect();
const existing = await admin.query(
  "SELECT 1 FROM pg_database WHERE datname = 'pacinho_test'",
);
if (existing.rowCount === 0) {
  await admin.query("CREATE DATABASE pacinho_test");
}
await admin.end();

execSync("pnpm exec prisma migrate deploy", {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: process.env,
  stdio: "inherit",
});
