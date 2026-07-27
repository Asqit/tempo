import { Link } from "@tanstack/react-router";

const productLinks = [
  { label: "Produkt", to: "/" },
  { label: "Cenik", to: "/" },
  { label: "FAQ", to: "/" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="text-sm font-semibold tracking-wide">
          Tick
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {productLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/register"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Registrace
          </Link>
          <Link
            to="/login"
            className="inline-flex h-8 items-center justify-center border bg-primary px-3 text-xs font-medium text-primary-foreground"
          >
            Prihlasit se
          </Link>
        </div>
      </div>
    </header>
  );
}
