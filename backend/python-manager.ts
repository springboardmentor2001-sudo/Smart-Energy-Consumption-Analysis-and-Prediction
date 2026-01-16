/**
 * Python ML Server Manager
 * Starts and monitors the Python Flask server
 * Handles startup, health checks, and automatic restarts
 */

import { spawn } from "node:child_process";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { log } from "./index";

const execAsync = promisify(exec);

interface PythonServerConfig {
  scriptPath: string;
  pythonExecutable: string;
  port: number;
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
}

export class PythonServerManager {
  private process: any = null;
  private isHealthy: boolean = false;
  private healthCheckInterval: any = null;
  private config: PythonServerConfig;

  constructor(config: Partial<PythonServerConfig> = {}) {
    this.config = {
      scriptPath: "./predict_server.py",
      pythonExecutable: "python3",
      port: 5001,
      maxRetries: 3,
      retryDelay: 2000,
      healthCheckInterval: 10000,
      ...config,
    };
  }

  /**
   * Check if Python is available on system
   */
  async checkPythonAvailable(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.config.pythonExecutable} --version`);
      log(`Python available: ${stdout.trim()}`, "python");
      return true;
    } catch (error) {
      console.error("[ERROR] Python not found. Install Python 3.11+ or use WSL on Windows.");
      return false;
    }
  }

  /**
   * Health check - verify Python server is responding
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${this.config.port}/health`, {
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        this.isHealthy = data.models_loaded === true;
        return this.isHealthy;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start Python server with automatic restart on failure
   */
  async start(): Promise<boolean> {
    const isPythonAvailable = await this.checkPythonAvailable();
    if (!isPythonAvailable) {
      console.warn("[WARNING] Python ML server disabled - Python not available");
      return false;
    }

    let retryCount = 0;

    while (retryCount < this.config.maxRetries) {
      try {
        log(`Starting Python ML server (attempt ${retryCount + 1}/${this.config.maxRetries})...`, "python");

        this.process = spawn(this.config.pythonExecutable, [this.config.scriptPath], {
          stdio: "pipe",
          env: {
            ...process.env,
            PYTHONUNBUFFERED: "1",
          },
        });

        // Log stdout
        this.process.stdout?.on("data", (data: Buffer) => {
          const lines = data.toString().split("\n").filter((l: string) => l.trim());
          lines.forEach((line: string) => {
            console.log(`[PYTHON] ${line}`);
          });
        });

        // Log stderr
        this.process.stderr?.on("data", (data: Buffer) => {
          const lines = data.toString().split("\n").filter((l: string) => l.trim());
          lines.forEach((line: string) => {
            console.error(`[PYTHON ERROR] ${line}`);
          });
        });

        // Handle process exit
        this.process.on("exit", (code: number) => {
          log(`Python server exited with code ${code}`, "python");
          this.isHealthy = false;

          // Auto-restart if not graceful shutdown
          if (code !== 0 && code !== null) {
            setTimeout(() => this.start(), this.config.retryDelay);
          }
        });

        // Wait for server to be ready (health check)
        await this.waitForReady(30000); // 30 second timeout

        if (this.isHealthy) {
          log("Python ML server started and models loaded successfully!", "python");
          this.startHealthCheckLoop();
          return true;
        }

        retryCount++;
        if (retryCount < this.config.maxRetries) {
          log(`Health check failed, retrying in ${this.config.retryDelay}ms...`, "python");
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        }
      } catch (error) {
        console.error(`[ERROR] Failed to start Python server: ${error}`);
        retryCount++;
        if (retryCount < this.config.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    console.error("[ERROR] Failed to start Python ML server after maximum retries");
    return false;
  }

  /**
   * Wait for Python server to be ready
   */
  private async waitForReady(timeoutMs: number): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms

    while (Date.now() - startTime < timeoutMs) {
      const isReady = await this.healthCheck();
      if (isReady) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    throw new Error("Python server health check timeout");
  }

  /**
   * Start periodic health check loop
   */
  private startHealthCheckLoop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.healthCheck();
      if (!isHealthy && this.process) {
        console.warn("[WARNING] Python server health check failed, attempting restart...");
        this.stop();
        this.start();
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Get Python server health status
   */
  isRunning(): boolean {
    return this.isHealthy && this.process !== null;
  }

  /**
   * Stop Python server gracefully
   */
  stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.process) {
      log("Stopping Python ML server...", "python");
      this.process.kill("SIGTERM");
      this.process = null;
      this.isHealthy = false;
    }
  }
}
