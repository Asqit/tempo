# Time entry

- `TimeEntryCreateDialog` is mounted once in the sidebar footer, keeping one primary manual-entry CTA separate from navigation.
- The dialog uses Base UI's `render` trigger API; keep using `render`, not Radix's `asChild`, for new Base UI dialog triggers.
- The old duplicate create-entry trigger was removed from the sidebar footer; the running timer remains there.
