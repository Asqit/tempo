# Backend public MVP review

This review captures the main gaps identified before making Tempo available to
public users. The backend is a good personal-use foundation, but it should not
be released publicly until authorization, authentication, data correctness, and
operational safeguards are addressed.

## Highest-priority blockers

### 1. Workspace authorization

- At review time, `GET /workspaces/{workspace_id}` checked authentication but
  not workspace membership. The current local change adds a membership
  dependency, but the service still does not independently verify the selected
  workspace and should be covered by an authorization test.
- Workspace update calls `get_workspace()` with the wrong number of arguments
  and will fail at runtime.
- Workspace update/delete pass a `WorkspaceMembers.id` where the service
  expects a `User.id`.
- Member listing, role changes, and member removal are still placeholders.
- Every workspace-scoped endpoint should have an explicit, tested tenant
  isolation rule.

Relevant files:

- `backend/src/api/v1/workspace/workspace_routes.py`
- `backend/src/api/v1/workspace/workspace_service.py`
- `backend/src/api/v1/workspace_members/workspace_members_routes.py`

### 2. Authentication and production security

- `DEBUG` defaults to `True`.
- `JWT_SECRET` defaults to an empty string.
- CORS allows every origin while credentials are enabled.
- There is no email verification, password reset, account deletion, or rate
  limiting.
- User email is not database-unique and is not normalized.
- Logout requires a valid access token even when a refresh cookie exists.

Minimum public-beta requirements: require a strong production secret, configure
explicit allowed origins, normalize and uniquely constrain emails, rate-limit
authentication endpoints, add password recovery, and define account lifecycle
behavior.

Relevant files:

- `backend/src/core/config.py`
- `backend/src/main.py`
- `backend/src/api/v1/auth/auth_helpers.py`
- `backend/src/api/v1/auth/auth_routes.py`
- `backend/src/api/v1/auth/auth_models.py`

### 3. Time-entry and report correctness

- The create path accepts `billable` but does not persist the submitted value.
- The schema defaults `billable` to `False`, while the database model defaults
  it to `True`.
- Start and end timestamps are not consistently normalized to UTC.
- Negative durations are not rejected.
- The live-report query excludes entries spanning the requested period.
- Entries created by workspace members are attributed to the workspace owner
  instead of the authenticated creator.

These issues should be fixed before invoicing because invoice totals must be
reproducible and trustworthy.

Relevant files:

- `backend/src/api/v1/time_entries/time_entries_schemas.py`
- `backend/src/api/v1/time_entries/time_entries_service.py`
- `backend/src/api/v1/reports/reports_service.py`

### 4. Client billing data

- Client creation ignores `hourly_rate` and `currency`.
- Client updates ignore `currency`.
- Nullable values such as `hourly_rate` cannot be cleared reliably.
- Database constraints and API validation should enforce valid currency and
  non-negative rates.

Relevant file: `backend/src/api/v1/clients/clients_service.py`.

## Minimum viable invoicing backend

Keep the first version narrow and dependable.

### Invoice

- workspace and client
- sequential invoice number
- status: `draft`, `issued`, `paid`, `void`
- issue date and due date
- currency
- subtotal, tax, and total
- notes and payment instructions

### Invoice line

- description
- quantity and unit
- unit price
- tax rate
- line total
- optional source report/time-entry reference

When an invoice is issued, snapshot the client, issuer, rates, descriptions,
and tax details. Issued invoices should not be edited; use voiding or credit
adjustments instead. Enforce invoice-number uniqueness per workspace.

The workspace should also have an invoice profile containing legal name,
address, company/VAT identifiers, bank details, and default payment terms.

A PDF download or generated PDF is part of the practical MVP. Stripe is not
required unless Tempo itself will charge its users; it is separate from
generating invoices for their clients.

## Other important backend gaps

- No backend test suite is present.
- No explicit production backend/deployment setup is documented.
- The compose file uses `postgres:latest`, development credentials, and exposes
  PostgreSQL directly.
- No consistent global error format or exception handling is defined.
- Workspace responses include large nested collections and may expose more data
  than necessary.
- Project/client references need stronger workspace-scoped validation.
- There is no cleanup policy for expired/revoked refresh tokens.
- There is no audit log for destructive actions or invoice changes.
- Backups, monitoring, migration procedures, and rollback plans are not
  documented.

## Recommended release order

1. Fix workspace authorization and complete member operations.
2. Harden authentication and production configuration.
3. Correct time-entry, report, and client billing behavior.
4. Add automated API tests, especially tenant-isolation and invoice-total
   tests.
5. Build the draft -> issue -> paid/void invoice workflow with immutable
   snapshots and PDF output.
6. Add deployment, backups, monitoring, rate limiting, and a small controlled
   public beta.

## Release recommendation

Treat the current application as a private beta foundation. It can become a
public MVP after the authorization and data-correctness blockers are resolved,
with invoicing added before positioning it as a complete freelancer product.
