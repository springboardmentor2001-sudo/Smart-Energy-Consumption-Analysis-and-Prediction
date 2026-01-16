import { useState } from "react";
import { useEnergyStore } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Thermometer, Droplets, Ruler, Building2, Zap, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Forecast() {
  const { toast } = useToast();
  const { addForecast } = useEnergyStore();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("12:00");
  const [temp, setTemp] = useState("22");
  const [humidity, setHumidity] = useState("50");
  const [sqft, setSqft] = useState("1500");
  const [buildingType, setBuildingType] = useState("Residential");

  const forecastMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/forecast", data);
      return res.json();
    },
    onSuccess: (data, variables) => {
      addForecast({
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        forecastTimestamp: variables.Timestamp,
        response: data,
        request: variables
      });
      toast({
        title: "Forecast Generated",
        description: `Predicted energy: ${data.forecast_value} ${data.unit}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate forecast. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleForecast = () => {
    if (!date) {
      toast({
        title: "Date Required",
        description: "Please select a forecast date.",
        variant: "destructive",
      });
      return;
    }

    const timestamp = new Date(date);
    const [hours, minutes] = time.split(":");
    timestamp.setHours(parseInt(hours), parseInt(minutes));

    forecastMutation.mutate({
      Timestamp: timestamp.toISOString(),
      Temperature: parseFloat(temp),
      Humidity: parseFloat(humidity),
      BuildingType: buildingType,
      SquareFootage: parseFloat(sqft),
      RenewableEnergy: 0, // Default for now
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto" data-testid="page-forecast">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Energy Consumption Forecast</h1>
          <p className="text-muted-foreground">
            Plan ahead with AI-powered forecasting for your future energy needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Forecast Parameters</CardTitle>
              <CardDescription>Select date, time and environmental factors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Forecast Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      data-testid="button-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time of Day</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    data-testid="input-forecast-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temp">Temp (°C)</Label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="temp"
                      type="number"
                      className="pl-9"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      data-testid="input-forecast-temp"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="humidity"
                      type="number"
                      className="pl-9"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      data-testid="input-forecast-humidity"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Building Type</Label>
                <Select value={buildingType} onValueChange={setBuildingType}>
                  <SelectTrigger data-testid="select-building-type">
                    <Building2 className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sqft">Square Footage</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="sqft"
                    type="number"
                    className="pl-9"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    data-testid="input-forecast-sqft"
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleForecast}
                disabled={forecastMutation.isPending}
                data-testid="button-generate-forecast"
              >
                {forecastMutation.isPending ? "Calculating..." : "Generate Forecast"}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Forecast Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {forecastMutation.data ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Predicted Consumption</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-primary" data-testid="text-forecast-value">
                          {forecastMutation.data.forecast_value}
                        </span>
                        <span className="text-xl font-medium">{forecastMutation.data.unit}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        For {date ? format(date, "PPP") : ""} at {time}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Confidence Band</p>
                        <div className="p-3 bg-card rounded-md border border-border">
                          <p className="text-sm">
                            Expected range: <span className="font-semibold">{forecastMutation.data.confidence_range[0]} - {forecastMutation.data.confidence_range[1]} {forecastMutation.data.unit}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-card rounded-md border border-border">
                          <p className="text-xs text-muted-foreground mb-1">vs Last Week</p>
                          <div className="flex items-center gap-1 text-red-500 font-bold">
                            <TrendingUp className="w-4 h-4" />
                            {forecastMutation.data.comparison_last_week}
                          </div>
                        </div>
                        <div className="p-4 bg-card rounded-md border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Trend</p>
                          <div className="flex items-center gap-1 text-primary font-bold">
                            <TrendingUp className="w-4 h-4" />
                            Above Normal
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mb-4 opacity-20" />
                    <p>Enter parameters and click "Generate Forecast" to see the prediction.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Insights</CardTitle>
                <CardDescription>AI-driven explanation of the predicted values.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {forecastMutation.data 
                        ? `The model predicts higher than usual consumption due to the selected time (${time}) and building context. Historical data shows consistent demand spikes during this period for ${buildingType} buildings of this size.`
                        : "Insights will appear after a forecast is generated."
                      }
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/chatbot">Ask AI Assistant</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
