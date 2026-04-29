# Habit Streak Project Context

This is a living project context file for AI agents and maintainers.

Update it when the architecture, business rules, API surface, environment model, or maintenance workflow changes.

## Product Overview

Habit Streak is a full-stack TypeScript MVP for tracking habit streaks.

The main user flows are:

- register and login
- create habits
- mark a habit complete for the current Vietnam-local day
- view current streak and last seven days
- optionally share a read-only public habit page

## Architecture Overview

### Frontend

- Location: `apps/frontend/src/`
- Stack: React + Vite + TypeScript
- Responsibility: forms, auth token storage, dashboard rendering, public habit page consumption
- API client: `apps/frontend/src/lib/api.ts`
- Deployment target: Vercel
- Routing note: `apps/frontend/vercel.json` rewrites SPA routes such as `/public/habits/:shareId` to `index.html`

### Backend

- Location: `apps/backend/src/`
- Stack: Express + TypeScript
- App entry: `apps/backend/src/index.ts`
- App composition: `apps/backend/src/app.ts`
- Routes: `apps/backend/src/routes/`
- Controllers: `apps/backend/src/controllers/`
- Auth middleware: `apps/backend/src/middleware/auth.ts`
- Streak logic: `apps/backend/src/utils/streaks.ts`
- Environment access: `apps/backend/src/config/env.ts`
- Deployment target: Render
- Boundary note: the backend exposes only `/api` routes and no longer serves the frontend bundle

### Database

- Location: `apps/backend/prisma/`
- Stack: Prisma + PostgreSQL
- Schema source: `apps/backend/prisma/schema.prisma`
- Migrations: `apps/backend/prisma/migrations/`

## Environment Model

- Local development backend uses `apps/backend/.env.development`
- Local development frontend uses `apps/frontend/.env.development`
- Backend tests use `apps/backend/.env.test`
- Production uses host-platform environment variables
- Frontend Vite variables use the `VITE_` prefix and are read by Vite during development and build
- Frontend builds fail if `VITE_API_URL` is missing or does not end with `/api`

Current backend env variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CLIENT_ORIGIN`
- `APP_TIMEZONE`

Current frontend env variable:

- `VITE_API_URL`

## Domain Rules

### Authentication

- Users register and login with email and password
- Passwords are hashed before persistence
- Authenticated requests use JWT bearer tokens

### Habits

- Habits can be created, listed, updated, and deleted
- Habits can toggle public sharing on and off

### Streaks

- Streaks are stored by date key in `YYYY-MM-DD` format
- The authoritative timezone is `Asia/Ho_Chi_Minh`
- Duplicate completion for the same habit and same local day is not allowed
- Current streak is computed by walking backward from the current local day
- The client receives a seven-day summary alongside the current streak
- A streak entry can be removed by date without changing the timezone rule

### Public Sharing

- A habit can expose a `shareId`
- Public responses must stay read-only
- Public responses must not expose user account data such as email or token information

## Operational Rules

- CORS is controlled by `CLIENT_ORIGIN` and is matched strictly in the backend
- Local Docker Compose provides PostgreSQL on host port `5433`
- The backend listens on `process.env.PORT`
- Build output is generated into `apps/frontend/dist/` and `apps/backend/dist/`
- Render builds the backend with `npm install && npm run build` from `apps/backend`
- Vercel builds the frontend with `npm run build` from `apps/frontend`

## Change Checklist

Use this checklist whenever you add a feature or change business logic.

### If you change API behavior

- Update `README.md` API table
- Update this file if the route surface or request flow changes
- Update backend tests for the affected behavior

### If you change auth behavior

- Update `README.md` scope or API notes if user-visible behavior changes
- Update this file's authentication section
- Update auth-related tests

### If you change streak or timezone logic

- Update `README.md` Streak Logic
- Update this file's Streaks section
- Update or add tests that cover the new rule

### If you change public sharing or data exposure

- Update `README.md` Sharing section and API table if needed
- Update this file's Public Sharing section
- Re-check that no user account data leaks from public endpoints

### If you change environment variables or runtime mode

- Update `.env.example`
- Update `README.md` Environment and Deploy sections
- Update this file's Environment Model section
- Update `AGENTS.md` and `.github/copilot-instructions.md` if the workflow changes

### If you change the data model

- Update `apps/backend/prisma/schema.prisma`
- Create or update the Prisma migration
- Update docs when the schema change affects API behavior or business rules

## Source Of Truth Files

- `README.md`: setup, env, deploy, API, and validation notes
- `AGENTS.md`: shared AI agent project brief
- `.github/copilot-instructions.md`: Copilot-specific always-on guidance
- `docs/project-context.md`: living architecture and domain context
