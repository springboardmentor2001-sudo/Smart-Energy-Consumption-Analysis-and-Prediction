import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEnergyStore } from "@/lib/store";
import { Zap, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function PredictionResult() {
  const { currentPrediction, predictionHistory } = useEnergyStore();
  const resultRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (currentPrediction && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
      );

      if (numberRef.current) {
        gsap.fromTo(
          numberRef.current,
          { textContent: "0" },
          {
            textContent: (currentPrediction.prediction_watts || 0).toFixed(0),
            duration: 1,
            snap: { textContent: 1 },
            ease: "power2.out",
          }
        );
      }
    }
  }, [currentPrediction]);

  if (!currentPrediction) return null;

  const previousPrediction = predictionHistory[1];
  const trend = previousPrediction
    ? (currentPrediction.prediction_watts || 0) - (previousPrediction.response.prediction_watts || 0)
    : 0;
  const trendPercent = previousPrediction
    ? (((trend) / (previousPrediction.response.prediction_watts || 1)) * 100).toFixed(1)
    : null;

  return (
    <Card
      ref={resultRef}
      className="border-primary/30 bg-gradient-to-br from-card to-primary/5"
      data-testid="prediction-result"
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold">Predicted Power Usage</CardTitle>
          {trendPercent && (
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <span
                className={`text-sm ${
                  trend > 0 ? "text-destructive" : "text-green-500"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trendPercent}% vs last prediction
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span
              ref={numberRef}
              className="text-5xl md:text-6xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
              data-testid="text-watts"
            >
              {(currentPrediction.prediction_watts || 0).toFixed(0)}
            </span>
            <span className="text-xl text-muted-foreground">W</span>
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {(currentPrediction.prediction_kw || 0).toFixed(2)} kW
          </Badge>
        </div>

        {currentPrediction.breakdown && Object.keys(currentPrediction.breakdown).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Power Breakdown
            </h4>
            <div className="space-y-2">
              {Object.entries(currentPrediction.breakdown || {})
                .sort(([, a], [, b]) => Math.abs((b as number)) - Math.abs((a as number)))
                .map(([key, value]) => {
                  const total = Object.values(currentPrediction.breakdown || {}).reduce(
                    (sum: number, v) => sum + Math.abs((v as number)),
                    0
                  );
                  const percentage = (total as number) > 0 ? (Math.abs((value as number)) / (total as number)) * 100 : 0;
                  const isNegative = (value as number) < 0;

                  return (
                    <div key={key} className="space-y-1" data-testid={`breakdown-${key}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {key.replace(/__bin$/, "").replace(/Usage$/, "")}
                        </span>
                        <span className={isNegative ? "text-green-500" : ""}>
                          {isNegative ? "" : "+"}
                          {(value as number).toFixed(0)}W
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isNegative ? "bg-green-500" : "bg-primary"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
