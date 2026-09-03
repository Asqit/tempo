# DB Schema

## Overview

Multi-user time tracking system with workspaces, clients, projects, and reporting.

## Entity Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                           User                                 │
│                    (email, password, prefs)                     │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬──────────────┐
         │           │           │              │
         │ 1:N       │ 1:N       │ 1:N          │
         │ CASCADE   │ CASCADE   │ CASCADE      │
         ▼           ▼           ▼              ▼
    Workspace    RefreshToken  WorkspaceMember  WorkspaceInvitation
    (per user)                 (role enum)      (for onboarding)
         │
         │ 1:N CASCADE
         │
         ├─────────────────────────────────────┐
         │                                     │
         │ 1:N CASCADE                         │ 1:N CASCADE
         ▼                                     ▼
      Client                               TimeEntry
   (details, rates)                  (tracking unit, billable flag)
         │                                     │
         │ 1:N CASCADE                         ├─ FK to Workspace ──► Workspace
         │                                     ├─ FK to User ──────► User (creator)
         ▼                                     ├─ FK to Client (nullable, SET NULL)
      Project                                 │                 ──► Client
   (time-bound)                               └─ FK to Project (nullable, SET NULL)
         │                                                     ──► Project
         │ 1:N (SET NULL on Project delete)
         │
         └────────────────► TimeEntry


Report (Workspace scoped)
├─ 1:1 ReportClientSnapshot    (frozen Client data at generation time)
├─ 1:1 ReportProjectSnapshot   (frozen Project data at generation time)
└─ 1:N ReportEntrySnapshot     (frozen TimeEntry snapshots + denormalized client/project names)
```

## Key Relationships

| Parent    | Child                 | Cardinality | ON DELETE | Notes                            |
| --------- | --------------------- | ----------- | --------- | -------------------------------- |
| User      | Workspace             | 1:N         | CASCADE   | User owns workspaces             |
| User      | RefreshToken          | 1:N         | CASCADE   | Auth tokens                      |
| User      | WorkspaceMember       | 1:N         | CASCADE   | Workspace access grants          |
| User      | WorkspaceInvitation   | 1:N         | CASCADE   | Pending invitations              |
| Workspace | Client                | 1:N         | CASCADE   | Workspace scoped                 |
| Workspace | TimeEntry             | 1:N         | CASCADE   | Workspace scoped                 |
| Workspace | Report                | 1:N         | CASCADE   | Reporting scoped                 |
| Client    | Project               | 1:N         | CASCADE   | Client owns projects             |
| Project   | TimeEntry             | 1:N         | SET NULL  | Entries survive project deletion |
| Client    | TimeEntry             | 1:N         | SET NULL  | Entries survive client deletion  |
| Workspace | WorkspaceMember       | 1:N         | CASCADE   | Member removal deletes access    |
| Workspace | WorkspaceInvitation   | 1:N         | CASCADE   | Invitation cleanup               |
| Report    | ReportClientSnapshot  | 1:1         | CASCADE   | Snapshot lifecycle               |
| Report    | ReportProjectSnapshot | 1:1         | CASCADE   | Snapshot lifecycle               |
| Report    | ReportEntrySnapshot   | 1:N         | CASCADE   | Snapshot lifecycle               |

## Key Fields

### User

- `id` (PK)
- `name`, `email` (unique)
- `hashed_password`
- `country`
- `locale` (default: "cs")
- `timezone` (default: "Europe/Prague")
- `last_login_at`

### Workspace

- `id` (PK)
- `user_id` (FK → User, CASCADE)
- `name` (unique per user)

### WorkspaceMember

- `id` (PK)
- `user_id` (FK → User, CASCADE)
- `workspace_id` (FK → Workspace, CASCADE)
- `role` (enum: OWNER, MEMBER, VIEWER)
- Unique constraint: (user_id, workspace_id)

### WorkspaceInvitation

- `id` (PK)
- `workspace_id` (FK → Workspace, CASCADE)
- `user_id` (FK → User, CASCADE)
- `role` (enum: OWNER, MEMBER, VIEWER)
- `accepted_at` (nullable, timestamp of acceptance)
- `revoked_at` (nullable, timestamp of revocation)
- `expires_at` (nullable, invitation expiry)

### Client

- `id` (PK)
- `workspace_id` (FK → Workspace, CASCADE)
- `name` (string, unique per workspace)
- `is_company` (bool, default: true)
- Address fields: `street`, `city`, `postal_code`, `country`
- Tax ID: `ico`, `dic`, `vat_payer` (bool)
- Banking: `bank_account`, `iban`, `currency` (default: "CZK")
- Billing: `discount_percentage`, `hourly_rate`

### Project

- `id` (PK)
- `client_id` (FK → Client, CASCADE)
- `name` (string)
- `description` (nullable)
- `start_time`, `end_time` (nullable, timezone-aware)

### TimeEntry

- `id` (PK)
- `workspace_id` (FK → Workspace, CASCADE)
- `user_id` (FK → User) — entry creator
- `client_id` (FK → Client, SET NULL, nullable)
- `project_id` (FK → Project, SET NULL, nullable)
- `description` (nullable, max 64 chars)
- `start_time`, `end_time` (timezone-aware, end nullable)
- `billable` (bool, default: true)

### Report

- `id` (PK)
- `workspace_id` (FK → Workspace, CASCADE)
- `name`, `description` (string)
- `uuid` (nullable, unique, for sharing)
- `period_start`, `period_end` (timezone-aware)

### ReportClientSnapshot

- `id` (PK)
- `report_id` (FK → Report, CASCADE, unique)
- `name` (string)
- `hourly_rate` (nullable, decimal)
- `currency` (string, 3-char code)

### ReportProjectSnapshot

- `id` (PK)
- `report_id` (FK → Report, CASCADE, unique)
- `name` (string)

### ReportEntrySnapshot

- `id` (PK)
- `report_id` (FK → Report, CASCADE)
- `time_entry_id` (FK → TimeEntry, SET NULL, nullable)
- `duration_minutes` (int)
- `description`, `logged_at` (string + timestamp)
- `client_name`, `project_name` (denormalized, nullable)

## Design Notes

1. **Workspace Isolation**: All entities except User are scoped to a Workspace for multi-tenancy.
2. **WorkspaceMember vs WorkspaceInvitation**: Members have accepted access; Invitations are pending.
3. **TimeEntry Flexibility**: Optional client/project allows entries without explicit categorization ("Bez projektu").
4. **Report Snapshots**: Frozen data at report generation time; entries survive TimeEntry deletion (SET NULL).
5. **Cascade Strategy**: Workspace deletes cascade down; TimeEntry → Client/Project uses SET NULL to preserve history.
6. **User Creator Field**: TimeEntry.user_id tracks who logged the time (not populated in current UI flow).
