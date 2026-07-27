import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/register")({
  component: () => (
    <div className="flex w-full flex-1">
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:py-16">
        <div className="space-y-4 self-center">
          <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
            Zalozeni uctu
          </p>
          <h1 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
            Vytvor si ucet a zacni evidovat cas.
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Registrace ti otevre pristup k evidenci zaznamu, klientu a projektu
            na jednom miste.
          </p>
          <p className="text-xs text-muted-foreground">
            Uz mas ucet?{" "}
            <Link
              to="/login"
              className="text-foreground underline underline-offset-4"
            >
              Prihlasit se
            </Link>
          </p>
        </div>

        <div className="flex items-start justify-start md:justify-end">
          <div className="w-full border border-dashed p-5 sm:max-w-sm">
            <h2 className="text-sm font-medium">Registracni formular</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Vypln jmeno, e-mail a heslo pro vytvoreni noveho uctu.
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
});
