# Tempo MVP roadmap

## Product vision

Tempo is a focused Czech SaaS for freelancers and small agencies who want to
track their time, organize it by clients and projects, generate client-ready
timesheets, and create proper invoices without using a large project-management
suite.

Tempo is not intended to become Jira-like. Its core promise is:

> Turn tracked work into a correct timesheet and invoice with as little effort
> as possible.

The product is primarily being built to solve the creator's own freelance
workflow. That is an advantage: the workflow is real and personally validated.
The main product risk is assuming that other users understand the workflow as
well as the creator does.

## Target users

- Czech freelancers
- Independent consultants and contractors
- Designers, developers, and other hourly professionals
- Small agencies with simple client/project structures

The initial price target is **100 Kč/month**. The product does not need to
compete with broad time-tracking platforms on feature count. It should compete
on simplicity, Czech-market relevance, reliable invoicing, and a focused user
experience.

## Core user journey

The main journey should be obvious and dependable:

1. Register.
2. Create or select a workspace.
3. Add a client.
4. Add a project.
5. Track time.
6. Review billable hours.
7. Generate a timesheet/report.
8. Create an invoice from the approved report.
9. Preview, download, or send the invoice.

Every major feature should support this journey. Features that do not support
it should remain secondary until the core workflow is excellent.

## MVP scope

### Time tracking

- Start, stop, resume, edit, and delete time entries.
- Support running entries across navigation and refreshes.
- Associate entries with clients and projects.
- Support billable/non-billable entries.
- Correctly handle time zones, durations, incomplete entries, and validation.
- Keep the active timer visible throughout the application.

### Clients and projects

- Create, edit, and delete clients and projects.
- Store hourly rates and currencies reliably.
- Use sensible defaults for Czech users.
- Validate that all references belong to the current workspace.

### Reports and timesheets

- Filter by period, client, project, and billable status.
- Show totals clearly.
- Generate a stable, client-ready timesheet.
- Preserve historical names, rates, and entry details in saved reports.
- Allow a saved report to become the source of an invoice.

### Invoicing

The minimum invoice workflow is:

`draft -> preview -> issue -> paid/void`

Invoices should support:

- Sequential invoice numbers per workspace.
- Client and issuer details.
- Issue date and due date.
- Currency, subtotal, tax, and total.
- Line-item descriptions, quantities, units, rates, and tax rates.
- Notes and payment instructions.
- Invoice PDF generation/download.
- Workspace invoice profile with legal name, address, company/VAT details,
  bank details, and default payment terms.

When an invoice is issued, snapshot the client, issuer, rates, descriptions,
and tax details. Issued invoices should be immutable; corrections should use
voiding or credit adjustments.

Stripe is not required for the first invoice release. Stripe would be relevant
later for charging Tempo users, not for creating invoices for their own clients.

## Public beta release

The first public release should be free and positioned as a feedback beta:

> Free during beta in exchange for feedback and bug reports.

The beta should not promise that the product will remain free forever. Early
users should receive a clear founder benefit when the 100 Kč/month subscription
is introduced.

Before inviting public users, complete these release blockers:

- Enforce workspace membership on every workspace-scoped operation.
- Fix workspace update/delete authorization and ownership handling.
- Complete member listing, invitation acceptance/rejection, role changes, and
  member removal.
- Harden production configuration, secrets, CORS, cookies, and authentication.
- Add password recovery and rate limiting for authentication endpoints.
- Correct time-entry, report, and client billing behavior.
- Add automated API tests, especially tenant-isolation tests.
- Add route-level error, loading, empty, and expired-session states.
- Provide backups, monitoring, migration procedures, and a rollback plan.

## Feedback program

The purpose of the free release is learning, not maximizing signups.

Recruit a small group of freelancers who currently use Toggl, spreadsheets, or
separate invoicing software. Ask them to complete tasks without explaining the
interface:

- Track one hour for a new client.
- Find the total billable time for the current month.
- Generate a timesheet.
- Create an invoice from that timesheet.
- Change the due date and download the invoice.

Observe hesitation, wrong clicks, and questions. Those reveal usability issues
more reliably than asking whether users like the design.

Useful feedback questions:

- Did you understand what to do after registration?
- Did you know where to find your billable time?
- Was the report suitable to send to a client?
- What was missing from the invoice?
- What did you still need to do manually outside Tempo?
- Which action would you most like to automate?

## UX principles

- Make the next action obvious for a first-time user.
- Explain workspaces briefly or keep the concept out of the way during
  onboarding.
- Use guided empty states such as “Add your first client.”
- Keep the active timer globally visible.
- Provide sensible defaults for currency, due dates, tax settings, and invoice
  numbering.
- Preview invoices before issuing them.
- Keep destructive actions explicit and reversible where possible.
- Prefer a small number of reliable workflows over a large number of settings.
- Do not introduce tasks, boards, complex workflows, or enterprise features
  that move Tempo toward Jira.

## MCP and LLM automation

MCP is a differentiating feature because timesheets and invoicing contain many
repetitive steps.

Useful read and preparation actions include:

- Find unbilled billable time for a client and period.
- Find entries missing descriptions.
- Summarize work by client or project.
- Prepare a monthly timesheet.
- Prepare an invoice draft from an approved report.
- Identify unpaid or overdue invoices.

LLM/MCP actions that change financial or shared data should require explicit
confirmation. The assistant should prepare and explain rather than silently:

- Issue an invoice.
- Send an invoice or report.
- Mark an invoice as paid.
- Edit or delete time entries.
- Share data externally.

MCP should be introduced after the manual workflow is reliable. Automation is
most valuable when it removes a proven repetitive pain point rather than hiding
an unclear product flow.

## Suggested delivery order

1. Stabilize authentication, workspace isolation, and member permissions.
2. Make time tracking dependable across desktop and mobile widths.
3. Fix client rates, currencies, time zones, report filters, and totals.
4. Finish onboarding, empty states, error handling, and the first-success flow.
5. Implement draft, issue, paid, and void invoices with immutable snapshots.
6. Add invoice preview and PDF download.
7. Add API and end-to-end tests for the complete user journey.
8. Launch a small free feedback beta.
9. Use observed feedback to prioritize fixes and MCP actions.
10. Introduce the 100 Kč/month subscription once the invoice workflow is trusted.

## Success criteria

Tempo is ready for a paid MVP when a new freelancer can independently:

- Register and create a workspace.
- Track and edit time without confusion.
- Produce an accurate monthly report.
- Turn that report into a professional invoice.
- Download or send the invoice confidently.
- Understand why Tempo is worth keeping instead of returning to Toggl and a
  separate invoicing tool.

The key differentiator is not having more features than Toggl. It is making the
final step—from tracked work to a usable invoice—feel effortless.
