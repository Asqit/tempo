type ProjectHeaderProps = {
  name: string;
  clientName: string;
};

export function ProjectHeader({ name, clientName }: ProjectHeaderProps) {
  return (
    <header className="rounded-none border border-border/70 bg-card p-3">
      <div className="rounded-none border bg-muted px-3 py-2">
        <p className="text-xs text-muted-foreground">Projekt</p>
        <h2 className="text-2xl font-semibold">{name}</h2>
      </div>
      <p className="mt-2 rounded-none border bg-muted px-3 py-2 text-sm text-muted-foreground">
        Klient: {clientName}
      </p>
    </header>
  );
}
