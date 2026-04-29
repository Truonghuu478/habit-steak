# Habit Streak

Full-stack TypeScript habit tracking app with a split deployment model:

- Frontend: Vite + React, deployed to Vercel
- Backend: Express + Prisma, deployed to Render
- Database: PostgreSQL

The backend preserves the existing `/api` contract and no longer serves the frontend bundle.

## Architecture

```text
apps/
	backend/
		prisma/
		src/
	frontend/
		src/
		vercel.json
docker-compose.yml
README.md
render.yaml
validate.js
```

## Scope

- Auth: register, login, password hashing, JWT middleware
- Habits: create, list, update, delete, and toggle public sharing
- Streaks: mark a habit done once per Vietnam local day, calculate current streak, return the last seven days, and remove a completion by date
- Sharing: expose a read-only public link without exposing user account data
- Frontend: token persistence, auth headers, dashboard rendering, and public habit page consumption

## AI Context

The repository keeps AI-readable project context in `AGENTS.md`, `.github/copilot-instructions.md`, and `docs/project-context.md`.

When a feature, API contract, environment model, or business rule changes, update the affected documentation files in the same task so future agents read current information.

## Local Setup

```bash
cp apps/backend/.env.example apps/backend/.env.development
cp apps/frontend/.env.example apps/frontend/.env.development
npm install
npm run db:up
npm run db:init
npm run dev
```

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:4000`
- Local Docker Compose publishes PostgreSQL on host port `5433`

When you are done with the local database:

```bash
npm run db:down
```

Use `npm run prisma:migrate -- --name <migration-name>` only when you intentionally change `apps/backend/prisma/schema.prisma` and want to create a new migration.

## Environment

Backend local development uses `apps/backend/.env.development`.
Frontend local development uses `apps/frontend/.env.development`.
Backend tests use `apps/backend/.env.test`.

Example local values:

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/habit_steak?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
APP_TIMEZONE="Asia/Ho_Chi_Minh"
VITE_API_URL="http://localhost:4000/api"
```

Rules:

- Backend requires `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_ORIGIN`
- Backend reads `PORT` from `process.env.PORT`; Render injects it automatically
- Frontend requires `VITE_API_URL`, and it must end with `/api`
- Frontend builds fail fast if `VITE_API_URL` is missing or malformed
- `APP_TIMEZONE` defaults to `Asia/Ho_Chi_Minh`

If you want to apply only the committed migrations against an existing Postgres database, run `npm run db:init`.

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/auth/register` | No | Create user and return token |
| `POST` | `/api/auth/login` | No | Authenticate and return token |
| `GET` | `/api/me` | Yes | Return token user |
| `GET` | `/api/habits` | Yes | List habits with streak summary |
| `POST` | `/api/habits` | Yes | Create habit |
| `PATCH` | `/api/habits/:habitId` | Yes | Rename a habit |
| `DELETE` | `/api/habits/:habitId` | Yes | Delete a habit |
| `PATCH` | `/api/habits/:habitId/share` | Yes | Enable or disable public sharing |
| `POST` | `/api/streaks/:habitId` | Yes | Mark today as completed |
| `GET` | `/api/streaks/:habitId` | Yes | Return streak history |
| `DELETE` | `/api/streaks/:habitId?date=YYYY-MM-DD` | Yes | Remove a completion for a specific day |
| `GET` | `/api/public/habits/:shareId` | No | Read-only public habit summary |

## Streak Logic

The backend stores daily completions as `YYYY-MM-DD` `dateKey` values in the `Asia/Ho_Chi_Minh` timezone. A unique database constraint on `(habitId, dateKey)` prevents duplicate marks for the same habit on the same local day. Current streak is calculated by walking backward from the current Vietnam-local day while each date exists.

## Sharing

Each habit can optionally expose a public share link.

- `shareId` is a nullable UUID generated the first time sharing is enabled
- `isPublic` controls whether the link is live
- Public responses return only habit-level read-only data: name, created date, current streak, and the last seven days
- User email and other account fields are never returned by the public endpoint

## Deploy

### Backend on Render

1. Push the repository to GitHub.
2. Create a Render PostgreSQL database.
3. Create a Render Web Service pointing at this repository.
4. Set the Root Directory to `apps/backend`.
5. Set the Build Command to `npm install && npm run build`.
6. Set the Start Command to `npm start`.
7. Configure environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Render PostgreSQL connection string |
| `JWT_SECRET` | Long random secret |
| `CLIENT_ORIGIN` | Your Vercel frontend URL, for example `https://your-frontend.vercel.app` |
| `APP_TIMEZONE` | `Asia/Ho_Chi_Minh` |
| `PORT` | Omit, Render injects it automatically |

8. After the first successful deploy, run `npm run db:init` from the Render shell or as a one-off job to apply committed migrations.
9. Use `/api/health` as the health check path.

An optional `render.yaml` blueprint is included at the repository root if you want Render to prefill the service configuration.

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the Root Directory to `apps/frontend`.
3. Set the Framework Preset to `Vite`.
4. Set the Build Command to `npm run build`.
5. Set the Output Directory to `dist`.
6. Configure `VITE_API_URL` as the full Render API URL, for example `https://your-backend.onrender.com/api`.
7. Deploy. `apps/frontend/vercel.json` rewrites SPA routes so direct hits to `/public/habits/:shareId` resolve correctly.

## Validation

- `npm run test:server` validates backend routing, CORS behavior, auth middleware, and controller rules
- `npm run build:backend` validates Prisma client generation and backend TypeScript output
- `VITE_API_URL=http://127.0.0.1:4000/api npm run build:frontend` validates the frontend build with an explicit API origin
- `API_URL=http://127.0.0.1:4000/api node validate.js` performs an end-to-end API smoke test against a running backend. Set `FRONTEND_URL` as well if you want it to verify the public frontend route.

## Validation Notes

- The frontend no longer falls back to `localhost` or relative `/api`; deployment requires an explicit `VITE_API_URL`
- The backend no longer serves the frontend bundle and keeps strict `CLIENT_ORIGIN` matching with `credentials: true`
- Root scripts proxy to the workspace apps so local development still starts from the repository root
