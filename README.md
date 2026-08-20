# Job Scout Hub

> A full-stack, privacy-conscious job-search workspace built around one question: **where do I actually want to go next?**

[Explore the live demo](https://job-scout-hub-web.vercel.app/) · [Read the case study](https://job-scout-hub-web.vercel.app/case-study) · [Connect on LinkedIn](https://www.linkedin.com/in/mehmood-ul-haq/)

<img width="1261" height="870" alt="Job Scout Hub application dashboard" src="https://github.com/user-attachments/assets/f777fef6-b06e-49ba-9a31-d4fd9bce8bb9" />

## Why I built it

I was already employed and selectively exploring companies that genuinely interested me. When recruiter conversations, follow-ups, salary expectations, and browser tabs started piling up, I needed a calmer way to reason about the search.

Job Scout Hub is not designed to maximise application volume. It keeps the company, people, role, compensation, and recruitment journey in context—so the search stays intentional.

## What it demonstrates

- A polished React experience with responsive layouts, keyboard-accessible dialogs, loading/error states, and five theme personalities.
- A flexible recruitment timeline: timestamp each stage, mark the current step, distinguish upcoming and completed work, reorder each company’s process, and skip/restore stages.
- A secure separation between a private owner workspace and a realistic, read-only portfolio demo.
- Type-safe full-stack development with shared status types, Zod request validation, Prisma/PostgreSQL persistence, and TanStack Query server state.
- Production deployment across Vercel (web), Render (API), and Neon (PostgreSQL), with privacy-friendly Vercel Analytics.

## Architecture

```text
React + TypeScript + Vite
        │
TanStack Query API clients
        │
Express + Zod validation ─── session / access-mode checks
        │
Prisma ORM
        │
PostgreSQL (Neon)

Shared package: application statuses and domain types
Deployment: Vercel (web) · Render (API) · Neon (database)
```

The repository is a pnpm monorepo:

```text
apps/
  web/       React, Vite, TanStack Query
  api/       Express, Zod, Prisma
  mcp/       Model Context Protocol service
packages/
  shared/    Shared domain types and application statuses
```

## Demo mode and privacy

Visitors can choose **Explore demo** without a password. The API seeds realistic sample applications and timelines in a dedicated `viewer` access mode. That mode is read-only, and private owner applications are never returned to it.

The public [case study](https://job-scout-hub-web.vercel.app/case-study) is also no-auth and makes no application-data requests.

## Engineering choices

| Concern | Approach |
| --- | --- |
| Server state | TanStack Query with targeted invalidation after application and timeline mutations |
| Input validation | Zod schemas at API boundaries |
| Access control | HttpOnly session cookie and server-side `owner` / `viewer` checks |
| Accessibility | Semantic tables, labelled icon buttons, focus-trapped modals, Escape-to-close, and visible focus styles |
| Reliability | Error boundary, purpose-built loading/empty/error states, and CI quality checks |
| Analytics | Anonymous Vercel page-view analytics plus a non-identifying demo-entry event |

## Visual highlights

The live demo is the best place to see the current visual system:

- **Dashboard:** application table with search, filters, custom status order, pagination, and recruiter context.
- **Timeline:** company-specific recruitment stages with current/final outcome treatment and date-time editing.
- **Themes:** Light, Dark, Black, Ocean, and Ember all use the same semantic token system.
- **Mobile:** dense workspace controls collapse into single-column, touch-friendly layouts.

## Local development

### Requirements

- Node.js 22+
- pnpm 11+
- PostgreSQL

### Setup

```bash
git clone https://github.com/mehmood14/job-scout-hub.git
cd job-scout-hub
pnpm install
```

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
OWNER_PASSWORD="choose-a-long-unique-password"
CLIENT_ORIGIN="http://localhost:5173"
```

Create `apps/web/.env` when the API does not run at the default local URL:

```env
VITE_API_URL="http://localhost:3001"
```

Generate Prisma client and apply migrations:

```bash
pnpm --filter api exec prisma generate
pnpm --filter api exec prisma migrate deploy
```

Run the apps in separate terminals:

```bash
pnpm dev:api
pnpm dev:web
```

## Quality checks

```bash
pnpm typecheck
pnpm --filter web lint
pnpm test
pnpm --filter web build
pnpm --filter api build
```

GitHub Actions runs typechecking, linting, Vitest business-logic tests, Prisma generation, and both production builds on every push and pull request.

## Deployment

- **Web:** deploy `apps/web` to Vercel with `VITE_API_URL` set to the Render API URL. The Vercel rewrite keeps `/case-study` directly shareable.
- **API:** deploy `apps/api` to Render. Generate Prisma client during build and run `prisma migrate deploy` before starting the API.
- **Database:** configure `DATABASE_URL` with the Neon connection string.

## Contact

I’m Mehmood Ul Haq, a Stockholm-based full-stack software engineer with 5+ years of experience. I enjoy frontend architecture, product-focused delivery, and turning complex work into a clear, friendly experience.

- [LinkedIn](https://www.linkedin.com/in/mehmood-ul-haq/)
- [mehmoodulhaq14@gmail.com](mailto:mehmoodulhaq14@gmail.com)
