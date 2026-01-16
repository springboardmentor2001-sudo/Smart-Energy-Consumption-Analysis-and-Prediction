import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import * as genai from "@google/generative-ai";
const { GoogleGenerativeAI } = genai;
import * as fs from "fs";
import * as path from "path";
import { getWeatherData, getGridData } from "./weather-proxy";

// PDF parsing helper using dynamic import for CommonJS interop
async function parsePdf(buffer: Buffer) {
  const mod = await import("pdf-parse");
  const pdfParse = (mod as any).default || mod;
  return pdfParse(buffer);
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Environment variable validation and logging
function initializeEnvironment(): void {
  // Safe logging for GEMINI_API_KEY (never expose full key)
  if (process.env.GEMINI_API_KEY) {
    const keyPreview = process.env.GEMINI_API_KEY.substring(0, 8) + "...";
    console.log(`[ENV] GEMINI_API_KEY loaded successfully (starts with: ${keyPreview})`);
  } else {
    console.warn("[ENV] GEMINI_API_KEY is not configured - AI chatbot will be unavailable");
  }

  // Future model path support
  const modelPath = process.env.MODEL_PATH || "./model/future_energy_model.pkl";
  if (fs.existsSync(modelPath)) {
    console.log(`[ENV] MODEL_PATH configured: ${modelPath} (file exists)`);
  } else {
    console.log(`[ENV] MODEL_PATH: ${modelPath} - Future model not configured yet`);
  }

  // Port configuration
  const port = process.env.PORT || "5000";
  console.log(`[ENV] PORT configured: ${port}`);
}

const predictionRequestSchema = z.object({
  appliances: z.record(z.string(), z.enum(["on", "off"])),
  weather: z
    .object({
      Temperature: z.number().optional(),
      Humidity: z.number().optional(),
      Occupancy: z.number().optional(),
      SquareFootage: z.number().optional(),
      RenewableEnergy: z.number().optional(),
    })
    .optional(),
});

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z
    .object({
      currentPrediction: z
        .object({
          prediction_watts: z.number(),
          prediction_kw: z.number(),
          breakdown: z.record(z.string(), z.number()).optional(),
        })
        .nullable()
        .optional(),
      appliances: z.record(z.string(), z.enum(["on", "off"])).nullable().optional(),
    })
    .nullable()
    .optional(),
});

const wattageConfig: Record<string, number> = {
  HVACUsage: 3500,
  LightingUsage: 150,
};

// Appliance name variations for extraction
const applianceVariations: Record<string, string> = {
  ac: "HVACUsage",
  hvac: "HVACUsage",
  "air conditioner": "HVACUsage",
  light: "LightingUsage",
  lighting: "LightingUsage",
  lamp: "LightingUsage",
};

async function calculatePrediction(
  appliances: Record<string, "on" | "off">,
  weather?: {
    Temperature?: number;
    Humidity?: number;
    Occupancy?: number;
    SquareFootage?: number;
    RenewableEnergy?: number;
  }
) {
  try {
    // Call Python prediction server
    const pythonServerUrl = process.env.PYTHON_PREDICT_URL || "http://localhost:5001/predict";
    
    const response = await fetch(pythonServerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        HVACUsage: appliances.HVACUsage || "off",
        LightingUsage: appliances.LightingUsage || "off",
        Holiday: appliances.Holiday || "off",
        Temperature: weather?.Temperature ?? 22,
        Humidity: weather?.Humidity ?? 50,
        Occupancy: weather?.Occupancy ?? 3,
        SquareFootage: weather?.SquareFootage ?? 1500,
        RenewableEnergy: weather?.RenewableEnergy ?? 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PREDICT] Python server error: ${response.status}`);
      console.error(`[PREDICT] Response body:`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.error(`[PREDICT] Error details:`, errorJson);
      } catch (e) {
        // Response wasn't JSON
      }
      throw new Error(`Python server returned ${response.status}`);
    }

    const result = await response.json();
    
    console.log("[PREDICT] Prediction successful:", {
      watts: result.prediction_watts,
      kw: result.prediction_kw,
    });

    return {
      prediction_watts: result.prediction_watts,
      prediction_kw: result.prediction_kw,
      breakdown: result.breakdown || {},
    };
  } catch (error) {
    console.error("[PREDICT] Failed to call Python server:", error);
    
    // Fallback mock prediction if server is unavailable
    console.log("[PREDICT] Using fallback mock prediction");
    const mockWatts = 500 + (weather?.Occupancy ?? 3) * 100;
    
    return {
      prediction_watts: Math.round(mockWatts * 100) / 100,
      prediction_kw: Math.round((mockWatts / 1000) * 1000) / 1000,
      breakdown: { fallback: mockWatts },
    };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize and validate environment variables on startup
  initializeEnvironment();

  app.post("/api/extract-validate", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let textContent = "";
      if (req.file.mimetype === "application/pdf") {
        try {
          const data = await parsePdf(req.file.buffer);
          textContent = data.text;
        } catch (pdfError) {
          console.error("PDF Parsing error:", pdfError);
          return res.status(400).json({ error: "Could not parse PDF file" });
        }
      } else if (req.file.mimetype === "text/plain") {
        textContent = req.file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      if (!textContent.trim()) {
        return res.status(400).json({ error: "File is empty" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      // Removed apiVersion property to fix LSP error, sticking to default v1 as per latest SDK
      const geminiModel = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });

      const extractionPrompt = `You are a data extraction expert for an energy forecasting platform. 
      Your task is to analyze the provided text and determine if it contains ANY energy-related building information (Temperature, Humidity, Square Footage, or Building Type).

      STRICT EVALUATION RULES:
      1. IRRELEVANT CONTENT: If the text is about general topics (cooking, sports, history, jokes, etc.) and contains NO energy/building context, you MUST return { "status": "INVALID" }. Do NOT use defaults for completely unrelated text.
      2. RELEVANT BUT INCOMPLETE: If the text IS about a building, weather, or energy but is missing some specific values, return { "status": "VALID", "params": { ... } } and use context to infer or use defaults for the MISSING values only.
      
      Look for:
      - Temperature: Usually in Celsius (°C) or Fahrenheit (°F).
      - Humidity: Usually a percentage (%).
      - Square Footage: The size of the building (sq ft).
      - Building Type: Must be either "Residential" or "Commercial".

      Text to analyze:
      "${textContent.substring(0, 10000)}"

      Defaults for MISSING values in RELEVANT documents: 
      - Temperature: 22, Humidity: 50, SquareFootage: 1500, BuildingType: Residential.

      JSON Format:
      {
        "status": "VALID" | "INVALID",
        "params": {
          "Temperature": number,
          "Humidity": number,
          "SquareFootage": number,
          "BuildingType": "Residential" | "Commercial"
        }
      }
      
      If the text is completely unrelated to buildings or energy, return ONLY:
      { "status": "INVALID" }`;

      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        // Using prompt-based context instead of systemInstruction for better compatibility
        const result = await model.generateContent(extractionPrompt);
        const text = result.response.text();
        console.log("[EXTRACT] Gemini raw response:", text);
        const match = text.match(/\{[\s\S]*\}/);
        
        let parsed;
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
            console.log("[EXTRACT] Parsed params:", parsed);
            
            // Check if Gemini explicitly marked it as INVALID
            if (parsed.status === "INVALID") {
              console.log("[EXTRACT] Gemini marked content as INVALID");
              return res.json({ status: "INVALID", message: "The uploaded file does not contain relevant energy forecasting parameters." });
            }
          } catch (e) {
            console.error("[EXTRACT] JSON parse error:", e);
            return res.json({ status: "INVALID" });
          }
        } else {
          console.error("[EXTRACT] No JSON found in response");
          return res.json({ status: "INVALID" });
        }

        // Map extraction results to model parameters
        const forecastUrl = process.env.PYTHON_PREDICT_URL || "http://localhost:5001/forecast";
        
        const forecastRes = await fetch(forecastUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Timestamp: new Date().toISOString(),
            Temperature: Number(parsed.params?.Temperature || 22),
            Humidity: Number(parsed.params?.Humidity || 50),
            SquareFootage: Number(parsed.params?.SquareFootage || 1500),
            BuildingType: parsed.params?.BuildingType || "Residential",
            RenewableEnergy: 0
          }),
        });

        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          console.log("[EXTRACT] Forecast successful:", forecastData);
          return res.json({
            status: "VALID",
            prediction: forecastData.forecast_value,
            params: parsed.params || {
              Temperature: 22,
              Humidity: 50,
              SquareFootage: 1500,
              BuildingType: "Residential"
            }
          });
        } else {
          const errorText = await forecastRes.text();
          console.error("[EXTRACT] Forecast failed:", errorText);
          return res.status(500).json({ error: "Prediction model failed", details: errorText });
        }
      } catch (error) {
        console.error("Extraction error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } catch (error) {
      console.error("Route handler error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.post("/api/extract-speech", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "No text provided" });

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const extractionPrompt = `You are a data extraction expert for an energy forecasting platform. 
      Analyze the text and determine if it contains ANY energy-related building information.

      STRICT EVALUATION RULES:
      1. IRRELEVANT CONTENT: If the text contains NO energy/building context, return { "status": "INVALID" }.
      2. RELEVANT: If the text IS about a building, return { "status": "VALID", "params": { ... } } using defaults for missing values.
      
      Look for:
      - Temperature: Usually in Celsius (°C) or Fahrenheit (°F).
      - Humidity: Usually a percentage (%).
      - Square Footage: The size of the building (sq ft).
      - Building Type: Must be either "Residential" or "Commercial".

      Text to analyze: "${text}"

      Defaults: Temperature: 22, Humidity: 50, SquareFootage: 1500, BuildingType: Residential.

      JSON Format:
      {
        "status": "VALID" | "INVALID",
        "params": {
          "Temperature": number,
          "Humidity": number,
          "SquareFootage": number,
          "BuildingType": "Residential" | "Commercial"
        }
      }
      Return ONLY JSON.`;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(extractionPrompt);
      const responseText = result.response.text();
      const match = responseText.match(/\{[\s\S]*\}/);
      
      if (!match) return res.json({ status: "INVALID", message: "No data found" });
      const parsed = JSON.parse(match[0]);

      if (parsed.status === "INVALID") return res.json({ status: "INVALID" });

      const forecastUrl = process.env.PYTHON_PREDICT_URL || "http://localhost:5001/forecast";
      const forecastRes = await fetch(forecastUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Timestamp: new Date().toISOString(),
          Temperature: Number(parsed.params?.Temperature || 22),
          Humidity: Number(parsed.params?.Humidity || 50),
          SquareFootage: Number(parsed.params?.SquareFootage || 1500),
          BuildingType: parsed.params?.BuildingType || "Residential",
          RenewableEnergy: 0
        }),
      });

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        return res.json({
          status: "VALID",
          prediction: forecastData.forecast_value,
          params: parsed.params
        });
      }
      res.status(500).json({ error: "Model failure" });
    } catch (error) {
      console.error("Speech extraction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      modelPath: process.env.MODEL_PATH || "./model/future_energy_model.pkl",
      modelExists: fs.existsSync(process.env.MODEL_PATH || "./model/future_energy_model.pkl"),
    });
  });

  app.get("/api/features", async (req: Request, res: Response) => {
    try {
      const featuresPath = path.join(process.cwd(), "frontend", "public", "features.json");
      const featuresData = fs.readFileSync(featuresPath, "utf-8");
      res.json(JSON.parse(featuresData));
    } catch (error) {
      console.error("Error loading features:", error);
      res.status(500).json({ error: "Failed to load features configuration" });
    }
  });

  app.post("/api/predict", async (req: Request, res: Response) => {
    try {
      const parsed = predictionRequestSchema.parse(req.body);
      const result = await calculatePrediction(parsed.appliances, parsed.weather);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error("Prediction error:", error);
        res.status(500).json({ error: "Failed to generate prediction" });
      }
    }
  });

  app.post("/api/forecast", async (req: Request, res: Response) => {
    try {
      const pythonServerUrl = process.env.PYTHON_PREDICT_URL || "http://localhost:5001/forecast";
      
      // Strict input mapping to prevent sending forbidden features to the model
      const forecastParams = {
        Timestamp: req.body.Timestamp || new Date().toISOString(),
        Temperature: req.body.Temperature,
        Humidity: req.body.Humidity,
        BuildingType: req.body.BuildingType,
        SquareFootage: req.body.SquareFootage,
        RenewableEnergy: req.body.RenewableEnergy
      };

      const response = await fetch(pythonServerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forecastParams),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FORECAST] Server error: ${response.status}`, errorText);
        throw new Error("Forecast server error");
      }
      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error("Forecast error:", error);
      res.status(500).json({ error: "Failed to generate forecast" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const parsed = chatRequestSchema.parse(req.body);

      if (!process.env.GEMINI_API_KEY) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        const fallbackMessage = "I'm sorry, but I'm currently unable to respond. The AI service is not configured. Please ensure the GEMINI_API_KEY is set up in the environment variables.";
        res.write(`data: ${JSON.stringify({ content: fallbackMessage })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      let contextInfo = "";

      if (parsed.context?.currentPrediction) {
        contextInfo += `\n\nCurrent prediction: ${parsed.context.currentPrediction.prediction_watts}W (${parsed.context.currentPrediction.prediction_kw}kW)`;
        if (parsed.context.currentPrediction.breakdown) {
          contextInfo += "\nBreakdown: " + Object.entries(parsed.context.currentPrediction.breakdown)
            .map(([k, v]) => `${k.replace(/Usage$/, "")}: ${v}W`)
            .join(", ");
        }
      }
      if (parsed.context?.appliances) {
        const activeAppliances = Object.entries(parsed.context.appliances)
          .filter(([, status]) => status === "on")
          .map(([key]) => key.replace(/Usage$/, ""));
        if (activeAppliances.length > 0) {
          contextInfo += `\n\nCurrently active appliances: ${activeAppliances.join(", ")}`;
        }
      }

      const systemPrompt = `You are an energy efficiency expert and a guide for the SmartEnergy website.
      
      IMPORTANT RULES:
      1. ONLY answer questions related to energy saving, power consumption, appliances, or navigating this website (SmartEnergy).
      2. If a user asks about unrelated topics (e.g., politics, celebrities, cooking, sports, general history), politely decline and state that you are only here to help with energy-related queries and website guidance.
      3. Keep your tone professional, helpful, and concise.

      Website Guide Info:
      - "Home": 3D energy visualization and general overview.
      - "Predict": Manually toggle appliances and input weather to see real-time power prediction.
      - "Upload & Predict": Upload files (PDF/TXT) to automatically extract building parameters and get predictions.
      - "Analytics": Visual charts of consumption history.
      - "Chat": This current page where users can get advice.

      Context: ${contextInfo}`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash"
        });

        const response = await model.generateContentStream({
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Message: ${parsed.message}` }] }
          ],
        });

        for await (const chunk of response.stream) {
          const text = chunk.text();
          if (text) {
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }

        res.write("data: [DONE]\n\n");
        res.end();
      } catch (aiError) {
        console.error("AI generation error:", aiError);
        res.write(`data: ${JSON.stringify({ content: "I apologize, but I encountered an error while generating a response. Please try again." })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request", details: error.errors });
      } else {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to process chat message" });
      }
    }
  });

  // Country name to code mapping
  const countryNameToCode: Record<string, string> = {
    India: "IN",
    Japan: "JP",
    China: "CN",
    "United Kingdom": "GB",
    Germany: "DE",
    France: "FR",
    "United States": "US",
    USA: "US",
    Canada: "CA",
    Australia: "AU",
  };

  // Regional grid data configuration
  const regionGridConfig: Record<
    string,
    {
      priceMin: number;
      priceMax: number;
      currency: string;
      carbonMin: number;
      carbonMax: number;
      renewablePercentage: number;
    }
  > = {
    // Asia
    IN: {
      priceMin: 5,
      priceMax: 8.5,
      currency: "₹",
      carbonMin: 350,
      carbonMax: 550,
      renewablePercentage: 20,
    }, // India
    JP: {
      priceMin: 25,
      priceMax: 35,
      currency: "¥",
      carbonMin: 300,
      carbonMax: 450,
      renewablePercentage: 20,
    }, // Japan
    CN: {
      priceMin: 0.08,
      priceMax: 0.15,
      currency: "¥",
      carbonMin: 450,
      carbonMax: 650,
      renewablePercentage: 30,
    }, // China
    // Europe
    GB: {
      priceMin: 0.22,
      priceMax: 0.35,
      currency: "£",
      carbonMin: 150,
      carbonMax: 350,
      renewablePercentage: 45,
    }, // UK
    DE: {
      priceMin: 0.25,
      priceMax: 0.42,
      currency: "€",
      carbonMin: 100,
      carbonMax: 300,
      renewablePercentage: 55,
    }, // Germany
    FR: {
      priceMin: 0.18,
      priceMax: 0.32,
      currency: "€",
      carbonMin: 50,
      carbonMax: 150,
      renewablePercentage: 70,
    }, // France (nuclear-heavy)
    // North America
    US: {
      priceMin: 0.1,
      priceMax: 0.18,
      currency: "$",
      carbonMin: 200,
      carbonMax: 400,
      renewablePercentage: 25,
    }, // USA
    CA: {
      priceMin: 0.12,
      priceMax: 0.2,
      currency: "C$",
      carbonMin: 100,
      carbonMax: 250,
      renewablePercentage: 65,
    }, // Canada
    // Oceania
    AU: {
      priceMin: 0.25,
      priceMax: 0.4,
      currency: "A$",
      carbonMin: 200,
      carbonMax: 450,
      renewablePercentage: 35,
    }, // Australia
  };

  // Live Grid Data Endpoint
  app.get("/api/grid-data", (req: Request, res: Response) => {
    let countryCode = (req.query.country as string) || "IN";
    // Convert country name to code if needed
    if (countryNameToCode[countryCode]) {
      countryCode = countryNameToCode[countryCode];
    }
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const isPeak = hour >= 18 && hour <= 22;

    // Get regional configuration (fallback to India if not found)
    const config = regionGridConfig[countryCode] || regionGridConfig.IN;

    // Regional grid price (varies throughout the day)
    const basePrice = isPeak ? config.priceMax : config.priceMin;
    const variance = Math.sin((hour + minute / 60) / 12) * (basePrice * 0.15);
    const randomFactor = (Math.random() - 0.5) * (basePrice * 0.1);
    const price = Math.max(config.priceMin * 0.8, basePrice + variance + randomFactor);

    // Grid load (High during peak, varies otherwise)
    let gridLoad: "Low" | "Medium" | "High";
    if (isPeak) {
      gridLoad = "High";
    } else if (hour >= 8 && hour <= 12) {
      gridLoad = Math.random() > 0.4 ? "Medium" : "Low";
    } else if (hour >= 14 && hour <= 17) {
      gridLoad = Math.random() > 0.5 ? "Medium" : "Low";
    } else {
      gridLoad = "Low";
    }

    // Regional carbon intensity (based on renewable percentage and time)
    const renewableBonus = (Math.sin((hour - 6) / 12) * (config.carbonMax - config.carbonMin)) / 2;
    const baseCarbon = isPeak ? config.carbonMax : config.carbonMin;
    const carbonIntensity = Math.max(
      config.carbonMin,
      baseCarbon - renewableBonus + (Math.random() - 0.5) * (config.carbonMax * 0.1)
    );

    // Trend data for 24 hours (region-specific)
    const priceTrend = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      price: config.priceMin + Math.sin(i / 4) * (config.priceMax - config.priceMin) * 0.2 + Math.random() * (config.priceMax - config.priceMin) * 0.1,
    }));

    const carbonTrend = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      carbon: config.carbonMin + Math.cos(i / 5) * (config.carbonMax - config.carbonMin) * 0.2 + Math.random() * (config.carbonMax - config.carbonMin) * 0.1,
    }));

    res.json({
      price: Math.round(price * 100) / 100,
      currency: config.currency,
      gridLoad,
      carbonIntensity: Math.round(carbonIntensity),
      isPeakHours: isPeak,
      priceTrend,
      carbonTrend,
      country: countryCode,
      renewablePercentage: config.renewablePercentage,
      timestamp: new Date().toISOString(),
    });
  });

  // ML Model Prediction Endpoint - Routes to Python server
  httpServer.on("request", (req: Request, res: Response) => {
    if (req.url?.startsWith("/api/ml-predict") && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const pythonResponse = await fetch("http://localhost:5001/forecast", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Timestamp: data.Timestamp || new Date().toISOString(),
              Temperature: data.Temperature || 22,
              Humidity: data.Humidity || 50,
              SquareFootage: data.SquareFootage || 1500,
              RenewableEnergy: data.RenewableEnergy || 0,
            }),
          });

          const prediction = await pythonResponse.json();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(prediction));
        } catch (error) {
          console.error("[ERROR] ML prediction failed:", error);
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            error: "ML server unavailable",
            fallback: true,
            forecast_value: 65,
            unit: "kWh",
          }));
        }
      });
    }
  });

  return httpServer;
}
