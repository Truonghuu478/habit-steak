# Habit Streak

Full-stack TypeScript MVP for habit streak tracking.

## Scope

- Auth: register, login, password hashing, JWT middleware.
- Habits: create, list, and toggle public sharing. There is intentionally no full update or delete route.
- Streaks: mark a habit done once per Vietnam local day, calculate current streak, return the last seven days.
- Sharing: enable a read-only public link for a habit without exposing user account data.
- Frontend: React forms, token persistence, loading/error states, responsive habit dashboard.

## Setup

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:init
npm run dev
```

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:4000`.

This project now expects PostgreSQL for both local development and Railway deployment. Start a local Postgres instance first, then point `DATABASE_URL` at it before running Prisma commands.

The repository includes a local Docker Compose Postgres service that matches the default `.env.example` connection string.

The Docker setup publishes Postgres on host port `5433` by default to avoid collisions with other local Postgres containers or services already using `5432`.

```bash
npm run db:up
npm run db:init
npm run dev
```

When you are done with the local database:

```bash
npm run db:down
```

Use `npm run prisma:migrate -- --name <migration-name>` only when you intentionally change the Prisma schema and want to create a new migration.

## Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
VITE_API_URL="http://localhost:4000/api"
```

If you want to apply only the committed migrations against an existing Postgres database, run `npm run db:init`.

`VITE_API_URL` is optional in production when the frontend and API are served from the same Railway service. In that setup, the client falls back to `/api` automatically.

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
2. Create or attach a Railway Postgres service.
3. In Railway, create a new project and choose Deploy from GitHub.
4. Select this repository.
5. In the web service variables, set `DATABASE_URL` by referencing the attached Postgres service instead of pasting a local connection string.
6. Set `JWT_SECRET` to a long random secret.
7. Set `CLIENT_ORIGIN` to the public URL of your Railway web service or your custom domain.
8. Leave `PORT` unset on Railway. Railway injects it automatically and the server already listens to `process.env.PORT`.
9. Set `VITE_API_URL` only if your API is hosted on a different origin. If the same Railway service serves both frontend and backend, leave it unset.
10. Let Railway build the app with `npm run build` and start it with `npm start`.
11. After the first successful deploy, run `npm run db:init` once in the Railway service shell or as a one-off command to apply the committed Postgres migrations.

The server listens on `process.env.PORT || 4000` and serves the built Vite app from `dist` in production, so the public share route works from the same Railway service.

For Railway production, `DATABASE_URL` must point to Postgres. The committed Prisma migrations in this repo are now Postgres migrations.

Recommended Railway variable setup for a single-service deploy:

| Variable | Railway value |
| --- | --- |
| `DATABASE_URL` | Reference to the attached Postgres service `DATABASE_URL` |
| `JWT_SECRET` | Manually generated secret |
| `CLIENT_ORIGIN` | `https://<your-railway-domain>` or your custom domain |
| `VITE_API_URL` | Omit unless the API is hosted on a different domain |
| `PORT` | Omit |

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
