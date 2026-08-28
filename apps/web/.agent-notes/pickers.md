# Pickers

- ClientPicker and ProjectPicker keep API fetching/normalization local and delegate selection UI to `components/ui/entity-picker.tsx`.
- `EntityPicker` is the shared parent; it renders `SinglePicker` or `MultiplePicker` based on `multiple`.
- Multiple mode uses checkbox visuals and prevents menu dismissal while toggling; clients retain incremental loading, projects load 100 options.
