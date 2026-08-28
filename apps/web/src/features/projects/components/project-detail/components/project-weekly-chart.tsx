import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type WeekBarPoint = {
  key: string;
  label: string;
  hours: number;
};

type ProjectWeeklyChartProps = {
  weekStartLabel: string;
  weekEndLabel: string;
  data: WeekBarPoint[];
  isLoading: boolean;
  hasError: boolean;
  formatHours: (hours: number) => string;
};

const chartConfig = {
  hours: {
    label: "Hodiny",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ProjectWeeklyChart({
  weekStartLabel,
  weekEndLabel,
  data,
  isLoading,
  hasError,
  formatHours,
}: ProjectWeeklyChartProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Aktivita v aktualnim tydnu</h3>
        <p className="text-xs text-muted-foreground">
          {weekStartLabel} - {weekEndLabel}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Nacitam tydenni data...</p>
      ) : hasError ? (
        <p className="text-sm text-destructive">
          Nepodarilo se nacist vykazy casu.
        </p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="h-64 w-full"
          initialDimension={{ width: 820, height: 256 }}
        >
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={32}
              tickFormatter={(value) => `${value}h`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatHours(Number(value))}
                />
              }
            />
            <Bar
              dataKey="hours"
              fill="var(--color-hours)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
