import { LoginForm } from "@/features/auth/components/login-form";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/login")({
  component: () => (
    <div className="flex w-full flex-1">
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:py-16">
        <div className="space-y-4 self-center">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Vitej zpet
          </p>
          <h1 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Sleduj cas bez zbytecneho treni.
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Prihlas se a spravuj zaznamy, klienty i projekty na jednom miste.
          </p>
          <p className="text-xs text-muted-foreground">
            Jsi tu poprve?{" "}
            <Link
              to="/register"
              className="text-foreground underline underline-offset-4"
            >
              Vytvorit ucet
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
