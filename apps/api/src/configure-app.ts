import { mkdirSync } from "node:fs";

import type { INestApplication } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { ApiExceptionFilter } from "./common/api-exception.filter";
import { uploadDirectory } from "./common/uploads";

export function configureApp(app: INestApplication) {
  mkdirSync(uploadDirectory, { recursive: true });
  (app as NestExpressApplication).useStaticAssets(uploadDirectory, {
    prefix: "/media",
  });
  app.enableCors({ origin: true });
  app.useGlobalFilters(new ApiExceptionFilter());
}
