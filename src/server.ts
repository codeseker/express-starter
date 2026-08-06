import { Application } from "./common/app/application";
import { Server } from "./common/app/server";
import MongoDBImplementation from "./common/config/database";
import { env } from "./common/config/env";

const application = new Application();

const server = new Server(application.getApp(), new MongoDBImplementation());

server.start(env.PORT);
