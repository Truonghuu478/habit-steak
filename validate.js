const API_URL = process.env.API_URL?.replace(/\/+$/, "");
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/+$/, "");

const password = "password123";
const email = `test-${Date.now()}@example.com`;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  return { response, data };
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const logResult = (label, details) => {
  console.log(`${label}: ${details}`);
};

const run = async () => {
  assert(typeof API_URL === "string" && API_URL.length > 0, "API_URL is required, for example API_URL=http://127.0.0.1:4000/api");

  const registerResult = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  assert(registerResult.response.status === 201, `register failed with ${registerResult.response.status}`);
  assert(typeof registerResult.data?.token === "string", "register did not return a token");
  logResult("Register", `${registerResult.response.status}`);

  const loginResult = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  assert(loginResult.response.status === 200, `login failed with ${loginResult.response.status}`);
  assert(typeof loginResult.data?.token === "string", "login did not return a token");
  const token = loginResult.data.token;
  logResult("Login", `${loginResult.response.status}, token returned`);

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  const createHabitResult = await request("/habits", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Split Deploy Smoke Test" })
  });
  assert(createHabitResult.response.status === 201, `create habit failed with ${createHabitResult.response.status}`);
  const habitId = createHabitResult.data?.habit?.id;
  assert(typeof habitId === "string", "create habit did not return a habit id");
  logResult("Create Habit", `${createHabitResult.response.status}, ${habitId}`);

  const markDoneResult = await request(`/streaks/${habitId}`, {
    method: "POST",
    headers: authHeaders
  });
  assert(markDoneResult.response.status === 201, `mark streak failed with ${markDoneResult.response.status}`);
  const dateKey = markDoneResult.data?.streak?.dateKey;
  assert(typeof dateKey === "string", "mark streak did not return a dateKey");
  logResult("Mark Streak", `${markDoneResult.response.status}, ${dateKey}`);

  const duplicateMarkResult = await request(`/streaks/${habitId}`, {
    method: "POST",
    headers: authHeaders
  });
  assert(duplicateMarkResult.response.status === 409, `duplicate streak mark should return 409, got ${duplicateMarkResult.response.status}`);
  logResult("Duplicate Streak", `${duplicateMarkResult.response.status}, ${duplicateMarkResult.data?.message ?? "no message"}`);

  const shareResult = await request(`/habits/${habitId}/share`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ isPublic: true })
  });
  assert(shareResult.response.status === 200, `share toggle failed with ${shareResult.response.status}`);
  const shareId = shareResult.data?.habit?.shareId;
  assert(typeof shareId === "string", "share toggle did not return a shareId");
  logResult("Share Habit", `${shareResult.response.status}, ${shareId}`);

  const publicHabitResult = await request(`/public/habits/${shareId}`);
  assert(publicHabitResult.response.status === 200, `public habit failed with ${publicHabitResult.response.status}`);
  const publicHabit = publicHabitResult.data?.habit;
  assert(typeof publicHabit?.name === "string", "public habit response is missing the habit name");
  assert(!("email" in publicHabit), "public habit response leaked user data");
  logResult("Public Habit API", `${publicHabitResult.response.status}, read-only fields returned`);

  if (FRONTEND_URL) {
    const frontendResponse = await fetch(`${FRONTEND_URL}/public/habits/${shareId}`);
    const html = await frontendResponse.text();
    assert(frontendResponse.status === 200, `frontend public route failed with ${frontendResponse.status}`);
    assert(/<!doctype html>/i.test(html), "frontend public route did not return HTML");
    logResult("Frontend Public Route", `${frontendResponse.status}, HTML returned`);
  } else {
    logResult("Frontend Public Route", "skipped (set FRONTEND_URL to validate the built frontend route)");
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
