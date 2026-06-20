# Abide

Abide is a calm, non-gamified record of how God is transforming a person’s
character through the Fruit of the Spirit.

The first working slice includes:

- one fruit reflection per calendar day;
- a multi-fruit reflection form with optional Scripture reference;
- today’s reflection status on the dashboard;
- recent reflection history and detail pages;
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

Install, migrate, and run:

```bash
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```

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

Every pull request runs linting, unit tests, TypeScript checks, and a production
build through `.github/workflows/ci.yml`.

`.github/workflows/production-migrations.yml` runs `prisma migrate deploy` when
migration-related files land on `main`. It can also be started manually from the
Actions tab. Migration runs are serialized and use only the `DATABASE_URL`
secret from the protected `production` environment.
