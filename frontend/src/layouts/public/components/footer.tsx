export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Tick</p>
        <p>Sledovani casu pro freelancery i tymy.</p>
      </div>
    </footer>
  );
}
