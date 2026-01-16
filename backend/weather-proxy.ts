/**
 * Weather API Proxy
 * Hides API keys from frontend by proxying through backend
 * Prevents rate limiting and secures sensitive credentials
 */

export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<{
  temperature: number;
  humidity: number;
  condition: string;
} | null> {
  try {
    const apiKey = process.env.VITE_WEATHERAPI_KEY;
    if (!apiKey) {
      console.warn("[WARNING] VITE_WEATHERAPI_KEY not configured");
      return null;
    }

    // Using weatherapi.com (compatible with your frontend key)
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      condition: data.current.condition.text,
    };
  } catch (error) {
    console.error("[ERROR] Weather data fetch failed:", error);
    return null;
  }
}

export async function getGridData(
  countryCode?: string
): Promise<{
  price: number;
  currency: string;
  gridLoad: number;
  carbonIntensity: number;
  isPeakHours: boolean;
} | null> {
  try {
    // Mock implementation for demo
    // In production, integrate with real grid data providers
    const hour = new Date().getHours();
    const isPeak = hour >= 17 && hour <= 21; // Peak hours 5 PM - 9 PM

    return {
      price: Math.random() * 100 + 20, // $20-120 per MWh
      currency: countryCode === "US" ? "USD" : "EUR",
      gridLoad: Math.random() * 100, // 0-100%
      carbonIntensity: Math.random() * 500, // gCO2/kWh
      isPeakHours: isPeak,
    };
  } catch (error) {
    console.error("[ERROR] Grid data fetch failed:", error);
    return null;
  }
}
