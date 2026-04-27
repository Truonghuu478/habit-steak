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

test("requireAuth returns 401 when the bearer token is missing", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  const mod = await import("./auth.js");
  const { requireAuth } = mod;

  const req = {
    header: () => undefined
  } as Request;
  const res = createMockResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Missing bearer token" });
});

test("requireAuth returns 401 when the bearer token is invalid", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  const mod = await import("./auth.js");
  const { requireAuth } = mod;

  const req = {
    header: () => "Bearer invalid-token"
  } as Request;
  const res = createMockResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Invalid or expired token" });
});