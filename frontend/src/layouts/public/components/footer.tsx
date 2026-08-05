export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground/90">
        <p>© {new Date().getFullYear()} Tick</p>
        <p>Sledovani casu pro freelancery i tymy.</p>
      </div>
    </footer>
  );
}
