import assert from "node:assert/strict";
import type { Server } from "node:http";
import test from "node:test";

const startServer = async (clientOrigin = "http://localhost:5173") => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? clientOrigin;

  const mod = await import("./app.js");
  const { createApp } = mod;
  const app = createApp({ clientOrigin });

  return new Promise<{ baseUrl: string; server: Server }>((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        throw new Error("Failed to determine test server address");
      }

      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        server
      });
    });
  });
};

const closeServer = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

test("returns a JSON 404 for unknown routes", async (t) => {
  const { baseUrl, server } = await startServer();

  t.after(async () => {
    await closeServer(server);
  });

  const response = await fetch(`${baseUrl}/api/not-found`);

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(await response.json(), { message: "Route not found" });
});

test("accepts the configured development origin on preflight requests", async (t) => {
  const { baseUrl, server } = await startServer();

  t.after(async () => {
    await closeServer(server);
  });

  const response = await fetch(`${baseUrl}/api/health`, {
    method: "OPTIONS",
    headers: {
      "Access-Control-Request-Method": "GET",
      Origin: "http://localhost:5173"
    }
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
  assert.match(response.headers.get("vary") ?? "", /Origin/);
});

test("does not allow an unexpected origin in development", async (t) => {
  const { baseUrl, server } = await startServer();

  t.after(async () => {
    await closeServer(server);
  });

  const response = await fetch(`${baseUrl}/api/health`, {
    headers: {
      Origin: "http://evil.local"
    }
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});