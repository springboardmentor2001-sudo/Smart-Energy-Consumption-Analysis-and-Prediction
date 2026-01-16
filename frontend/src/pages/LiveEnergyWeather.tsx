import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  AlertCircle,
  Loader2,
  Zap,
  Leaf,
  TrendingUp,
  Activity,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

interface GridData {
  price: number;
  currency?: string;
  gridLoad: "Low" | "Medium" | "High";
  carbonIntensity: number;
  isPeakHours: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  priority: "high" | "medium" | "low";
}

interface CityOption {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const generateGridData = (): GridData => {
  const hour = new Date().getHours();
  const isPeak = hour >= 18 && hour <= 22;

  return {
    price: isPeak ? 8.5 + Math.random() * 2 : 5.5 + Math.random() * 2,
    gridLoad: isPeak ? "High" : Math.random() > 0.5 ? "Medium" : "Low",
    carbonIntensity: 350 + Math.random() * 200,
    isPeakHours: isPeak,
  };
};

const generatePriceTrendData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    price: 5 + Math.sin(i / 4) * 3 + Math.random() * 1.5,
  }));
};

const generateCarbonTrendData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    carbon: 300 + Math.cos(i / 5) * 100 + Math.random() * 50,
  }));
};

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes("rain")) return <CloudRain className="w-16 h-16 text-blue-400" />;
  if (lower.includes("cloud")) return <Cloud className="w-16 h-16 text-gray-400" />;
  if (lower.includes("clear") || lower.includes("sunny"))
    return <Sun className="w-16 h-16 text-yellow-400" />;
  return <Cloud className="w-16 h-16 text-gray-400" />;
};

const generateRecommendations = (weather: WeatherData, grid: GridData): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const temp = weather.temperature;

  // Temperature-based recommendations
  if (temp > 30) {
    recommendations.push({
      id: "ac-warning",
      title: "High Temperature Detected",
      description:
        "AC load is expected to increase significantly. Schedule heavy appliances earlier.",
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      priority: "high",
    });
  }

  // Grid load recommendations
  if (grid.gridLoad === "High") {
    recommendations.push({
      id: "peak-avoidance",
      title: "Avoid Peak Hours Load",
      description: "Grid is at high load. Avoid running washing machine or dishwasher now.",
      icon: <TrendingUp className="w-5 h-5 text-red-500" />,
      priority: "high",
    });
  } else if (grid.gridLoad === "Low") {
    recommendations.push({
      id: "low-load-usage",
      title: "Best Time for Heavy Appliances",
      description: "Grid load is low. Run your washing machine, dryer, or charge devices now.",
      icon: <Activity className="w-5 h-5 text-green-500" />,
      priority: "high",
    });
  }

  // Carbon intensity recommendations
  if (grid.carbonIntensity < 300) {
    recommendations.push({
      id: "clean-energy",
      title: "Energy is Cleaner Now",
      description: "Grid carbon intensity is low. Great time to charge devices and run appliances.",
      icon: <Leaf className="w-5 h-5 text-green-500" />,
      priority: "medium",
    });
  }

  // Price-based recommendations
  if (grid.price < 6) {
    recommendations.push({
      id: "cheap-energy",
      title: "Low Electricity Price",
      description: `Energy costs just ₹${grid.price.toFixed(2)}/kWh. Optimal time for energy usage.`,
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      priority: "medium",
    });
  }

  // Weather-based recommendations
  if (weather.condition.toLowerCase().includes("rain")) {
    recommendations.push({
      id: "rain-water",
      title: "Rainy Day Advantage",
      description: "Lower outside temperature reduces AC load. Consider adjusting thermostat.",
      icon: <Cloud className="w-5 h-5 text-blue-500" />,
      priority: "low",
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

export default function LiveEnergyWeather() {
  const [city, setCity] = useState("London");
  const [searchInput, setSearchInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gridData, setGridData] = useState<GridData>(generateGridData());
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_WEATHERAPI_KEY;

  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Fetch live grid data from backend (location-aware)
  const fetchGridData = async (countryCode?: string) => {
    try {
      const { API_BASE_URL } = await import("@/lib/api");
      const endpoint = countryCode ? `/api/grid-data?country=${countryCode}` : "/api/grid-data";
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGridData({
          price: data.price,
          currency: data.currency,
          gridLoad: data.gridLoad,
          carbonIntensity: data.carbonIntensity,
          isPeakHours: data.isPeakHours,
        });
        console.log("📊 Live grid data updated for", countryCode || "default:", {
          price: data.price,
          currency: data.currency,
          load: data.gridLoad,
          carbon: data.carbonIntensity,
          renewable: data.renewablePercentage,
        });
      }
    } catch (err) {
      console.error("Error fetching grid data:", err);
    }
  };

  // Update grid data when weather/location changes
  useEffect(() => {
    if (weather) {
      fetchGridData(weather.country);
    } else {
      // Initial load with default country
      fetchGridData();
    }
  }, [weather?.country]);

  useEffect(() => {
    // Update grid data every 30 seconds
    const gridInterval = setInterval(() => {
      if (weather) {
        fetchGridData(weather.country);
      } else {
        fetchGridData();
      }
    }, 30000);
    return () => clearInterval(gridInterval);
  }, [weather?.country]);

  // Handle clicks outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCitySuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setCitySuggestions([]);
      return;
    }

    try {
      if (!apiKey) {
        // Mock suggestions if no API key
        const mockCities = [
          { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
          { name: "Los Angeles", country: "US", lat: 34.0522, lon: -118.2437 },
          { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
          { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
          { name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
        ];
        const filtered = mockCities.filter((c) =>
          c.name.toLowerCase().startsWith(query.toLowerCase())
        );
        setCitySuggestions(filtered);
        return;
      }

      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?q=${encodedQuery}&key=${apiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        const cities = (data || []).map(
          (item: {
            name: string;
            country: string;
            lat: number;
            lon: number;
          }) => ({
            name: item.name,
            country: item.country,
            lat: item.lat,
            lon: item.lon,
          })
        );
        setCitySuggestions(cities);
      }
    } catch (err) {
      console.error("Error fetching city suggestions:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSuggestions(true);
    fetchCitySuggestions(value);
  };

  const selectCity = (selectedCity: CityOption) => {
    setSearchInput("");
    setShowSuggestions(false);
    fetchWeather(selectedCity.name);
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError("");
    try {
      const trimmedCity = cityName.trim();

      // Debug: Log API key availability and input
      console.log("🔍 DEBUG: Fetching weather for city:", trimmedCity);
      console.log("🔑 DEBUG: API Key available:", !!apiKey);
      if (!apiKey) {
        console.warn("⚠️ WARNING: VITE_WEATHERAPI_KEY environment variable is not set");
      }

      if (!apiKey) {
        // Fallback mock data if API key is not set
        console.warn("⚠️ DEBUG: No API key found, using mock data");
        setWeather({
          city: trimmedCity,
          country: "Mock",
          temperature: 22 + Math.random() * 10,
          feelsLike: 21 + Math.random() * 10,
          humidity: 60 + Math.random() * 20,
          windSpeed: 5 + Math.random() * 10,
          condition: ["Sunny", "Cloudy", "Rainy"][Math.floor(Math.random() * 3)],
          icon: "01d",
        });
        return;
      }

      // URL-encode city name to support cities with spaces and special characters
      const encodedCity = encodeURIComponent(trimmedCity);
      const url = `https://api.weatherapi.com/v1/current.json?q=${encodedCity}&key=${apiKey}&aqi=no`;

      console.log("🌐 DEBUG: Making API request...");

      const response = await fetch(url);

      console.log("📊 DEBUG: Response status:", response.status);

      // Handle different error codes with specific messages
      if (response.status === 401) {
        throw new Error(
          "Weather service authentication failed. Your API key is invalid or expired. Please check your WeatherAPI key configuration and try again."
        );
      }

      if (response.status === 400) {
        throw new Error(`City "${trimmedCity}" not found. Please verify the spelling and try again.`);
      }

      if (response.status === 403) {
        throw new Error(
          "Access denied to weather service. Your API key may not have permission for this request. Please check your WeatherAPI account settings."
        );
      }

      if (response.status === 429) {
        throw new Error("Weather API rate limit exceeded. Please wait a moment and try again.");
      }

      if (!response.ok) {
        const responseText = await response.text();
        console.error("API Error Response:", responseText);
        throw new Error(
          `Weather service error (${response.status}). Please try again in a moment.`
        );
      }

      const data = await response.json();
      console.log("✅ DEBUG: Weather data received successfully:", {
        city: data.location.name,
        country: data.location.country,
        temp: data.current.temp_c,
      });

      setWeather({
        city: data.location.name,
        country: data.location.country,
        temperature: Math.round(data.current.temp_c),
        feelsLike: Math.round(data.current.feelslike_c),
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_kph * 0.277778 * 10) / 10, // Convert kph to m/s
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data";
      console.error("❌ DEBUG: Weather fetch error:", errorMessage);
      setError(errorMessage);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
      setSearchInput("");
      setShowSuggestions(false);
    }
  };

  const recommendations = useMemo(() => {
    if (!weather) return [];
    return generateRecommendations(weather, gridData);
  }, [weather, gridData]);

  const priceTrendData = useMemo(() => generatePriceTrendData(), []);
  const carbonTrendData = useMemo(() => generateCarbonTrendData(), []);

  const getGridLoadColor = (load: string) => {
    switch (load) {
      case "Low":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
      case "High":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-background via-background to-background/80">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        {/* Header */}
        <div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Live Energy & Weather Insights
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time grid intelligence, weather analysis, and smart energy recommendations
          </p>
        </div>

        {/* City Search */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Any City
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative" ref={suggestionsRef}>
                  <Input
                    placeholder="Start typing city name (e.g., London, Tokyo, New York)..."
                    value={searchInput}
                    onChange={handleInputChange}
                    onFocus={() => searchInput && setShowSuggestions(true)}
                    className="flex-1"
                    data-testid="input-city-search"
                  />

                  {/* City Suggestions Dropdown */}
                  {showSuggestions && citySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50">
                      {citySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectCity(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md transition-colors"
                          data-testid={`suggestion-city-${suggestion.name}`}
                        >
                          <div className="font-medium">{suggestion.name}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.country}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading} data-testid="button-search-city">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Weather Section */}
        {weather && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Weather Impact on Energy Consumption</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weather Card */}
              <Card className="border-primary/20 hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle data-testid="text-weather-location" className="text-lg">
                        {weather.city}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Live weather data influencing energy demand
                      </p>
                    </div>
                    <div className="flex-shrink-0">{getWeatherIcon(weather.condition)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Temperature Section */}
                  <div className="space-y-2">
                    <div
                      className="text-4xl md:text-5xl font-bold text-primary"
                      data-testid="text-temperature"
                    >
                      {weather.temperature.toFixed(1)}°C
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid="text-feels-like">
                      Feels like{" "}
                      <span className="font-medium text-foreground">
                        {weather.feelsLike.toFixed(1)}°C
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-muted/40 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Droplets className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">Humidity</span>
                      </div>
                      <div
                        className="text-xl font-semibold text-foreground"
                        data-testid="text-humidity"
                      >
                        {Math.round(weather.humidity)}%
                      </div>
                    </div>
                    <div className="bg-muted/40 rounded-md p-3 border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Wind className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">Wind Speed</span>
                      </div>
                      <div
                        className="text-xl font-semibold text-foreground"
                        data-testid="text-wind-speed"
                      >
                        {weather.windSpeed.toFixed(1)} m/s
                      </div>
                    </div>
                  </div>

                  {/* Weather Condition Badge */}
                  <div className="pt-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary hover:bg-primary/30"
                      data-testid="text-weather-condition"
                    >
                      {weather.condition}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Grid Data Card */}
              <Card className="border-accent/20 hover-elevate">
                <CardHeader>
                  <CardTitle>Live Grid Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Electricity Price</span>
                      <span className="text-3xl font-bold" data-testid="text-grid-price">
                        {gridData.currency || "₹"}{gridData.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">/kWh</div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Grid Load Status</span>
                      <Badge
                        className={`${getGridLoadColor(gridData.gridLoad)}`}
                        data-testid="badge-grid-load"
                      >
                        {gridData.gridLoad}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Carbon Intensity</span>
                      <span className="text-2xl font-bold" data-testid="text-carbon-intensity">
                        {Math.round(gridData.carbonIntensity)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">gCO₂/kWh</div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Badge
                      variant={gridData.isPeakHours ? "destructive" : "secondary"}
                      data-testid="badge-peak-hours"
                    >
                      {gridData.isPeakHours ? "Peak Hours" : "Off-Peak Hours"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Smart Energy Recommendations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={`border-l-4 hover-elevate ${
                    rec.priority === "high"
                      ? "border-l-red-500 bg-red-500/5"
                      : rec.priority === "medium"
                        ? "border-l-yellow-500 bg-yellow-500/5"
                        : "border-l-blue-500 bg-blue-500/5"
                  }`}
                  data-testid={`card-recommendation-${rec.id}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div>{rec.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Price Trend */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Electricity Price Trend (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--muted))",
                      border: "1px solid hsl(var(--border))",
                    }}
                    formatter={(value) => `₹${(value as number).toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Carbon Intensity Trend */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle>Carbon Intensity Trend (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carbonTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--muted))",
                      border: "1px solid hsl(var(--border))",
                    }}
                    formatter={(value) => `${Math.round(value as number)} gCO₂/kWh`}
                  />
                  <Bar dataKey="carbon" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Educational Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Why Live Data Matters in Smart Energy Systems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  Weather Impact
                </h3>
                <p className="text-sm text-muted-foreground">
                  Temperature directly affects AC/heating load. Real-time weather data helps predict
                  demand spikes and optimize energy distribution across the grid.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  Grid Load Impact
                </h3>
                <p className="text-sm text-muted-foreground">
                  High grid load increases prices and strains infrastructure. Shifting heavy
                  appliance usage to low-load periods saves money and improves grid stability.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Carbon Intensity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Energy sources vary throughout the day. Using energy during low carbon intensity
                  hours reduces environmental impact significantly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Integration Notice */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">Future-Ready Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This dashboard is designed to integrate with ML prediction models, IoT device readings,
              and additional grid APIs seamlessly. The modular component structure allows for easy
              expansion without modifying existing UI logic.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
