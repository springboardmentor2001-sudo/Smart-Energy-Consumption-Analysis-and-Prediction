import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: LucideIcon;
  description?: string;
}

export function KPICard({
  title,
  value,
  unit,
  change,
  icon: Icon,
  description,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
    return change > 0 ? (
      <TrendingUp className="w-4 h-4 text-destructive" />
    ) : (
      <TrendingDown className="w-4 h-4 text-green-500" />
    );
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return "text-muted-foreground";
    return change > 0 ? "text-destructive" : "text-green-500";
  };

  return (
    <Card className="overflow-visible" data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-2 flex-wrap">
              <span
                className="text-3xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {typeof value === "number" ? value.toLocaleString() : value}
              </span>
              {unit && (
                <span className="text-lg text-muted-foreground">{unit}</span>
              )}
            </div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm">
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
