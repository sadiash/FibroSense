import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
}

export function SummaryCard({ title, value, unit, trend }: SummaryCardProps) {
  const trendIndicator =
    trend === "up" ? " ↑" : trend === "down" ? " ↓" : trend === "stable" ? " →" : "";
  const trendColor =
    trend === "up"
      ? "text-red-500"
      : trend === "down"
        ? "text-green-500"
        : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
          {trend && (
            <span className={`text-sm font-medium ${trendColor}`}>
              {trendIndicator}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
