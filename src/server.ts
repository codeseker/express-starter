import { scanComponents } from "./common/container.scan";
import Container from "./common/Container";
import { Application } from "./common/app/application";
import { Server } from "./common/app/server";
import { env } from "./common/config/env";

async function bootstrap() {
  // 1. Auto-discover every @Component / @Primary class via file scan.
  scanComponents();

  // 2. Create the Express app (middleware, routes, error handlers).
  const application = new Application();

  // 3. Let the Container create Server with Database injected.
  const server = Container.get(Server);
  server.setApp(application.getApp());

  // 4. Connect DB, start listening.
  server.start(env.PORT);
}

bootstrap();
