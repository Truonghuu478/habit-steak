import assert from "node:assert/strict";
import test from "node:test";

const trackedKeys = ["CLIENT_ORIGIN", "JWT_SECRET", "NODE_ENV", "PORT"] as const;
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
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  process.env.PORT = "4000";

  const env = await importFreshEnvModule();

  assert.equal(env.clientOrigin, "http://localhost:5173");
  assert.equal(env.port, 4000);
  assert.equal(env.jwtSecret, "replace-with-a-long-random-secret");
});

test("reads environment variables from process.env (default)", async () => {
  delete process.env.NODE_ENV;
  process.env.CLIENT_ORIGIN = "https://habit-steak.vercel.app";
  process.env.JWT_SECRET = "replace-with-a-long-random-secret";
  process.env.PORT = "4000";

  const env = await importFreshEnvModule();

  assert.equal(env.clientOrigin, "https://habit-steak.vercel.app");
  assert.equal(env.port, 4000);
});