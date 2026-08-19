import express, { Application as ExpressApp } from "express";
import cors from "cors";
import { env } from "../config/env";
import { globalErrorHandler } from "../utils/globalException.handler";
import indexRoutes from "@/common/app/routes";
import { Component } from "../Component";

@Component
export class Application {
  private app: ExpressApp;

  constructor() {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeExceptionHandlers();
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: [
          env.FRONTEND_DEV_URI as string,
          env.FRONTEND_PROD_URI as string,
          env.FRONTEND_TEST_URI as string,
        ],
        credentials: true,
      }),
    );
    this.app.use(express.json());
  }

  private initializeRoutes() {
    this.app.use("/api/v1", indexRoutes);
  }

  private initializeExceptionHandlers() {
    this.app.use(globalErrorHandler);
  }

  public getApp(): ExpressApp {
    return this.app;
  }
}
