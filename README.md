# Habit Streak

Full-stack TypeScript MVP for habit streak tracking.

## Scope

- Auth: register, login, password hashing, JWT middleware.
- Habits: create and list habits only. There is intentionally no `PUT` or `PATCH` route.
- Streaks: mark a habit done once per Vietnam local day, calculate current streak, return the last seven days.
- Sharing: enable a read-only public link for a habit without exposing user account data.
- Frontend: React forms, token persistence, loading/error states, responsive habit dashboard.

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:4000`.

If Prisma migrate fails on your local machine because of a schema-engine binary issue, initialize the SQLite database with the committed SQL migration:

```bash
npm run db:init
```

## Environment

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
VITE_API_URL="http://localhost:4000/api"
```

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Create user and return token |
| `POST` | `/api/auth/login` | No | Authenticate and return token |
| `GET` | `/api/me` | Yes | Return token user |
| `GET` | `/api/habits` | Yes | List habits with streak summary |
| `POST` | `/api/habits` | Yes | Create habit |
| `PATCH` | `/api/habits/:habitId/share` | Yes | Enable or disable public sharing |
| `POST` | `/api/streaks/:habitId` | Yes | Mark today as completed |
| `GET` | `/api/streaks/:habitId` | Yes | Return streak history |
| `GET` | `/api/public/habits/:shareId` | No | Read-only public habit summary |

## Streak Logic

The backend stores daily completions as `YYYY-MM-DD` `dateKey` values in the `Asia/Ho_Chi_Minh` timezone. A unique database constraint on `(habitId, dateKey)` prevents duplicate marks for the same habit on the same local day. Current streak is calculated by walking backward from the current Vietnam-local day while each date exists.

## Sharing

Each habit can optionally expose a public share link.

- `shareId` is a nullable UUID generated the first time sharing is enabled.
- `isPublic` controls whether the link is live.
- Public responses return only habit-level read-only data: name, created date, current streak, and the last seven days.
- User email and other account fields are never returned by the public endpoint.

## Railway Deploy

1. Push the repository to GitHub.
2. In Railway, create a new project and choose Deploy from GitHub.
3. Select this repository.
4. Add the required environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, and `VITE_API_URL`.
5. Let Railway build the app with `npm run build` and start it with `npm start`.
6. After deploy, set `CLIENT_ORIGIN` and `VITE_API_URL` to your Railway app URL.

The server listens on `process.env.PORT || 4000` and serves the built Vite app from `dist` in production, so the public share route works from the same Railway service.

## Validation Notes

The following runtime checks were executed locally against the built app:

- Register user: `201`, token returned.
- Create habit: `201`.
- First streak mark: `201`, returned `dateKey` matched the current `Asia/Ho_Chi_Minh` day.
- Duplicate streak mark: `409`, `Habit already marked for today`.
- Private habit list: `200`, returned `currentStreak`, seven-day history, `isPublic`, and `shareId`.
- Enable share: `200`, UUID `shareId` returned.
- Public API: `200`, returned only `name`, `createdAt`, `currentStreak`, and `lastSevenDays`.
- Public SPA route: `200`, built HTML served successfully.

## Phase Reports

Use this checklist for handoff after each implementation phase:

- Phase 0: environment structure, `.env` values, Prisma migration status, DB connectivity.
- Phase 1: auth endpoints, curl/Postman evidence, valid and invalid token checks.
- Phase 2: habit `POST`/`GET`, frontend habit list screenshot, confirmation that no update route exists.
- Phase 3: duplicate-day streak test, current streak result, seven-day UI screenshot.
- Phase 4: end-to-end login to logout flow, CORS/network issues found and fixed, API response observations.
- Phase 5: manual test cases, remaining risks, deploy notes, extension ideas.
