import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage } from "@shared/models/chat";

interface PredictionHistoryItem {
  id: string;
  timestamp: string;
  request: {
    appliances: Record<string, boolean>;
    [key: string]: any;
  };
  response: {
    prediction_watts: number;
    prediction_kw: number;
    breakdown?: Record<string, number>;
    [key: string]: any;
  };
}

interface PredictionResponse {
  prediction_watts: number;
  prediction_kw: number;
  breakdown?: Record<string, number>;
  confidence?: number;
  [key: string]: any;
}

interface ApplianceState {
  [key: string]: "on" | "off";
}

interface WeatherState {
  Temperature: number;
  Humidity: number;
  Occupancy: number;
  SquareFootage: number;
  RenewableEnergy: number;
}

interface EnergyStore {
  appliances: ApplianceState;
  weather: WeatherState;
  predictionHistory: PredictionHistoryItem[];
  forecastHistory: any[];
  explanations: Record<string, string>;
  chatMessages: ChatMessage[];
  currentPrediction: PredictionResponse | null;
  isLoading: boolean;
  theme: "light" | "dark";
  setAppliance: (key: string, value: "on" | "off") => void;
  setAllAppliances: (appliances: ApplianceState) => void;
  setWeather: (key: keyof WeatherState, value: number) => void;
  setAllWeather: (weather: WeatherState) => void;
  addPrediction: (item: PredictionHistoryItem) => void;
  addForecast: (item: any) => void;
  addExplanation: (id: string, text: string) => void;
  clearHistory: () => void;
  setCurrentPrediction: (prediction: PredictionResponse | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;
  clearChatMessages: () => void;
  setIsLoading: (loading: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

const defaultWeather: WeatherState = {
  Temperature: 22,
  Humidity: 50,
  Occupancy: 3,
  SquareFootage: 1500,
  RenewableEnergy: 0,
};

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set, get) => ({
      appliances: {},
      weather: defaultWeather,
      predictionHistory: [],
      forecastHistory: [],
      explanations: {},
      chatMessages: [],
      currentPrediction: null,
      isLoading: false,
      theme: "dark",
      
      setAppliance: (key, value) =>
        set((state) => ({
          appliances: { ...state.appliances, [key]: value },
        })),
      
      setAllAppliances: (appliances) => set({ appliances }),
      
      setWeather: (key, value) =>
        set((state) => ({
          weather: { ...state.weather, [key]: value },
        })),
      
      setAllWeather: (weather) => set({ weather }),
      
      addPrediction: (item) =>
        set((state) => ({
          predictionHistory: [item, ...state.predictionHistory].slice(0, 10),
        })),
      
      addForecast: (item) =>
        set((state) => ({
          forecastHistory: [item, ...state.forecastHistory].slice(0, 10),
        })),
      
      addExplanation: (id, text) =>
        set((state) => ({
          explanations: { ...state.explanations, [id]: text },
        })),
      
      clearHistory: () => set({ predictionHistory: [], forecastHistory: [], explanations: {} }),
      
      setCurrentPrediction: (prediction) => set({ currentPrediction: prediction }),
      
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      
      updateLastChatMessage: (content) =>
        set((state) => {
          const messages = [...state.chatMessages];
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            };
          }
          return { chatMessages: messages };
        }),
      
      clearChatMessages: () => set({ chatMessages: [] }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setTheme: (theme) => {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme });
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme: newTheme });
      },
    }),
    {
      name: "smartenergy-storage",
      partialize: (state) => ({
        predictionHistory: state.predictionHistory,
        forecastHistory: state.forecastHistory,
        theme: state.theme,
        weather: state.weather,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    }
  )
);
