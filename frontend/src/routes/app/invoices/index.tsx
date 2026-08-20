import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/invoices/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <main className="animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
        {/* Invoice content will be animated when added */}
        <div className="text-center text-muted-foreground py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          Zde budou faktury
        </div>
      </main>
    </div>
  );
}
