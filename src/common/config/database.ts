import { Database } from "@/common/database/database.interface";
import { APP_MODE_TYPE, env } from "@/common/config/env";
import mongoose from "mongoose";
import { Component } from "../Component";
import { Primary } from "../Primary";

@Component
@Primary
class MongoDBImplementation implements Database {
  private APP_MODE = env.APP_MODE;

  private MONGO_URI: Record<APP_MODE_TYPE, string | undefined> = {
    dev: env.MONGO_DEV_URI,
    prod: env.MONGO_PROD_URI,
    test: env.MONGO_TEST_URI,
  };

  async connect(): Promise<void> {
    const uri = this.MONGO_URI[this.APP_MODE];
    if (!uri)
      throw new Error(`Missing MONGO URI for APP_MODE: ${this.APP_MODE}`);

    await mongoose.connect(uri);
  }

  async close(): Promise<void> {
    await mongoose.disconnect();
  }
}

export default MongoDBImplementation;
