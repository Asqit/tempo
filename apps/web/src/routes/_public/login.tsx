import { LoginForm } from "@/features/auth/components/login-form";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/login")({
  component: () => (
    <div className="flex w-full flex-1">
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:py-16">
        <div className="relative space-y-5 self-center">
          <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Vítejte zpět
          </p>
          <h1 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Sledujte čas bez zbytečného tření.
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Přihlaste se a spravujte záznamy, klienty i projekty na jednom místě.
          </p>
          <div className="grid max-w-xl gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div className="rounded-none border border-border/70 bg-muted/20 px-3 py-2">
              Přehled klientů a projektů
            </div>
            <div className="rounded-none border border-border/70 bg-muted/20 px-3 py-2">
              Rychlé měření času
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Jste tu poprvé?{" "}
            <Link
              to="/register"
              className="text-foreground underline underline-offset-4"
            >
              Vytvořit účet
            </Link>
          </p>
        </div>

        <div className="flex items-start justify-start md:justify-end">
          <LoginForm />
        </div>
      </section>
    </div>
  ),
});
