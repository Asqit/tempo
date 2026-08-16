# Tempo

> Disclaimer: I am writing this app for hobby and so support for this project is non-existent.

Tempo is an open source time tracking/reporting and invoicing application made for self-hosting. It may be useful to freelancers, project managers and everyone who wants to track time.

## What it can do (as of now)

1. Split time tracking into projects and individual clients
2. Update time entries, clients and projects
3. Delete time entries, clients and projects

### Planned Features

1. [ ] Reports / Timesheets
2. [ ] Dockerization
3. [ ] Stripe integration (~14days free -> 100Kč/month)
4. [ ] Invoices
5. [x] Workspaces / tenants
6. [ ] MCP server for 3rd party AIs
7. [ ] Refactor the codebase as a huge monorepo so that frontend and pwa can share resources

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

## Proposed Features:

1. Pomodoro style timer - User starts a session and Tempo will split user's work into pomodoro slices (25min work, 5min break) until he manually preses stop.
2. Wider integration - iOS, Android, Desktop, Browser, Jira...
3. Workspace members / team members
4. Feature Requests pipeline/collector from users
5. Billable flag for time-entries for further diversification
6. Sign-in-with providers (google, github)
7. AI assistant (using MCP server) for user's automated orchestration directly within the app.
