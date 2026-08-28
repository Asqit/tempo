import { Brand } from "@/components/share/brand";
import { Link } from "@tanstack/react-router";

const productLinks = [
  { label: "Produkt", href: "#produkt" },
  { label: "Pro koho", href: "#pro-koho" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center gap-6 px-4">
        <Brand />

        <nav className="hidden items-center gap-4 md:flex">
          {productLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/register"
            className="rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Zaregistrovat se
          </Link>
          <Link
            to="/login"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/30 bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/10 transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md hover:shadow-primary/20"
          >
            Přihlásit se
          </Link>
        </div>
      </div>
    </header>
  );
}
