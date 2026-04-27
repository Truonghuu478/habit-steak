import assert from "node:assert/strict";
import test from "node:test";

type MockResponse = {
  body?: unknown;
  statusCode: number;
  status: (code: number) => MockResponse;
  json: (payload: unknown) => MockResponse;
  end: () => MockResponse;
};

const createMockResponse = (): MockResponse => {
  const res: MockResponse = {
    body: undefined,
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    }
  };

  return res;
};

test("updateHabit updates name and validates input", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  process.env.PORT = process.env.PORT ?? "4000";

  const mod = await import("./habitController.js");
  const { updateHabit } = mod;
  const prismaMod = await import("../lib/prisma.js");

  const originalFindFirst = prismaMod.prisma.habit.findFirst;
  const originalUpdate = prismaMod.prisma.habit.update;

  const mockHabit = {
    id: "habit-1",
    userId: "user-1",
    name: "Old",
    shareId: null,
    isPublic: false,
    createdAt: new Date()
  };

  // mock findFirst and update
  // @ts-ignore - assign on runtime prisma client
  prismaMod.prisma.habit.findFirst = async ({ where }: any) => {
    if (where.id === mockHabit.id && where.userId === "user-1") return mockHabit;
    return null;
  };

  // @ts-ignore
  prismaMod.prisma.habit.update = async ({ where, data }: any) => ({ ...mockHabit, ...data });

  const req = { params: { habitId: mockHabit.id }, body: { name: "  New Name  " }, user: { id: "user-1" } } as any;
  const res = createMockResponse();

  await updateHabit(req, res as any);

  assert.equal(res.statusCode, 200);
  // body should contain updated habit with trimmed name
  // @ts-ignore
  assert.equal((res.body as any).habit.name, "New Name");

  // invalid name => 400
  const badReq = { params: { habitId: mockHabit.id }, body: { name: "   " }, user: { id: "user-1" } } as any;
  const badRes = createMockResponse();

  await updateHabit(badReq, badRes as any);
  assert.equal(badRes.statusCode, 400);

  // restore
  prismaMod.prisma.habit.findFirst = originalFindFirst;
  prismaMod.prisma.habit.update = originalUpdate;
});

test("deleteHabit removes habit when owned and returns 204", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  process.env.PORT = process.env.PORT ?? "4000";

  const mod = await import("./habitController.js");
  const { deleteHabit } = mod;
  const prismaMod = await import("../lib/prisma.js");

  const originalFindFirst = prismaMod.prisma.habit.findFirst;
  const originalDelete = prismaMod.prisma.habit.delete;

  const mockHabit = { id: "habit-delete", userId: "user-1", name: "ToDelete" } as any;

  // @ts-ignore
  prismaMod.prisma.habit.findFirst = async ({ where }: any) => {
    if (where.id === mockHabit.id && where.userId === "user-1") return mockHabit;
    return null;
  };

  // @ts-ignore
  prismaMod.prisma.habit.delete = async ({ where }: any) => mockHabit;

  const req = { params: { habitId: mockHabit.id }, user: { id: "user-1" } } as any;
  const res = createMockResponse();

  await deleteHabit(req, res as any);

  assert.equal(res.statusCode, 204);

  // not found -> 404
  // @ts-ignore
  prismaMod.prisma.habit.findFirst = async () => null;
  const notFoundRes = createMockResponse();
  await deleteHabit(req, notFoundRes as any);
  assert.equal(notFoundRes.statusCode, 404);

  prismaMod.prisma.habit.findFirst = originalFindFirst;
  prismaMod.prisma.habit.delete = originalDelete;
});

test("unmarkStreak validates date and deletes streak, recalculates current streak", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  process.env.PORT = process.env.PORT ?? "4000";

  const mod = await import("./habitController.js");
  const { unmarkStreak } = mod;
  const prismaMod = await import("../lib/prisma.js");
  const utils = await import("../utils/streaks.js");

  const originalHabitFind = prismaMod.prisma.habit.findFirst;
  const originalStreakFind = prismaMod.prisma.streak.findFirst;
  const originalStreakDelete = prismaMod.prisma.streak.delete;
  const originalStreakFindMany = prismaMod.prisma.streak.findMany;

  const mockHabit = { id: "habit-um", userId: "user-1", name: "UmHabit" } as any;
  const today = utils.getDateKey();

  // @ts-ignore
  prismaMod.prisma.habit.findFirst = async ({ where }: any) => {
    if (where.id === mockHabit.id && where.userId === "user-1") return mockHabit;
    return null;
  };

  const mockStreak = { id: "streak-1", habitId: mockHabit.id, dateKey: today, createdAt: new Date() } as any;

  // @ts-ignore
  prismaMod.prisma.streak.findFirst = async ({ where }: any) => {
    if (where.habitId === mockHabit.id && where.dateKey === today) return mockStreak;
    return null;
  };

  // @ts-ignore
  prismaMod.prisma.streak.delete = async ({ where }: any) => mockStreak;

  // remaining streaks empty => currentStreak 0
  // @ts-ignore
  prismaMod.prisma.streak.findMany = async ({ where }: any) => [];

  const req = { params: { habitId: mockHabit.id }, query: { date: today }, user: { id: "user-1" } } as any;
  const res = createMockResponse();

  await unmarkStreak(req, res as any);

  assert.equal(res.statusCode, 200);
  // @ts-ignore
  assert.equal((res.body as any).deleted.dateKey, today);
  // @ts-ignore
  assert.equal((res.body as any).currentStreak, 0);

  // invalid date format
  const badReq = { params: { habitId: mockHabit.id }, query: { date: "not-a-date" }, user: { id: "user-1" } } as any;
  const badRes = createMockResponse();
  await unmarkStreak(badReq, badRes as any);
  assert.equal(badRes.statusCode, 400);

  prismaMod.prisma.habit.findFirst = originalHabitFind;
  prismaMod.prisma.streak.findFirst = originalStreakFind;
  prismaMod.prisma.streak.delete = originalStreakDelete;
  prismaMod.prisma.streak.findMany = originalStreakFindMany;
});

test("getStreakHistory returns last N days when range provided", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
  process.env.PORT = process.env.PORT ?? "4000";

  const mod = await import("./habitController.js");
  const { getStreakHistory } = mod;
  const prismaMod = await import("../lib/prisma.js");
  const utils = await import("../utils/streaks.js");

  const originalHabitFind = prismaMod.prisma.habit.findFirst;
  const originalStreakFindMany = prismaMod.prisma.streak.findMany;

  const mockHabit = { id: "habit-hist", userId: "user-1", name: "History" } as any;

  // @ts-ignore
  prismaMod.prisma.habit.findFirst = async ({ where }: any) => {
    if (where.id === mockHabit.id && where.userId === "user-1") return mockHabit;
    return null;
  };

  const last30 = utils.getLastDateKeys(30);
  // mark the last 3 days as completed
  const completed = last30.slice(-3);

  // @ts-ignore
  prismaMod.prisma.streak.findMany = async ({ where }: any) => completed.map((d: string, i: number) => ({ id: `s${i + 1}`, habitId: mockHabit.id, dateKey: d, createdAt: new Date() }));

  const req = { params: { habitId: mockHabit.id }, query: { range: "30" }, user: { id: "user-1" } } as any;
  const res = createMockResponse();

  await getStreakHistory(req, res as any);

  assert.equal(res.statusCode, 200);
  // @ts-ignore
  const body = res.body as any;
  assert.equal(body.history.length, 30);

  // check that completed flags match
  for (const entry of body.history) {
    const should = completed.includes(entry.dateKey);
    assert.equal(entry.completed, should);
  }

  // invalid range
  const badReq = { params: { habitId: mockHabit.id }, query: { range: "0" }, user: { id: "user-1" } } as any;
  const badRes = createMockResponse();
  await getStreakHistory(badReq, badRes as any);
  assert.equal(badRes.statusCode, 400);

  prismaMod.prisma.habit.findFirst = originalHabitFind;
  prismaMod.prisma.streak.findMany = originalStreakFindMany;
});
