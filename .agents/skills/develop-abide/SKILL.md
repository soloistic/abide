---
name: develop-abide
description: Implement and verify changes in the Abide Next.js application while preserving its reflection-focused product guardrails, Prisma data conventions, request-time rendering, and release checks. Use for feature, bug-fix, database, UI, or maintenance work in this repository.
---

# Develop Abide

## Workflow

1. Read `AGENTS.md`, the issue, and the relevant file in `docs/`.
2. Install dependencies with a syntactically valid `DATABASE_URL`.
3. Before changing Next.js code, read the matching guide under
   `node_modules/next/dist/docs/`.
4. Inspect nearby code and tests before choosing an implementation.
5. Make the smallest coherent change that completes the issue.
6. Run lint, unit tests, typecheck, and build.

Use this environment when no live database is required:

```bash
export DATABASE_URL=postgresql://ci:ci@127.0.0.1:5432/abide
export APP_TIME_ZONE=Europe/London
```

## Implementation rules

- Keep reads in Server Components or server-only modules and call
  `connection()` before request-time Prisma queries.
- Keep mutations in validated Server Actions. Revalidate every affected route
  and preserve no-JavaScript form submission.
- Reuse `lib/dates.ts` for calendar-date behavior.
- Add a new Prisma migration for schema changes; never rewrite applied
  migrations or generated Prisma code.
- Add Vitest tests for pure date, validation, or insight logic.

## Product rules

- Keep the experience calm and reflective.
- Do not add streaks, scores, rankings, rewards, or judgmental language.
- Do not present fruit frequency as spiritual performance.
- Preserve accessible labels, non-color state indicators, progressive
  enhancement, and reduced-motion behavior.

## Completion

Run:

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

Report any check that could not run and why. Do not claim database-backed
behavior was exercised when only the placeholder URL was used.
