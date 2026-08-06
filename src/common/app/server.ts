import { Server as HttpServer } from "http";
import { Application as ExpressApp } from "express";
import { Database } from "../database/database.interface";

export class Server {
  private readonly server: HttpServer;
  private readonly app: ExpressApp;
  private readonly database: Database;

  constructor(app: ExpressApp, database: Database) {
    this.app = app;
    this.server = new HttpServer(this.app);
    this.database = database;
  }

  public async start(port: number) {
    try {
      await this.connectDependencies();

      this.server.listen(port, () => {
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
      this.server.close((err) => {
        if (err) return reject(err);
        console.log("🛑 Server stopped");
        resolve();
      });
    });
  }

  private async connectDependencies() {
    await this.connectDatabase();
  }

  private async connectDatabase() {
    await this.database.connect();
    console.log("✅ Database Connected Successfully");
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
