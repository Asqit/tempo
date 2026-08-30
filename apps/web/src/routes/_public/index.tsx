import { useAuthStore } from "@/features/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight, Check, Clock3, ReceiptText, UsersRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@tempo/ui/components/button";

export const Route = createFileRoute("/_public/")({
  loader() {
    const { isAuthenticated, token } = useAuthStore.getState();
    if (isAuthenticated && token)
      throw redirect({
        to: "/app",
        replace: true,
      });
  },
  component: HomeView,
});

function HomeView() {
  return (
    <div className="w-full">
      <section className="relative isolate overflow-hidden border-b border-sidebar-border/70 bg-sidebar text-sidebar-foreground [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-position:center] [background-size:72px_72px]">
        <div className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[32rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 -z-10 size-[26rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16 md:py-20">
          <div className="relative z-10">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="size-2 rounded-full bg-primary" />
              Evidence času bez chaosu
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.045em] md:text-[clamp(3.6rem,5.8vw,5.8rem)]">
              Více času na práci. Méně času na její zapisování.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-sidebar-foreground/70 md:text-lg">
              Tempo pomáhá freelancerům a týmům evidovat práci, spravovat klienty a mít přehled o projektech na jednom klidném místě.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link to="/register" />}>
                Začít zdarma <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent" render={<a href="#produkt" />}>
                Prozkoumat Tempo
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-sidebar-foreground/50"><span className="size-1.5 rounded-full bg-primary/70" /> Bez platební karty. Připraveno pro každodenní práci.</p>
          </div>

          <div className="relative md:pl-2">
            <div className="relative rotate-1 rounded-2xl border border-sidebar-border/80 bg-background/95 p-2 text-foreground shadow-2xl shadow-black/25 transition-transform duration-500 hover:rotate-0">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 md:p-5">
                <div className="mb-4 flex items-center gap-1.5 border-b border-border/70 pb-3">
                  <span className="size-2 rounded-full bg-destructive/70" />
                  <span className="size-2 rounded-full bg-yellow-400/70" />
                  <span className="size-2 rounded-full bg-primary/80" />
                  <span className="ml-auto rounded-md bg-muted px-2 py-1 font-mono text-[9px] text-muted-foreground">tempo / přehled</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/70 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dnešní přehled</p>
                    <p className="mt-1 text-2xl font-black">6 h 42 min</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock3 className="size-5" /></span>
                </div>
                <div className="mt-4 flex items-end gap-1.5 border-b border-border/70 pb-4" aria-label="Graf odpracovaného času">
                  {[32, 48, 42, 67, 54, 78, 62, 92, 73, 84, 68, 96].map((height, index) => (
                    <span key={index} className={`flex-1 rounded-sm ${index === 11 ? "bg-primary" : "bg-primary/20"}`} style={{ height: `${height / 2}px` }} />
                  ))}
                </div>
                <div className="mt-4 space-y-2.5">
                  {["Vývoj nové landing page", "Synchronizace s týmem", "Administrativa"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5">
                      <span className={index === 0 ? "size-2 rounded-full bg-primary" : "size-2 rounded-full bg-muted-foreground/30"} />
                      <span className="flex-1 text-sm font-medium">{item}</span>
                      <span className="font-mono text-xs text-muted-foreground">{["3:18", "2:05", "1:19"][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-2 rounded-xl border border-sidebar-border/80 bg-sidebar-accent px-4 py-3 text-xs shadow-xl md:-left-6">
              <span className="flex items-center gap-2 font-medium"><Check className="size-4 text-primary" /> Přehled, který dává smysl</span>
            </div>
          </div>
        </div>
      </section>

      <section id="produkt" className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Proč Tempo</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Nástroje, které se přizpůsobí vašemu pracovnímu dni.</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 md:grid-cols-3">
          {[
            { icon: Clock3, title: "Měřte práci přirozeně", text: "Spusťte časovač, doplňte záznam později a mějte jasno v každé hodině." },
            { icon: UsersRound, title: "Klienti na jednom místě", text: "Udržujte klienty a projekty přehledně pohromadě, bez tabulek a hledání." },
            { icon: ReceiptText, title: "Přehled pro rozhodování", text: "Reporty vám ukážou, kam váš čas skutečně odchází a co se vyplatí." },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="bg-background p-6 md:p-8">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <h3 className="mt-6 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pro-koho" className="border-y border-border/70 bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Připraveni začít?</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Dejte svému času lepší systém.</h2>
          </div>
          <Button size="lg" render={<Link to="/register" />}>Vytvořit účet <ArrowRight className="size-4" /></Button>
        </div>
      </section>
    </div>
  );
}
