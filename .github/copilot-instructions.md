# Copilot Instructions For Habit Streak

Use [AGENTS.md](../AGENTS.md) as the shared project brief and [docs/project-context.md](../docs/project-context.md) as the living architecture and business-rules reference.

## Repo Shape

- Frontend React app: `src/`
- Backend Express app: `server/src/`
- Prisma schema and migrations: `prisma/`
- Generated output: `dist/`, `dist-server/`

## Product Invariants

- Habit streaks are calculated per `Asia/Ho_Chi_Minh` local day
- A habit can only be marked complete once per local day
- Public share responses must stay read-only and must not expose user account data
- Habit scope currently supports create, list, and share toggle only
- Backend CORS uses strict `CLIENT_ORIGIN` matching

## Environment Rules

- Local backend development: `.env.development`
- Backend tests: `.env.test`
- Production: platform-provided `process.env`
- Backend env access must stay centralized in `server/src/config/env.ts`

## Documentation Rules

When you implement a feature or change business logic, update the related documentation in the same change when needed.

- Update `README.md` for setup, environment, API, deploy, or user-visible behavior changes
- Update `docs/project-context.md` for architecture, business rules, ownership, or maintenance checklist changes
- Update `.env.example` when env variables change
- Update `AGENTS.md` and this file when AI guidance or source-of-truth files change

## Code Change Rules

- Do not add a full habit update or delete flow unless the task explicitly requires it
- Do not edit `dist/` or `dist-server/` manually
- Prefer updating existing controllers, middleware, and utilities instead of creating duplicate logic
- Add or update tests when API behavior or business rules change