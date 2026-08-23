import { RegisterForm } from "@/features/auth/components/register-form";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/register")({
  component: () => (
    <div className="flex w-full flex-1">
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:py-16">
        <div className="relative space-y-5 self-center">
          <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Založení účtu
          </p>
          <h1 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Vytvořte si účet a začněte evidovat čas.
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Registrace vám otevře přístup k evidenci záznamů, klientů a projektů
            na jednom místě.
          </p>
          <div className="grid max-w-xl gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="rounded-none border border-border/70 bg-muted/20 px-3 py-2">
              Připraveno pro freelancery
            </div>
            <div className="rounded-none border border-border/70 bg-muted/20 px-3 py-2">
              Jednoduché a rychlé rozhraní
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Už máte účet?{" "}
            <Link
              to="/login"
              className="text-foreground underline underline-offset-4"
            >
              Přihlásit se
            </Link>
          </p>
        </div>

        <div className="flex items-start justify-start md:justify-end">
          <RegisterForm />
        </div>
      </section>
    </div>
  ),
});
