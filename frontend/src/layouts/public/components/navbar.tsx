import { Brand } from "@/components/share/brand";
import { Link } from "@tanstack/react-router";

const productLinks = [
  { label: "Produkt", to: "/" },
  { label: "Cenik", to: "/" },
  { label: "FAQ", to: "/" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Brand />

        <nav className="hidden items-center gap-4 md:flex">
          {productLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/register"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Registrace
          </Link>
          <Link
            to="/login"
            className="inline-flex h-9 items-center justify-center rounded-none border border-primary/30 bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm"
          >
            Prihlasit se
          </Link>
        </div>
      </div>
    </header>
  );
}
