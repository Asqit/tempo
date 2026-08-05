# Tempo

> Disclaimer: I am writing this app for hobby and so support for this project is non-existent.

Tempo is an open source time tracking/reporting and invoicing application made for self-hosting. It may be useful to freelancers, project managers and everyone who wants to track time.

## What it can do (as of now)

1. Split time tracking into projects and individual clients
2. Update time entries, clients and projects
3. Delete time entries, clients and projects

### Planned Features

1. Reports / Timesheets
2. Dockerization
3. Invoices
4. Workspaces / tenants
5. Mini PWA application for mobile devices
6. MCP server for 3rd party AIs
7. AI assistant
8. Refactor the codebase as a huge monorepo so that frontend and pwa can share resources

## Tech. Stack

- Backend:
  - Python 3.14
  - FastAPI
  - SQLAlchemy + alembic (async postgresql)
  - Pydantic
  - uv
- Frontend:
  - react 19 (compiler)
  - Tanstack Router
  - Tanstack Query (openapi-ts/fetch/rq)
  - Tailwind CSS + Shadcn/ui
  - Zustand

## Auth

This app is OAuth2 compliant and uses JWT token for resource access and opaque tokens for session managmenet.
