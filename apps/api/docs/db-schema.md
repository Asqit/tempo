# DB Schema

```bash
User
  │
  │ 1:N
  │ ON DELETE CASCADE
  ▼
Workspace
  │
  ├───────────────────────┐
  │                       │
  │ 1:N                   │ 1:N
  │ ON DELETE CASCADE     │ ON DELETE CASCADE
  ▼                       ▼
Client                 TimeEntry
  │                       │
  │ 1:N                   ├── client_id   ──► Client
  │ ON DELETE CASCADE     │                ON DELETE SET NULL
  ▼                       │
Project ◄─────────────────┤
  │                       │
  │ 1:N                   └── project_id ──► Project
  │ ON DELETE SET NULL                    ON DELETE SET NULL
  │
  └─────────────────────────────────────────
```
