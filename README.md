# Job Scout Hub

A personal job-search workspace for tracking applications, interview progress, salary expectations, and the overall journey from application to offer.

**Live website:** [job-scout-hub-web.vercel.app](https://job-scout-hub-web.vercel.app/)

<img width="1261" height="870" alt="Screenshot 2026-08-20 at 9 20 22 AM" src="https://github.com/user-attachments/assets/f777fef6-b06e-49ba-9a31-d4fd9bce8bb9" />

Built as a TypeScript monorepo with a React frontend, Express API, PostgreSQL, Prisma, and an MCP service.

## Features

### Application tracking

- Add applications manually
- Import multiple applications using JSON
- Edit existing applications
- Delete applications
- Track salary expectations
- Track application status:
  - Applied
  - Recruiter Contacted
  - Interview
  - Technical Interview
  - Offer
  - Rejected

### Search and filtering

Applications can be:

- Searched by company or role
- Filtered by status
- Sorted by application status

### Pagination

Applications are displayed with client-side pagination.

- 10 applications per page
- Previous / Next navigation
- Pagination automatically adapts to search and filters

### Journey overview

The dashboard provides a quick overview of the current job-search funnel:

```text
Applied → Recruiter Contacted → Interview → Technical Interview → Offer
```

Counts are calculated directly from application data.

### Themes

The interface includes three selectable themes:

- 🌊 Ocean
- 🔥 Ember
- 🌲 Forest

The selected theme is stored locally and restored when the application is reopened.

### Responsive UI

The interface is designed to work across desktop, tablet, and mobile layouts.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- CSS

### Backend

- Node.js
- Express
- TypeScript
- Zod

### Database

- PostgreSQL
- Prisma ORM

### Tooling

- pnpm workspaces
- TypeScript
- tsx

---

## Project Structure

```text
job-scout-hub/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   │
│   ├── web/
│   │   └── src/
│   │       ├── components/
│   │       └── features/
│   │           └── applications/
│   │
│   └── mcp/
│
├── packages/
│   └── shared/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Requirements

Before running the project locally, install:

- Node.js 22+
- pnpm
- PostgreSQL

The repository currently specifies:

```json
{
  "engines": {
    "node": ">=22.13.0"
  }
}
```

---

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd job-scout-hub
pnpm install
```

---

## Environment Variables

Create the required environment files locally.

Do not commit `.env` files.

The repository should contain only example environment configuration such as:

```text
.env.example
```

For the API, configure the PostgreSQL connection:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
OWNER_PASSWORD="choose-a-long-unique-password"
CLIENT_ORIGIN="http://localhost:5173"
```

`OWNER_PASSWORD` unlocks the private owner workspace. Sessions use an HttpOnly
cookie, expire after 168 hours by default, and use secure cookies in production.
Visitors can use **Explore demo** to access isolated, read-only sample data.

For the web application, configure the deployed/local API URL if your frontend uses an environment variable for it:

```env
VITE_API_URL="http://localhost:3001"
```

---

## Database Setup

Generate the Prisma client:

```bash
pnpm --filter api exec prisma generate
```

Apply database migrations:

```bash
pnpm --filter api exec prisma migrate deploy
```

For local development, when creating a new migration:

```bash
pnpm --filter api exec prisma migrate dev
```

---

## Development

Run the API:

```bash
pnpm dev:api
```

Run the frontend:

```bash
pnpm dev:web
```

Run the MCP service:

```bash
pnpm dev:mcp
```

The services can then be developed independently while sharing packages through the pnpm workspace.

---

## Type Checking

Run type checking across the monorepo:

```bash
pnpm typecheck
```

This executes the `typecheck` script for workspace packages.

---

## Production Build

Build the frontend:

```bash
pnpm --filter web build
```

Build the API:

```bash
pnpm --filter api build
```

Start the compiled API:

```bash
pnpm --filter api start
```

---

## API Deployment

The API requires the Prisma client to be generated before the TypeScript build.

A typical production build command is:

```bash
pnpm install && pnpm prisma generate && pnpm build
```

A typical production start command is:

```bash
pnpm prisma migrate deploy && pnpm start
```

If the deployment platform uses `apps/api` as its root directory, these commands run against the API package directly.

The production environment must provide:

```env
DATABASE_URL=...
```

---

## Frontend Deployment

The React application can be deployed to Vercel or another static frontend platform.

Typical build command:

```bash
pnpm --filter web build
```

The frontend must point to the deployed API rather than:

```text
http://localhost:3001
```

For example:

```env
VITE_API_URL=https://your-api.example.com
```

---

## JSON Import

Applications can be imported individually or in bulk.

Example:

```json
[
  {
    "company": "Example Company",
    "role": "Frontend Engineer",
    "status": "Applied",
    "salaryExpectation": "65 000 SEK/mo"
  },
  {
    "company": "Another Company",
    "role": "Senior Frontend Engineer",
    "status": "Recruiter Contacted",
    "salaryExpectation": null
  }
]
```

At minimum, each application must contain:

```json
{
  "company": "Example Company",
  "role": "Frontend Engineer"
}
```

If no status is supplied during import, the application defaults to `Applied`.

---

## Application Architecture

The frontend uses TanStack Query as the server-state layer.

Application data follows the general flow:

```text
React UI
   ↓
TanStack Query
   ↓
API client
   ↓
Express API
   ↓
Prisma
   ↓
PostgreSQL
```

Mutations invalidate or optimistically update the applications query so the UI remains synchronized with the backend.

Search, filtering, sorting, and pagination currently operate on the applications loaded by the frontend.

---

## MCP

The repository also contains an MCP service under:

```text
apps/mcp
```

This allows Job Scout functionality to be exposed through the Model Context Protocol while keeping the core application API separate from the MCP integration.

---

## Git

Before committing changes:

```bash
pnpm typecheck
pnpm --filter web build
pnpm --filter api build
```

Then:

```bash
git add .
git commit -m "your commit message"
git push
```

---

## Git Ignore

The repository should ignore generated files, dependencies, and secrets:

```gitignore
node_modules/
.pnpm-store/

dist/

.env
.env.*
!.env.example

.DS_Store
```

---

## Status

Job Scout Hub currently supports the core application-tracking workflow:

- Application CRUD
- Bulk JSON import
- Search
- Status filtering
- Status sorting
- Pagination
- Journey statistics
- Salary expectations
- Multiple UI themes
- Responsive frontend
- PostgreSQL persistence
- Production deployment
- MCP integration

Further improvements can be added incrementally as the job-search workflow evolves.
