import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";
import { env } from "./env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(env.SERVER_PORT, env.SERVER_HOST);
  console.log("Pacinho server is running! 🚀");
}

void bootstrap();
