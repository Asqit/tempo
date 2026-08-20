# Border Radius Mapping

## Defined Variables (in `index.css`)

```css
--radius-sm: calc(var(--radius) * 0.6)   /* ~0.45rem */
--radius-md: calc(var(--radius) * 0.8)   /* ~0.60rem */
--radius-lg: var(--radius)                /* 0.75rem */
--radius-xl: calc(var(--radius) * 1.4)    /* ~1.05rem */
--radius-2xl: calc(var(--radius) * 1.8)   /* ~1.35rem */
--radius-3xl: calc(var(--radius) * 2.2)    /* ~1.65rem */
--radius-4xl: calc(var(--radius) * 2.6)   /* ~1.95rem */
```

## Base Value

```css
--radius: 0.75rem  /* Default value in both light and dark modes */
```

## Status

⚠️ **No UI components currently use border-radius variables.** The CSS variables are defined but not referenced anywhere in the component library.
