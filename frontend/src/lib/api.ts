/**
 * API Configuration
 * Centralized API endpoint management for frontend
 * Production-safe with environment variable support
 */

// Determine API base URL - safe for production deployments
const getApiBaseUrl = (): string => {
  // In development, use relative paths (Vite proxy)
  if (import.meta.env.MODE === "development") {
    return "";
  }

  // In production, check for explicit API URL configuration
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl && customUrl.trim()) {
    return customUrl;
  }

  // Default to same origin (only safe if frontend & backend on same domain/service)
  return window.location.origin;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Fetch wrapper with centralized error handling and base URL
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}/api${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status} - ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Helper function for common REST patterns
 */
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  endpoint: string,
  data?: any
): Promise<Response> {
  const url = `${API_BASE_URL}/api${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Prediction endpoints
  predict: "/predict",
  forecast: "/forecast",
  extractValidate: "/extract-validate",
  extractSpeech: "/extract-speech",
  
  // Chat endpoints
  chat: "/chat",
  explain: "/explain",
  
  // Grid data endpoints
  gridData: "/grid-data",
  
  // Health check
  health: "/health",
} as const;
