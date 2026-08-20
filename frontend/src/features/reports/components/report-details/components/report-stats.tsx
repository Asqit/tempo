import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/lib/api.d";
import { cn } from "@/lib/utils";
import { Clock, Wallet, TrendingUp } from "lucide-react";

interface Props {
  entries: Array<components["schemas"]["TimeEntryRead"]>;
}

function durationHours(entry: components["schemas"]["TimeEntryRead"]): number {
  if (!entry.end_time) return 0;
  const ms =
    new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
  return ms / 1000 / 60 / 60;
}

function formatHours(hours: number): string {
  return hours.toFixed(1).replace(/\.0$/, "") + "h";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ReportStats({ entries }: Props) {
  const totalHours = entries.reduce((sum, e) => sum + durationHours(e), 0);
  const billableEntries = entries.filter((e) => e.billable);
  const billableHours = billableEntries.reduce(
    (sum, e) => sum + durationHours(e),
    0,
  );

  const totalEarned = billableEntries.reduce(
    (sum, e) => sum + durationHours(e) * Number(e.client?.hourly_rate ?? 0),
    0,
  );

  const stats = [
    {
      label: "Total hours",
      value: formatHours(totalHours),
      icon: Clock,
    },
    {
      label: "Billable hours",
      value: formatHours(billableHours),
      icon: TrendingUp,
      sub:
        totalHours > 0
          ? `${Math.round((billableHours / totalHours) * 100)}% of total`
          : undefined,
    },
    {
      label: "Total earned",
      value: formatCurrency(totalEarned),
      icon: Wallet,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3">
      {stats.map((stat, idx) => (
        <Card
          key={stat.label}
          className={cn(
            "rounded-none",
            idx % 2 == 0 && "bg-dotted",
            idx == 0 && "rounded-t md:rounded-tr-none md:rounded-l",
            idx == 2 && "rounded-b md:rounded-bl-none md:rounded-r",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium ">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 " />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black tabular-nums">{stat.value}</div>
            {stat.sub && <p className="text-xs  mt-1">{stat.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
