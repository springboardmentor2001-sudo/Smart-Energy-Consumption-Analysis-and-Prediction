import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEnergyStore } from "@/lib/store";
import { History, Trash2 } from "lucide-react";

export function PredictionHistory() {
  const { predictionHistory, clearHistory } = useEnergyStore();

  if (predictionHistory.length === 0) {
    return (
      <Card className="border-dashed" data-testid="prediction-history-empty">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <History className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            No predictions yet. Make your first prediction to see history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="prediction-history">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Recent Predictions</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-muted-foreground"
          data-testid="button-clear-history"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {predictionHistory.map((item, index) => {
              const date = new Date(item.timestamp);
              const timeStr = date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
              });

              const activeAppliances = Object.entries(item.request.appliances)
                .filter(([, status]) => status === true)
                .map(([key]) => key.replace(/__bin$/, "").replace(/Usage$/, ""));

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
                  }`}
                  data-testid={`history-item-${index}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">
                        {item.response.prediction_watts.toFixed(0)}W
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({item.response.prediction_kw.toFixed(2)} kW)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {activeAppliances.length > 0
                        ? activeAppliances.slice(0, 3).join(", ") +
                          (activeAppliances.length > 3
                            ? ` +${activeAppliances.length - 3} more`
                            : "")
                        : "No appliances active"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground flex-shrink-0 ml-4">
                    <div>{timeStr}</div>
                    <div className="text-xs">{dateStr}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
