# Copilot Instructions For Habit Streak

Use [AGENTS.md](../AGENTS.md) as the shared project brief and [docs/project-context.md](../docs/project-context.md) as the living architecture and business-rules reference.

## Repo Shape

- Frontend React app: `apps/frontend/src/`
- Backend Express app: `apps/backend/src/`
- Prisma schema and migrations: `apps/backend/prisma/`
- Generated output: `apps/frontend/dist/`, `apps/backend/dist/`

## Product Invariants

- Habit streaks are calculated per `Asia/Ho_Chi_Minh` local day
- A habit can only be marked complete once per local day
- Public share responses must stay read-only and must not expose user account data
- Preserve the current API contract, including update, delete, and streak unmark endpoints used by the frontend
- Backend CORS uses strict `CLIENT_ORIGIN` matching

## Environment Rules

- Local backend development: `apps/backend/.env.development`
- Local frontend development: `apps/frontend/.env.development`
- Backend tests: `apps/backend/.env.test`
- Production: platform-provided `process.env`
- Backend env access must stay centralized in `apps/backend/src/config/env.ts`

## Documentation Rules

When you implement a feature or change business logic, update the related documentation in the same change when needed.

- Update `README.md` for setup, environment, API, deploy, or user-visible behavior changes
- Update `docs/project-context.md` for architecture, business rules, ownership, or maintenance checklist changes
- Update `.env.example` when env variables change
- Update `AGENTS.md` and this file when AI guidance or source-of-truth files change

## Code Change Rules

- Do not remove or break the existing habit update/delete or streak unmark endpoints unless the task explicitly changes the API contract
- Do not edit `apps/frontend/dist/` or `apps/backend/dist/` manually
- Prefer updating existing controllers, middleware, and utilities instead of creating duplicate logic
- Add or update tests when API behavior or business rules change