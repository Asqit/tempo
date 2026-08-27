# Tempo

> Disclaimer: I am writing this app for hobby and so support for this project is non-existent.

Tempo is an open source time tracking/reporting and invoicing application made for self-hosting. It may be useful to freelancers, project managers and everyone who wants to track time.

## What it can do (as of now)

1. Split into workspaces
2. Workspace RBAC
3. Track time for clients, projects or just on workspace
4. Create live time reports & save reports

### Planned Features

1. [x] Reports / Timesheets
2. [x] Billable flag for time-entries
3. [x] Workspaces / tenants
4. [ ] Dockerization
5. [ ] Invoices
6. [ ] MCP server for 3rd party AIs
7. [ ] Push Notifications
8. [ ] PWA for mobile
9. [ ] Pupeteer flow for document generation
10. [ ] Rich invoice designs + custom elements

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

> features with marked checkbox are now considered as a roadmap items

1. [ ] Pomodoro style timer - User starts a session and Tempo will split user's work into pomodoro slices (25min work, 5min break) until he manually preses stop.
2. [ ] Wider integration - iOS, Android, Desktop, Browser, Jira...
3. [ ] Sign-in-with providers (google, github)
4. [ ] AI assistant (using MCP server) for user's automated orchestration directly within the app.
