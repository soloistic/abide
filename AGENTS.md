<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Abide project guide

Abide is a calm, non-gamified journal for reflecting on growth in the Fruit of
the Spirit. Preserve the language and product boundaries in
`docs/ABIDE_PRODUCT_VISION.md`.

## Before changing code

1. Read the issue and the relevant product or implementation notes.
2. Install with a valid PostgreSQL-shaped `DATABASE_URL`; Prisma generation
   runs during `postinstall`.
3. Read the version-matched Next.js guide for the area being changed. Common
   starting points are:
   - `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
     for forms and Server Actions;
   - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`
     for request-time database reads;
   - `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` for tests.

For checks that do not need a live database, use:

```bash
export DATABASE_URL=postgresql://ci:ci@127.0.0.1:5432/abide
export APP_TIME_ZONE=Europe/London
```

## Architecture

- `app/` contains App Router pages and Server Actions.
- `components/` contains reusable forms and presentational UI.
- `lib/` contains dates, fruit metadata, Prisma access, queries, and pure
  insight logic.
- `prisma/schema.prisma` is the data model; `prisma/migrations/` contains
  immutable, checked-in migrations.
- `generated/prisma/` is generated and must not be edited or committed.

Keep database reads in Server Components or server-only modules. Call
`connection()` before Prisma reads that must happen at request time. Validate
mutation input with Zod, handle expected Prisma errors, revalidate affected
routes, and preserve progressive enhancement.

The app is intentionally single-user. Do not add authentication or ownership
assumptions without an issue that includes the required data migration.

## Product and UI guardrails

- Avoid scores, streaks, ranks, rewards, or language that measures holiness.
- Describe patterns gently; fruit frequency is not a performance metric.
- Keep forms usable without client-side JavaScript.
- Do not use color as the only state indicator.
- Respect `prefers-reduced-motion`.
- Keep reflection dates as calendar dates. Use the helpers in `lib/dates.ts`
  rather than ad hoc timezone conversion.

## Data changes

Create a new migration for schema changes. Never edit a migration that may have
already been applied. Production uses `npm run db:deploy`; local development
uses `npm run db:migrate`.

## Verification

Run all checks before handing work off:

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

Add or update Vitest coverage for pure logic. Async Server Components are better
covered by an end-to-end test when that test layer is introduced.

Use the repository skill at `.agents/skills/develop-abide/SKILL.md` for the
short implementation workflow.
