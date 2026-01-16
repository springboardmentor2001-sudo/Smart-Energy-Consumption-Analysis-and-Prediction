import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import path from "path";
import { setupStatic } from "./static";
import { PythonServerManager } from "./python-manager";

// Validate required environment variables at startup
function validateEnvironment(): void {
  const required = ["GEMINI_API_KEY"];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`[ERROR] Missing required environment variables: ${missing.join(", ")}`);
    console.error("[ERROR] Startup failed. Please configure all required env vars.");
    // Non-blocking: app continues but some features unavailable
  }
}

const app = express();
const httpServer = createServer(app);

// Initialize Python server manager
const pythonServerManager = new PythonServerManager({
  scriptPath: "./predict_server.py",
  pythonExecutable: process.platform === "win32" ? "python" : "python3",
  port: 5001,
  maxRetries: 3,
  retryDelay: 2000,
  healthCheckInterval: 10000,
});

// CORS Configuration
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate environment at startup
  validateEnvironment();

  await registerRoutes(httpServer, app);

  // Start Python ML Server (Production: on Render, Dev: optional)
  const isPythonAvailable = !process.platform.startsWith("win");
  
  if (isPythonAvailable || process.platform === "win32") {
    const pythonStarted = await pythonServerManager.start();
    if (pythonStarted) {
      log("Python ML server initialized and healthy", "python");
    } else {
      console.warn("[WARNING] Python ML server unavailable - predictions will use fallback logic");
    }
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    await setupStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";
  
  httpServer.listen(
    {
      port,
      host,
    },
    () => {
      log(`serving on http://${host}:${port}`);
      console.log(`[SUCCESS] Server started successfully on ${host}:${port}`);
      console.log(`[INFO] Node environment: ${process.env.NODE_ENV || "development"}`);
    },
  );

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("[SHUTDOWN] SIGTERM received, closing server...");
    pythonServerManager.stop();
    httpServer.close(() => {
      console.log("[SHUTDOWN] Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("[SHUTDOWN] SIGINT received, closing server...");
    pythonServerManager.stop();
    httpServer.close(() => {
      console.log("[SHUTDOWN] Server closed");
      process.exit(0);
    });
  });
})();
