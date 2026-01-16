import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { useEnergyStore } from "@/lib/store";
import { Zap, TrendingDown, Calendar, Leaf, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(173, 80%, 45%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 83%, 58%)",
  "hsl(47, 96%, 53%)",
  "hsl(12, 95%, 60%)",
  "hsl(280, 65%, 55%)",
  "hsl(160, 70%, 45%)",
  "hsl(35, 90%, 55%)",
];

export default function Dashboard() {
  const { predictionHistory, forecastHistory, currentPrediction } = useEnergyStore();

  const stats = useMemo(() => {
    const combinedHistory = [...predictionHistory, ...forecastHistory];
    if (combinedHistory.length === 0) {
      return {
        lastPrediction: 0,
        averagePower: 0,
        monthlyEstimate: 0,
        totalPredictions: 0,
        trend: 0,
      };
    }

    const lastItem = combinedHistory[0];
    const lastPrediction = lastItem.response.prediction_watts || lastItem.response.forecast_value || 0;
    
    const totalPower = combinedHistory.reduce((sum, item) => {
      const val = item.response.prediction_watts || item.response.forecast_value || 0;
      return sum + val;
    }, 0);
    
    const averagePower = totalPower / combinedHistory.length;
    const monthlyEstimate = (averagePower * 24 * 30) / 1000;

    let trend = 0;
    if (combinedHistory.length >= 2) {
      const recent = combinedHistory[0].response.prediction_watts || combinedHistory[0].response.forecast_value;
      const previous = combinedHistory[1].response.prediction_watts || combinedHistory[1].response.forecast_value;
      trend = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    }

    return {
      lastPrediction,
      averagePower,
      monthlyEstimate,
      totalPredictions: combinedHistory.length,
      trend,
    };
  }, [predictionHistory, forecastHistory]);

  const timeSeriesData = useMemo(() => {
    const combined = [
      ...predictionHistory.map(p => ({ ...p, type: 'Historical' })),
      ...forecastHistory.map(f => ({ ...f, type: 'Forecast' }))
    ].sort((a, b) => a.timestamp - b.timestamp);

    return combined.map((item, index) => ({
      index: index + 1,
      time: new Date(item.forecastTimestamp || item.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: item.response.prediction_watts || item.response.forecast_value,
      type: item.type
    }));
  }, [predictionHistory, forecastHistory]);

  const breakdownData = useMemo(() => {
    if (!currentPrediction?.breakdown) return [];

    return Object.entries(currentPrediction.breakdown)
      .filter(([, value]) => (value as number) > 0)
      .map(([key, value]) => ({
        name: key.replace(/__bin$/, "").replace(/Usage$/, ""),
        value: Math.abs((value as number)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentPrediction]);

  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="page-dashboard">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Energy Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your energy consumption patterns and identify optimization opportunities.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Last Prediction"
            value={stats.lastPrediction.toFixed(0)}
            unit="W"
            change={stats.trend}
            icon={Zap}
          />
          <KPICard
            title="Average Power"
            value={stats.averagePower.toFixed(0)}
            unit="W"
            icon={TrendingDown}
            description="Across all predictions"
          />
          <KPICard
            title="Monthly Estimate"
            value={stats.monthlyEstimate.toFixed(1)}
            unit="kWh"
            icon={Calendar}
            description="Based on average usage"
          />
          <KPICard
            title="Total Predictions"
            value={stats.totalPredictions}
            icon={Leaf}
            description="Stored in history"
          />
        </div>

        {predictionHistory.length === 0 && forecastHistory.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Generate a Future Forecast to see your energy consumption trends and analytics here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Power Usage Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]" data-testid="chart-time-series">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value} kWh`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Energy Usage"
                        stroke="hsl(173, 80%, 45%)"
                        strokeWidth={2}
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          if (payload.type === 'Forecast') {
                            return <Zap key={props.key} x={cx - 6} y={cy - 6} width={12} height={12} className="text-primary" />;
                          }
                          return <circle key={props.key} cx={cx} cy={cy} r={4} fill="hsl(173, 80%, 45%)" />;
                        }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appliance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]" data-testid="chart-pie">
                  {breakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {breakdownData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${value.toFixed(0)}W`, "Power"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: "12px" }}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Make a prediction to see the breakdown
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {(predictionHistory.length > 0 || forecastHistory.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">History & Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-history">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Target Time
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Value
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Context
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...predictionHistory.map(p => ({ ...p, type: 'Historical' })), 
                      ...forecastHistory.map(f => ({ ...f, type: 'Forecast' }))]
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((item) => {
                        const activeAppliances = item.request.appliances 
                          ? Object.entries(item.request.appliances)
                              .filter(([, status]) => status === "on")
                              .map(([key]) => key.replace(/Usage$/, ""))
                          : [];
                        
                        const displayValue = item.response.prediction_watts 
                          ? `${item.response.prediction_watts.toFixed(0)}W`
                          : `${item.response.forecast_value} kWh`;

                        return (
                          <tr key={item.id} className="border-b border-border/50 last:border-0">
                            <td className="py-3 px-4">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                                item.type === 'Forecast' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(item.forecastTimestamp || item.timestamp).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3 px-4 font-bold">
                              {displayValue}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {item.type === 'Forecast' 
                                ? `${item.request.BuildingType}, ${item.request.SquareFootage} sqft`
                                : activeAppliances.length > 0 ? activeAppliances.join(", ") : "None"}
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
