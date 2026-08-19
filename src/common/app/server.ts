import { Server as HttpServer } from "http";
import { Application as ExpressApp } from "express";
import { Database } from "../database/database.interface";
import { Component } from "../Component";

@Component
export class Server {
  private httpServer!: HttpServer;
  private app!: ExpressApp;

  /**
   * Only Database is injected by the container.
   * The Express app is passed separately via setApp() because Express
   * applications are created manually, not by the IoC container.
   */
  constructor(private database: Database) {}

  /** Wire the Express app — must be called before start(). */
  setApp(app: ExpressApp): void {
    this.app = app;
    this.httpServer = new HttpServer(app);
  }

  public async start(port: number) {
    try {
      await this.database.connect();
      console.log("✅ Database Connected Successfully");

      this.httpServer.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
      });

      this.registerShutdownHandlers();
    } catch (err) {
      console.error("❌ Failed to start server", err);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => {
        if (err) return reject(err);
        console.log("🛑 Server stopped");
        resolve();
      });
    });
  }

  private registerShutdownHandlers() {
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      try {
        await this.stop();
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown", err);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      shutdown("unhandledRejection");
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      shutdown("uncaughtException");
    });
  }
}
