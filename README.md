# Job Scout Hub

A full-stack job application tracker built to manage applications, track interview progress, search and filter opportunities, and interact with application data through MCP tools.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TanStack Query

### Backend
- Node.js
- Express
- TypeScript
- Zod
- Prisma

### Database
- PostgreSQL
- Docker for local development
- Neon PostgreSQL for production

### MCP
- Model Context Protocol (MCP)
- Custom MCP server
- MCP Inspector
- Compatible with MCP clients such as VS Code and Claude Desktop

## Features

- Create job applications
- Edit applications
- Delete applications
- Update application status
- Search by company or role
- Filter by status
- Sort applications by application stage
- Track salary expectations
- Bulk import applications from JSON
- Application journey statistics
- MCP tools for AI-assisted application management

## MCP Tools

The MCP server currently exposes:

- `get_applications`
- `get_application_stats`
- `search_applications`
- `create_application`
- `update_application`
- `update_application_status`
- `delete_application`

This allows an MCP-compatible AI client to perform actions such as:

> Find my Nordnet application and tell me its current status.

or:

> Find my Nordnet application and change its status to Interview.

## Architecture

```text
React
  │
  │ HTTP
  ▼
Express API
  │
  ▼
Prisma
  │
  ▼
PostgreSQL
```

MCP clients access the same application functionality through the MCP server:

```text
MCP Client
    │
    │ MCP
    ▼
Job Scout MCP Server
    │
    │ HTTP
    ▼
Express API
    │
    ▼
Prisma
    │
    ▼
PostgreSQL
```

## Project Structure

```text
job-scout-hub/
├── apps/
│   ├── web/
│   │   └── React frontend
│   │
│   ├── api/
│   │   └── Express API
│   │
│   └── mcp/
│       └── MCP server
│
├── packages/
│   └── shared/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Requirements

- Node.js
- pnpm
- Docker

### Install dependencies

```bash
pnpm install
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Run Prisma migrations

```bash
cd apps/api
pnpm prisma migrate dev
```

### Start the API

From the project root:

```bash
pnpm dev:api
```

### Start the frontend

```bash
pnpm dev:web
```

## MCP Development

Start the MCP server:

```bash
pnpm --filter mcp start
```

The MCP server communicates over `stdio` and calls the Job Scout Express API.

The API must be running for the MCP tools to access application data.

### MCP Inspector

The MCP server can be tested using MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```

## Environment Variables

Create your local environment file based on `.env.example`.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5433/jobscout"
```

Never commit real database credentials or production environment variables.

## Deployment

The planned production architecture is:

```text
Vercel
  │
  ▼
React
  │
  ▼
Render
  │
  ▼
Express API
  │
  ▼
Prisma
  │
  ▼
Neon PostgreSQL
```

Local development uses PostgreSQL through Docker, while production uses hosted PostgreSQL.

## Status

Work in progress. The core application tracking, bulk import, filtering, statistics, PostgreSQL persistence, and MCP integration are implemented.