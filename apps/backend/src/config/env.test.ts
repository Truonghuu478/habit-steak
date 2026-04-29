import assert from "node:assert/strict";
import test from "node:test";

const trackedKeys = ["APP_TIMEZONE", "CLIENT_ORIGIN", "DATABASE_URL", "JWT_SECRET", "NODE_ENV", "PORT"] as const;
const originalEnv = new Map(trackedKeys.map((key) => [key, process.env[key]]));

const resetEnv = () => {
  for (const key of trackedKeys) {
    const originalValue = originalEnv.get(key);

    if (originalValue === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = originalValue;
  }
};

const importFreshEnvModule = async () => {
  const moduleUrl = new URL(`./env.ts?case=${Date.now()}-${Math.random()}`, import.meta.url);
  return import(moduleUrl.href);
};

test.afterEach(() => {
  resetEnv();
});

test("reads environment variables from process.env (development)", async () => {
  process.env.NODE_ENV = "development";
  process.env.APP_TIMEZONE = "Asia/Ho_Chi_Minh";
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public";
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  process.env.PORT = "4000";

  const env = await importFreshEnvModule();

  assert.equal(env.APP_TIMEZONE, "Asia/Ho_Chi_Minh");
  assert.equal(env.CLIENT_ORIGIN, "http://localhost:5173");
  assert.equal(env.DATABASE_URL, "postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public");
  assert.equal(env.JWT_SECRET, "replace-with-a-long-random-secret");
  assert.equal(env.PORT, 4000);
});

test("reads environment variables from process.env (default)", async () => {
  delete process.env.APP_TIMEZONE;
  delete process.env.NODE_ENV;
  process.env.CLIENT_ORIGIN = "https://habit-steak.vercel.app";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public";
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  process.env.PORT = "4000";

  const env = await importFreshEnvModule();

  assert.equal(env.APP_TIMEZONE, "Asia/Ho_Chi_Minh");
  assert.equal(env.CLIENT_ORIGIN, "https://habit-steak.vercel.app");
  assert.equal(env.DATABASE_URL, "postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public");
  assert.equal(env.JWT_SECRET, "replace-with-a-long-random-secret");
  assert.equal(env.PORT, 4000);
});

test("throws when PORT is missing", async () => {
  process.env.APP_TIMEZONE = "Asia/Ho_Chi_Minh";
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public";
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  delete process.env.PORT;

  await assert.rejects(importFreshEnvModule(), /PORT is required/);
});

test("throws when CLIENT_ORIGIN is missing", async () => {
  process.env.APP_TIMEZONE = "Asia/Ho_Chi_Minh";
  delete process.env.CLIENT_ORIGIN;
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public";
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  process.env.PORT = "4000";

  await assert.rejects(importFreshEnvModule(), /CLIENT_ORIGIN is required/);
});

test("throws when DATABASE_URL is missing", async () => {
  process.env.APP_TIMEZONE = "Asia/Ho_Chi_Minh";
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  delete process.env.DATABASE_URL;
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  process.env.PORT = "4000";

  await assert.rejects(importFreshEnvModule(), /DATABASE_URL is required/);
});