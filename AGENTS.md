# Habit Streak Agent Guide

This file is the shared project brief for AI agents and contributors working in this repository.

Keep this file, [README.md](README.md), and [docs/project-context.md](docs/project-context.md) aligned whenever you add a feature, change business logic, rename environment variables, or change the public API.

## Project Summary

Habit Streak is a full-stack TypeScript application for tracking daily habits.

- Frontend: React + Vite in `apps/frontend/src/`
- Backend: Express + TypeScript in `apps/backend/src/`
- Database: PostgreSQL + Prisma in `apps/backend/prisma/`
- Production build output: `apps/frontend/dist/` and `apps/backend/dist/` are generated artifacts and should not be edited manually

## Current Product Scope

- Authentication: register, login, JWT-based auth middleware
- Habits: create, list, update, delete, and toggle public sharing
- Streaks: mark a habit as done once per Vietnam-local day, compute streak summaries, and remove a completion for a specific day
- Sharing: expose a read-only public habit link without leaking user account data
- Frontend and backend deploy as separate services; the backend must not serve the frontend bundle

## Business Rules That Must Stay True Unless Explicitly Changed

- Streak completion is keyed by `YYYY-MM-DD` in the `Asia/Ho_Chi_Minh` timezone
- A habit can only be marked done once per local day
- Public sharing returns habit-level read-only data only
- `CLIENT_ORIGIN` is used for strict backend CORS origin matching
- Local backend development uses `apps/backend/.env.development`
- Local frontend development uses `apps/frontend/.env.development`
- Backend tests use `apps/backend/.env.test`
- Production uses platform-provided `process.env`

## Code Map

- `apps/frontend/src/`: React app and client API wrapper
- `apps/frontend/src/lib/api.ts`: frontend API client and API URL validation
- `apps/frontend/vercel.json`: SPA rewrites for Vercel deployment
- `apps/backend/src/app.ts`: Express app setup, CORS, and route mounting
- `apps/backend/src/config/env.ts`: centralized backend environment access
- `apps/backend/src/controllers/`: backend request handlers
- `apps/backend/src/middleware/auth.ts`: JWT auth middleware
- `apps/backend/src/utils/streaks.ts`: streak and timezone logic
- `apps/backend/prisma/schema.prisma`: database schema
- `README.md`: setup, env, API, deploy, and validation notes
- `docs/project-context.md`: living architecture and domain context for future changes

## Required Maintenance When You Change The Project

Update documentation in the same task when behavior changes.

- If you add, remove, or change an API route, update `README.md` API section and `docs/project-context.md`
- If you change auth, sharing, streak calculation, timezone behavior, or data exposure, update `README.md`, this file, and `docs/project-context.md`
- If you add, remove, or rename an environment variable, update `.env.example`, `README.md`, and `docs/project-context.md`
- If you change the Prisma data model, update `apps/backend/prisma/schema.prisma`, create the migration, and refresh affected docs
- If you change business logic, add or update tests in `apps/backend/src/**/*.test.ts` and any affected frontend coverage
- If you change project guidance for AI workflows, update both `AGENTS.md` and `.github/copilot-instructions.md`

## Working Rules For Agents

- Start from the narrowest code path that owns the behavior
- Preserve the current product scope unless the task explicitly expands it
- Prefer updating existing abstractions over adding parallel ones
- Do not edit generated build output directly
- Treat documentation updates as part of the feature when user-visible behavior or business rules change
