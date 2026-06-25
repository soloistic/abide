# Abide

Abide is a calm, non-gamified record of how God is transforming a person’s
character through the Fruit of the Spirit.

The first working slice includes:

- one fruit reflection per calendar day;
- a multi-fruit reflection form with optional Scripture reference;
- today’s reflection status on the dashboard;
- recent reflection history and detail pages;
- a chronological fruit timeline and gentle fruit-frequency trends;
- editing and confirmed deletion for saved reflections;
- guided fruit-focus prompts, optional prayer notes, and growth highlights;
- PostgreSQL persistence through Prisma.

See [the product vision](docs/ABIDE_PRODUCT_VISION.md) for product boundaries and
[the implementation notes](docs/IMPLEMENTATION.md) for architecture and
deployment decisions.

## Local development

Requirements:

- Node.js 20.19+;
- PostgreSQL;
- npm.

Create a local database:

```bash
createdb abide
```

Copy the environment template and adjust the connection string for your local
PostgreSQL user:

```bash
cp .env.example .env.local
```

The example file is safe to commit because it contains placeholders only.
`DATABASE_URL` must be a PostgreSQL connection string, and `APP_TIME_ZONE`
sets the calendar day used for “today.” Abide is currently a single-user,
PostgreSQL-backed app, so the local database does not need account or ownership
tables.

Install, migrate, and run:

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment files and database URLs

- Local development: copy `.env.example` to `.env.local` and point
  `DATABASE_URL` at a local PostgreSQL database such as `abide`. `.env.local`
  stays out of Git.
- CI and build-only checks: use a syntactically valid placeholder PostgreSQL URL
  such as `postgresql://ci:ci@127.0.0.1:5432/abide`. Prisma needs the URL shape
  during client generation, but the build should not require a live database.
- Production Vercel runtime: use Neon’s pooled PostgreSQL URL for the Vercel
  project `DATABASE_URL`.
- Production migrations: use Neon’s direct, unpooled PostgreSQL URL for the
  GitHub `production` environment secret consumed by `npm run db:deploy`.

### Prisma troubleshooting

- If `npm install`, `npm run db:generate`, or a Prisma command says
  `DATABASE_URL` is missing, copy `.env.example` to `.env.local` or export
  `DATABASE_URL` before running the command. `prisma.config.ts` loads
  `.env.local` when the variable is not already set.
- If Prisma rejects the connection string, make sure it starts with
  `postgresql://` or `postgres://` and includes a database name.
- If `npm run db:migrate` cannot connect locally, confirm PostgreSQL is running,
  the `abide` database exists, and the user/password in `.env.local` match your
  local PostgreSQL role.

## Useful commands

```bash
npm run lint
npm test
npm run test:e2e
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```

### Route-level tests

The route-level lifecycle tests use Playwright with Chromium and a disposable
PostgreSQL database. By default, `npm run test:e2e` uses
`postgresql://$USER@localhost:5432/abide_e2e`, creates that database if the
local role can connect to the `postgres` maintenance database, applies checked-in
migrations with `prisma migrate deploy`, starts Next.js on
`http://127.0.0.1:3001`, and clears reflection rows between tests.

To use a different database, set `E2E_DATABASE_URL`:

```bash
E2E_DATABASE_URL=postgresql://user:password@localhost:5432/abide_e2e npm run test:e2e
```

The E2E database is intentionally separate from the development database because
the tests create, edit, and delete reflections while exercising the real App
Router pages, Server Actions, Prisma queries, and progressive-enhancement forms.

## Neon and Vercel

1. Create a Neon project and copy its pooled PostgreSQL connection string.
2. Add `DATABASE_URL` and `APP_TIME_ZONE` to the Vercel project environments.
3. In GitHub, create an environment named `production`.
4. Add a `DATABASE_URL` environment secret containing Neon’s direct, unpooled
   connection string. Add required reviewers to the environment if migrations
   should require approval.
5. Deploy the Next.js application to Vercel.

Do not commit `.env.local`; it is ignored by Git.

## GitHub Actions

Every pull request and push to `main` runs linting, unit tests, TypeScript
checks, and a production build through `.github/workflows/ci.yml`.

`.github/workflows/production-migrations.yml` runs `prisma migrate deploy` when
migration-related files land on `main`. It can also be started manually from the
Actions tab. Migration runs are serialized and use only the `DATABASE_URL`
secret from the protected `production` environment.

Dependabot checks npm and GitHub Actions dependencies weekly. Compatible minor
and patch updates are grouped to keep maintenance PRs focused.
