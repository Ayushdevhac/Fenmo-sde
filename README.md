# Fenmo Expense Tracker

Fenmo is a full-stack expense tracking app built with Next.js, Prisma, and PostgreSQL. It lets a user record expenses, review previous entries, filter by category, sort by date, and see summary totals in a polished dashboard.

The project is structured for real deployment, not just local demos. It uses Postgres for durable storage, Prisma for typed database access, and Vercel for hosting and production builds.

Live deployment:
- https://expense-tracker-kappa-teal-76.vercel.app

## What This Project Does

At a high level, the app supports:

- Creating an expense with amount, category, description, and date
- Listing saved expenses from the database
- Filtering expenses by category
- Sorting expenses by newest or oldest date
- Showing total, monthly total, and average expense
- Preventing duplicate writes with an idempotency key

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Tailwind CSS 4
- Vitest and Testing Library
- Vercel for deployment

## Architecture Overview

The app lives inside the `expense-tracker/` directory.

Main pieces:

- `src/app/`
  Contains the Next.js routes, layout, and API handlers.
- `src/components/ExpenseDashboard.tsx`
  Contains the main expense UI and client-side interactions.
- `src/app/api/expenses/route.ts`
  Handles reading and creating expenses on the server.
- `src/lib/expense-utils.ts`
  Holds shared validation and data logic used by tests and routes.
- `src/lib/db.ts`
  Creates the Prisma client used by the app at runtime.
- `prisma/schema.prisma`
  Defines the database schema.
- `prisma/migrations/`
  Contains the migration history used for deployment.

## Why Prisma + Postgres

This project originally used local SQLite, but production deployment on Vercel needs durable remote storage. Postgres is a much better fit for hosted environments because:

- data persists across deployments and server restarts
- it works naturally with Vercel-hosted apps
- Prisma provides type-safe queries and migrations

Prisma 7 also changed how datasource configuration works. In this project:

- the schema defines the database provider
- `prisma.config.ts` provides the actual connection URL
- `@prisma/adapter-pg` is used at runtime so Prisma can talk to Postgres correctly

## Project Structure

Repository layout:

- Root directory:
  documentation and CI
- `expense-tracker/`:
  the actual application

Important note for Vercel:

- the Vercel Root Directory should be set to `expense-tracker`

## Local Development

### 1. Open the app directory

```powershell
cd expense-tracker
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Create a local environment file

```powershell
Copy-Item .env.example .env
```

### 4. Set `DATABASE_URL`

You need a reachable PostgreSQL database for local development.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/expense_tracker?sslmode=require"
```

### 5. Apply migrations

This creates the database tables defined by Prisma:

```powershell
npm run db:migrate:deploy
```

### 6. Start the app

```powershell
npm run dev
```

Then open:

- http://localhost:3000

## Prisma Workflow

This repo uses Prisma in two places:

- design time:
  schema and migrations
- runtime:
  typed database access inside the application

Useful commands:

- `npm run db:generate`
  Regenerates Prisma Client after schema changes
- `npm run db:migrate:deploy`
  Applies checked-in migrations to a database
- `npm run db:push`
  Pushes schema changes directly without a migration workflow

For normal production-safe work, `db:migrate:deploy` is the safer command because it uses explicit migration files.

## Testing and Verification

This project includes both unit and integration tests.

Current test coverage:

- Statements: `86.36%`
- Branches: `74.48%`
- Functions: `81.57%`
- Lines: `88.19%`

To run the full verification suite:

```powershell
npm run verify
```

That command runs:

- linting
- test coverage
- TypeScript checks through the build script
- a production Next.js build

Useful individual commands:

- `npm run lint`
- `npm run test:run`
- `npm run test:coverage`
- `npm run typecheck`
- `npm run build`

## Vercel Deployment

This project is deployed on Vercel and is configured so deployment is mostly automatic once environment variables are set.

Production URL:

- https://expense-tracker-kappa-teal-76.vercel.app

### How deployment works

When Vercel builds the app, it runs the build command from [expense-tracker/vercel.json](/c:/Users/mkanh/Desktop/Fenmo-sde/expense-tracker/vercel.json:1):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run db:migrate:deploy && npm run build"
}
```

That means every production build does two things:

1. applies Prisma migrations to the target database
2. builds the Next.js app for deployment

### Deploying from the Vercel dashboard

1. Import the repository into Vercel.
2. Set the Root Directory to `expense-tracker`.
3. In `Storage`, connect a Postgres provider from the Vercel Marketplace, or use your own Postgres database.
4. In `Settings` → `Environment Variables`, ensure `DATABASE_URL` exists.
5. Deploy the project.

### Deploying from the CLI

From `expense-tracker/`:

```powershell
vercel env pull .env.local
vercel --prod
```

## Environment Variables

This project currently expects:

- `DATABASE_URL`

`DATABASE_URL` should point to your production or development Postgres database.

Examples:

- local Postgres
- hosted Postgres provider
- Vercel Marketplace-connected Postgres integration

For production, prefer Vercel-managed environment variables instead of committing or relying on a local `.env` file.

## Notes and Recommendations

- Do not commit real database credentials.
- Rotate exposed credentials immediately if they were ever pasted into chat, terminal history, or screenshots.
- If a Postgres provider creates a variable name other than `DATABASE_URL`, add `DATABASE_URL` manually in Vercel and point it to the same connection string.
- Legacy Vercel Postgres has been replaced by Marketplace integrations, so new projects should use the Marketplace flow instead.

## References

- https://vercel.com/docs/projects/deploy-from-cli
- https://vercel.com/docs/storage/vercel-postgres
- https://vercel.com/guides/nextjs-prisma-postgres
- https://www.prisma.io/docs/orm/reference/prisma-config-reference
