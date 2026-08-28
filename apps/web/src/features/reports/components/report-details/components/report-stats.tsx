import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/lib/api.d";
import { cn } from "@/lib/utils";
import { calculateAmount, formatMoney } from "@/lib/money";
import { durationMinutesBetween, formatHoursFromMinutes } from "@/lib/time";
import { Clock, Wallet, TrendingUp } from "lucide-react";

interface Props {
  entries: Array<components["schemas"]["TimeEntryRead"]>;
}

export function ReportStats({ entries }: Props) {
  const totalMinutes = entries.reduce(
    (sum, e) => sum + durationMinutesBetween(e.start_time, e.end_time),
    0,
  );
  const totalHours = totalMinutes / 60;
  const billableEntries = entries.filter((e) => e.billable);
  const billableMinutes = billableEntries.reduce(
    (sum, e) => sum + durationMinutesBetween(e.start_time, e.end_time),
    0,
  );

  const totalEarned = billableEntries.reduce(
    (sum, e) =>
      sum +
      (calculateAmount(
        durationMinutesBetween(e.start_time, e.end_time),
        e.client?.hourly_rate,
      ) ?? 0),
    0,
  );

  const stats = [
    {
      label: "Celkem hodin",
      value: formatHoursFromMinutes(totalMinutes, false),
      icon: Clock,
    },
    {
      label: "Zpoplatněné hodiny",
      value: formatHoursFromMinutes(billableMinutes, false),
      icon: TrendingUp,
      sub:
        totalHours > 0
          ? `${Math.round((billableMinutes / totalMinutes) * 100)} % z celku`
          : undefined,
    },
    {
      label: "Celková částka",
      value: formatMoney(totalEarned),
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
