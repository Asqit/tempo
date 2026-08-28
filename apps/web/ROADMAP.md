# Tick Frontend Roadmap

This roadmap describes the work needed to take the current frontend from a functional product to a shippable SaaS MVP.

## Current foundation

- Authentication and protected app routes
- Workspace selection and sharing
- Readable notifications with mark-as-read support
- Time tracking, calendar, and entry editing
- Client and project management
- Reports and saved reports
- Czech product language and the current visual system are established

## Milestone 1: Release baseline

Make the frontend technically shippable.

- Fix all TypeScript and ESLint errors.
- Keep generated OpenAPI types current.
- Add route-level error handling.
- Standardize API error, retry, loading, and empty states.
- Guard screens that require an active workspace.
- Verify session expiry and logout behavior.
- Remove runtime console errors.

Definition of done: `bun run build` and `bun run lint` pass.

## Milestone 2: First-time user experience

Make the next action obvious for a new user.

- Complete create/select workspace flow.
- Add guided empty states for clients, projects, time entries, and reports.
- Guide users through creating a workspace, client, and project, then starting a timer and reviewing a report.
- Keep the active timer visible throughout the app.
- Preserve running timers across refreshes and navigation.
- Add success feedback after important actions.

## Milestone 3: Core workflow hardening

Make time tracking dependable.

- Verify start, stop, edit, delete, and resume flows.
- Handle incomplete and running entries consistently.
- Confirm destructive actions.
- Verify date, duration, timezone, and currency formatting.
- Improve mobile behavior for timer controls, calendars, and tables.
- Add or finish pagination and filter persistence where needed.

## Milestone 4: Finish product surfaces

Remove visible unfinished areas.

- Implement workspace settings.
- Implement account settings.
- Decide whether invoices are in MVP scope.
  - If yes, build the minimum invoice workflow.
  - If no, remove invoices from navigation for now.
- Add member list, roles, remove-member, leave-workspace, and invite-status flows.

## Milestone 5: Collaboration

Make workspace sharing complete.

- Add accept/reject actions for workspace invitations.
- Show notification action states.
- Handle duplicate invites and existing members.
- Make role permissions visible and predictable.
- Refresh workspace and member data after collaboration actions.

Backend/API support required for any missing invitation or permission operations should be tracked as an explicit dependency.

## Milestone 6: Launch hardening

Build confidence before inviting real users.

- Add smoke tests for authentication, workspace management, CRUD, timers, reports, and invitations.
- Test mobile widths and keyboard navigation.
- Test empty, slow, failed, and expired-session states.
- Add basic analytics or error monitoring.
- Verify production environment configuration.
- Create a release checklist and rollback plan.

## Recommended order

1. Build/lint and runtime stability
2. Workspace guards and global error states
3. Onboarding and empty states
4. Core timer workflow hardening
5. Settings and invoice-scope decision
6. Collaboration completion
7. Smoke tests and launch QA
