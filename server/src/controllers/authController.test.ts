import assert from "node:assert/strict";
import test from "node:test";
import type { Request, Response } from "express";

type MockResponse = Response & {
  body?: unknown;
  statusCode: number;
};

const createMockResponse = () => {
  const response = {
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    statusCode: 200,
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };

  return response as MockResponse;
};

test("register returns 400 for invalid registration data", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  const mod = await import("./authController.js");
  const { register } = mod;
  const req = {
    body: {
      email: "not-an-email",
      password: "short"
    }
  } as Request;
  const res = createMockResponse();

  await register(req, res, () => undefined);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Invalid registration data" });
});

test("login returns 400 for invalid login data", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  const mod = await import("./authController.js");
  const { login } = mod;
  const req = {
    body: {
      email: "still-not-an-email",
      password: "short"
    }
  } as Request;
  const res = createMockResponse();

  await login(req, res, () => undefined);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: "Invalid login data" });
});